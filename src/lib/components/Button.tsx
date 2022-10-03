import React from "react";
import $ from "./Button.module.scss";

type BaseButtonProps = React.PropsWithChildren<{
  element?: JSX.Element;
}>;

type ButtonProps = React.PropsWithChildren<{
  onClick: () => void;
}>;

export function BaseButton({ children, element = <span /> }: BaseButtonProps) {
  return React.cloneElement(element, {
    className: $.button,
    children,
  });
}

export function Button({ children, onClick }: ButtonProps) {
  return (
    <BaseButton
      element={
        <button className={$.button} type="button" onClick={onClick}></button>
      }
    >
      {children}
    </BaseButton>
  );
}
