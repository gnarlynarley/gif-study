import React from "react";
import $ from "./ResizableContainer.module.scss";

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
    <div ref={containerRef} className={$.container} style={{ height: "100%" }}>
      <div
        className={$.handle}
        onPointerDown={onPointerDownHandler}
      ></div>
      <div style={{ height: size }}>{children}</div>
    </div>
  );
}
