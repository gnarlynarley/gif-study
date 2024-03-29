import React from "react";
import localforage from "localforage";

export default function usePersistedState<T>(
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

export function usePreviousValue<T>(value: T): T | null {
  const ref = React.useRef<T | null>(null);
  const initialLoadRef = React.useRef(false);

  React.useEffect(() => {
    if (initialLoadRef.current) {
      ref.current = value;
    } else {
      initialLoadRef.current = true;
    }
  }, [value]);

  return ref.current;
}

export function useValueRef<T>(value: T): React.MutableRefObject<T> {
  const ref = React.useRef(value);

  React.useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
}
