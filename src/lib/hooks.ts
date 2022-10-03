import localforage from "localforage";
import * as React from "react";

const keyMap: Record<string, string> = {
  " ": "space",
  ArrowRight: "right",
  ArrowLeft: "left",
};

export function useKeybind(key: string, cb: () => void) {
  const cbRef = React.useRef(cb);

  React.useEffect(() => {
    cbRef.current = cb;
  }, [cb]);

  React.useEffect(() => {
    function handler(ev: KeyboardEvent) {
      const pressedKey = keyMap[ev.key] ?? ev.key.toLowerCase();
      if (pressedKey === key) {
        cbRef.current();
      }
    }

    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, []);
}

export function useLocalForageState<T>(
  key: string,
  version: number,
  defaultState: T
) {
  const initRef = React.useRef(false);
  const [pending, setPending] = React.useState(true);
  const storageKey = `${key}::${version}`;
  const [state, setState] = React.useState<T>(defaultState);
  const debouncedState = useDebouncedValue(state, 300);

  React.useEffect(() => {
    localforage
      .getItem<T>(storageKey)
      .then((value) => {
        if (value !== null) setState(value);
      })
      .finally(() => {
        setPending(false);
      });
  }, []);

  React.useEffect(() => {
    if (initRef.current) {
      localforage.setItem(storageKey, state);
    }
  }, [debouncedState]);

  React.useEffect(() => {
    initRef.current = true;
  }, []);

  return [state, setState, pending] as const;
}

export function useDebouncedValue<T>(value: T, ms: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedValue(value);
    }, ms);

    return () => {
      clearTimeout(id);
    };
  }, [value, ms]);

  return debouncedValue;
}
