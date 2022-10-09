import React from "react";
import { cx } from "../utils/joinClassNames";
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
  const [active, setActive] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const setChange = (value: number) => {
    const nextSize = Math.max(Math.min(value, max), min);
    onChange(nextSize);
  };

  const onPointerDownHandler = (ev: React.MouseEvent) => {
    const startingSize = size;
    const startingY = ev.clientY;

    setActive(true);

    function mousemoveHandler(ev: MouseEvent) {
      const y = startingY - ev.clientY;
      setChange(startingSize + y);
    }
    function mouseupHandler() {
      setActive(false);
      window.removeEventListener("mousemove", mousemoveHandler);
      window.removeEventListener("mouseup", mouseupHandler);
    }

    window.addEventListener("mousemove", mousemoveHandler);
    window.addEventListener("mouseup", mouseupHandler);
  };

  return (
    <div ref={containerRef} className={cx($.container, active && $.isActive)}>
      <div className={$.handle} onPointerDown={onPointerDownHandler}></div>
      <div style={{ height: size }}>{children}</div>
    </div>
  );
}
