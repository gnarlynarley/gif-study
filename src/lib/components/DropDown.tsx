import React from "react";
import { IconButton } from "./IconButton";
import { MoreIcon } from "./Icons";
import $ from "./DropDown.module.scss";

type Props = React.PropsWithChildren<{}>;

export function DropDown({ children }: Props) {
  const [active, setActive] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const toggleActive = () => setActive(!active);

  React.useEffect(() => {
    if (!active) return;
    function handler(ev: MouseEvent) {
      if (ev.target && containerRef.current?.contains(ev.target as any)) return;
      setActive(false);
      document.removeEventListener("pointerdown", handler);
    }

    document.addEventListener("pointerdown", handler);

    return () => {
      document.removeEventListener("pointerdown", handler);
    };
  }, [active]);

  return (
    <div ref={containerRef} className={$.container}>
      <IconButton label="Open for more options" onClick={toggleActive}>
        <MoreIcon />
      </IconButton>
      {active && <div className={$.dropdown}>{children}</div>}
    </div>
  );
}
