import * as React from "react";

export default function useEvent<T, A extends any[]>(cb: (...args: A) => T) {
  const cbRef = React.useRef(cb);

  React.useEffect(() => {
    cbRef.current = cb;
  });

  const handler = React.useCallback((...args: A) => {
    cbRef.current(...args);
  }, []);

  return handler;
}
