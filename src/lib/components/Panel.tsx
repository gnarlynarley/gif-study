import { cx } from "../utils/joinClassNames";
import $ from "./Panel.module.scss";

type Props = React.PropsWithChildren<{ solid?: boolean }>;

export default function Panel({ children, solid }: Props) {
  return <div className={cx($.container, solid && $.isSolid)}>{children}</div>;
}
