import React from "react";
import $ from "./IconButton.module.scss";
import { cx } from "../utils/joinClassNames";

type Props = React.PropsWithChildren<{
  primary?: boolean;
  label: string;
  onClick?: () => void;
}>;

export function IconLink(props: React.ComponentProps<"a">) {
  return <a {...props} className={$.button} />;
}

export function IconButton({ children, primary, label, onClick }: Props) {
  return (
    <button
      className={cx($.button, primary && $.isPrimary)}
      type="button"
      title={label}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
