import React from "react";
import { cx } from "../utils/joinClassNames";
import $ from "./DropZone.module.scss";

type Props = React.PropsWithChildren<{
  disabled?: boolean;
  onFileDrop: (file: File) => void;
  onInvalid?: () => void;
}>;

export function DropZone({
  onFileDrop,
  onInvalid,
  disabled,
  children,
}: Props) {
  const [active, setActive] = React.useState(false);

  return (
    <div
      className={cx($.container, active && $.isActive)}
      onDrop={async (ev) => {
        ev.preventDefault();
        if (disabled) return;
        setActive(false);

        const file = ev.dataTransfer.items[0]?.getAsFile() ?? null;
        if (file) {
          try {
            await onFileDrop(file);
          } catch {
            onInvalid?.();
          }
        }
      }}
      onDragOver={(ev) => {
        ev.preventDefault();
        if (disabled) return;

        setActive(true);
      }}
      onDragLeave={() => {
        setActive(false);
      }}
    >
      <div className={$.inner}>{children}</div>
    </div>
  );
}
