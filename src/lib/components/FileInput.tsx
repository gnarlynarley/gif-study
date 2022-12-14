import React from "react";
import { BaseButton } from "./Button";
import $ from "./FileInput.module.scss";

type Props = {
  accept: string;
  disabled?: boolean;
  label: string;
  onFile: (file: File) => void;
  onInvalid?: () => void;
};

export function FileInput({
  accept,
  disabled,
  label,
  onFile,
  onInvalid,
}: Props) {
  const id = React.useId();
  return (
    <BaseButton disabled={disabled}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        className={$.input}
        style={{ display: "none" }}
        accept={accept}
        type="file"
        onChange={(ev) => {
          if (disabled) return;
          const file = ev.target.files?.[0] ?? null;
          if (file) {
            if (file.type === accept) {
              onFile(file);
            } else {
              onInvalid?.();
            }
          }
          ev.target.value = "";
        }}
      />
    </BaseButton>
  );
}
