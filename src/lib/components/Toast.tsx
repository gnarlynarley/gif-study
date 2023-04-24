import React from "react";
import useEvent from "$lib/hooks/useEvent";
import useToast from "$lib/hooks/useToast";
import { ToastMessage } from "../models";
import { cx } from "../utils/joinClassNames";
import { IconButton } from "./IconButton";
import { CloseIcon } from "./Icons";
import $ from "./Toast.module.scss";

type Props = {
  toast: ToastMessage;
};

export function Toast({ toast }: Props) {
  const { removeToast } = useToast();
  const closeToast = useEvent(() => removeToast(toast.id));

  React.useEffect(() => {
    if (toast.duration === null) return;
    const id = setTimeout(() => removeToast(toast.id), toast.duration);

    return () => {
      clearTimeout(id);
    };
  }, [toast.id, toast.duration]);

  return (
    <div
      key={`${toast.id}::${toast.duration}`}
      className={cx(
        $.container,
        toast.type === "error" && $.isError,
        toast.duration === null && $.hasNoDuration,
      )}
      style={{ ["--duration" as any]: toast.duration }}
    >
      <div className={$.content}>
        {typeof toast.message === "string" ? (
          <p>{toast.message}</p>
        ) : (
          toast.message
        )}
      </div>
      <button
        className={$.button}
        type="button"
        onClick={closeToast}
        title={"close toast"}
      >
        <CloseIcon />
      </button>
    </div>
  );
}

export default Toast;
