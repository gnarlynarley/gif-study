import React from "react";
import ReactDOM from "react-dom";

type Props = React.PropsWithChildren;

const container = document.createElement("div");
document.body.appendChild(container);

export default function Portal({ children }: Props) {
  return ReactDOM.createPortal(children, container);
}
