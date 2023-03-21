import { atom, useRecoilState } from "recoil";
import { ToastMessage } from "../models";
import { createId } from "../utils/createId";

const toastsAtom = atom<ToastMessage[]>({
  key: "toasts",
  default: [],
});

export default function useToast() {
  const [toasts, setToasts] = useRecoilState(toastsAtom);

  const removeToast = (id: ToastMessage["id"]) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const addToast = (
    message: ToastMessage["message"],
    type: ToastMessage["type"] = "message",
    duration: ToastMessage["duration"] = 5000
  ) => {
    setToasts((prev) =>
      prev.concat({ id: createId(), message, type, duration })
    );
  };

  return { toasts, addToast, removeToast };
}
