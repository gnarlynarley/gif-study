import React from "react";
import { cx } from "../utils/joinClassNames";
import $ from "./DropZone.module.scss";

type Props = React.PropsWithChildren<{
  accept: string;
  disabled?: boolean;
  onFileDrop: (file: File) => void;
}>;

export function DropZone({ accept, onFileDrop, disabled, children }: Props) {
  const [active, setActive] = React.useState(false);

  return (
    <div
      className={cx($.container, active && $.isActive)}
      onDrop={(ev) => {
        ev.preventDefault();
        if (disabled) return;
        setActive(false);

        const file = ev.dataTransfer.items[0]?.getAsFile() ?? null;
        if (file && file.type === accept) {
          onFileDrop(file);
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
      {children}
    </div>
  );
}
