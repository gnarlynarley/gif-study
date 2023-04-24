import $ from "./Panel.module.scss";

type Props = React.PropsWithChildren;

export default function Panel({ children }: Props) {
  return <div className={$.container}>{children}</div>;
}
