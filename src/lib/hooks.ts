import * as React from "react";

const keyMap: Record<string, string> = {
  " ": "space",
};

export function useKeybind(key: string, cb: () => void) {
  const cbRef = React.useRef(cb);

  React.useEffect(() => {
    cbRef.current = cb;
  }, [cb]);

  React.useEffect(() => {
    function handler(ev: KeyboardEvent) {
      const normalizedKey = ev.key.toLowerCase();
      const pressedKey = keyMap[normalizedKey] ?? normalizedKey;
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
