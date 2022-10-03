import React from "react";

type Props = React.PropsWithChildren<{
  size: number;
  min: number;
  max: number;
  onChange: (size: number) => void;
}>;

export function ResizableContainer({
  size,
  min,
  max,
  onChange,
  children,
}: Props) {
  const pointerDownRef = React.useRef(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const setChange = (value: number) => {
    const nextSize = Math.max(Math.min(value, max), min);
    onChange(nextSize);
  };

  // React.useEffect(() => {
  //   const container = containerRef.current;
  //   if (!container) return;

  //   const observer = new ResizeObserver(([entry]) => {
  //     if (!pointerDownRef.current) {
  //       setChange(entry.contentRect.height);
  //     }
  //   });
  //   observer.observe(container);

  //   return () => {
  //     observer.disconnect();
  //   };
  // }, []);

  const onPointerDownHandler = (ev: React.MouseEvent) => {
    const startingSize = size;
    const startingY = ev.clientY;

    function mousemoveHandler(ev: MouseEvent) {
      pointerDownRef.current = true;
      const y = startingY - ev.clientY;
      setChange(startingSize + y);
    }
    function mouseupHandler() {
      pointerDownRef.current = false;
      window.removeEventListener("mousemove", mousemoveHandler);
      window.removeEventListener("mouseup", mouseupHandler);
    }

    window.addEventListener("mousemove", mousemoveHandler);
    window.addEventListener("mouseup", mouseupHandler);
  };

  return (
    <div ref={containerRef} style={{ height: "100%" }}>
      <div
        onPointerDown={onPointerDownHandler}
        style={{ height: "1em", background: "red" }}
      ></div>
      <div style={{ height: size }}>{children}</div>
    </div>
  );
}
