import React from "react";
import $ from "./Button.module.scss";

type BaseButtonProps = React.PropsWithChildren<{
  element?: JSX.Element;
}>;

type ButtonProps = React.PropsWithChildren<{
  onClick: () => void;
  icon?: JSX.Element;
}>;

export function BaseButton({ children, element = <span /> }: BaseButtonProps) {
  return React.cloneElement(element, {
    className: $.button,
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
      <span className={$.icon}>{icon}</span>
      <span>{children}</span>
    </BaseButton>
  );
}
