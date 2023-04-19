import { create } from "zustand";
import { ToastMessage } from "../models";
import { createId } from "../utils/createId";

interface UseToastValue {
  toasts: ToastMessage[];
  removeToast(id: ToastMessage["id"]): void;
  addToast(
    message: ToastMessage["message"],
    type?: ToastMessage["type"],
    duration?: ToastMessage["duration"],
  ): void;
}

const useToast = create<UseToastValue>((set, get) => ({
  toasts: [],
  removeToast(id: ToastMessage["id"]) {
    set({
      toasts: get().toasts.filter((toast) => toast.id !== id),
    });
  },
  addToast(message, type = "message", duration = 5000) {
    set({
      toasts: get().toasts.concat({ id: createId(), message, type, duration }),
    });
  },
}));

export default useToast;
