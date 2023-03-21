import * as React from "react";

const keyMap: Record<string, string> = {
  " ": "space",
  ArrowRight: "right",
  ArrowLeft: "left",
};

export default function useKeyboard(key: string, cb: () => void) {
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
