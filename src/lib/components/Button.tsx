import React from "react";
import { cx } from "../utils/joinClassNames";
import $ from "./Button.module.scss";

type BaseButtonProps = React.PropsWithChildren<{
  element?: JSX.Element;
  disabled?: boolean;
}>;

type ButtonProps = React.PropsWithChildren<{
  onClick: () => void;
  icon?: JSX.Element;
}>;

export function BaseButton({
  children,
  disabled,
  element = <span />,
}: BaseButtonProps) {
  return React.cloneElement(element, {
    className: cx($.button, disabled && $.isDisabled),
    children,
  });
}

export function Button({ icon, children, onClick }: ButtonProps) {
  return (
    <BaseButton
      element={
        <button className={$.button} type="button" onClick={onClick}></button>
      }
    >
      {icon && <span className={$.icon}>{icon}</span>}
      <span className={$.content}>{children}</span>
    </BaseButton>
  );
}
