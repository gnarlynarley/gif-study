import React from "react";
import { BaseButton } from "./Button";
import $ from "./FileInput.module.scss";

type Props = {
  accept: string;
  label: string;
  onFile: (file: File) => void;
};

export function FileInput({ accept, label, onFile }: Props) {
  const id = React.useId();
  return (
    <BaseButton>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        className={$.input}
        style={{ display: "none" }}
        accept={accept}
        type="file"
        onChange={(ev) => {
          const file = ev.target.files?.[0] ?? null;
          if (file) {
            onFile(file);
          }
          ev.target.value = "";
        }}
      />
    </BaseButton>
  );
}
