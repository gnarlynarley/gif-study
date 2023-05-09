import React from "react";

export default function useFullscreen() {
  const [enabled, setEnabled] = React.useState(
    () => !!document.fullscreenElement,
  );
  const toggle = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  React.useEffect(() => {
    const abortController = new AbortController();

    document.addEventListener(
      "fullscreenchange",
      () => {
        setEnabled(!!document.fullscreenElement);
      },
      {
        signal: abortController.signal,
      },
    );

    return () => {
      abortController.abort();
    };
  }, []);

  return { enabled, toggle };
}
