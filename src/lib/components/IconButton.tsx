import $ from "./IconButton.module.scss";

type Props = React.PropsWithChildren<{
  label: string;
  onClick: () => void;
}>;

export function IconButton({ children, label, onClick }: Props) {
  return (
    <button className={$.button} type="button" title={label} onClick={onClick}>
      {children}
    </button>
  );
}
