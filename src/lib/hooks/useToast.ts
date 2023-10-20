import { ToastMessage } from "../models";
import { createId } from "../utils/createId";
import { createStore } from "../utils/store";
import useStore from "./useStore";

const store = createStore<ToastMessage[]>([]);

const useToast = () => {
  const [toasts, setToasts] = useStore(store);

  function removeToast(id: ToastMessage["id"]) {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }

  function addToast(
    message: ToastMessage["message"],
    type: ToastMessage["type"] = "message",
    duration: ToastMessage["duration"] = 5000,
  ) {
    setToasts((prev) =>
      prev.concat({
        id: createId(),
        message,
        type,
        duration,
      }),
    );
  }

  return { toasts, removeToast, addToast };
};

export default useToast;
