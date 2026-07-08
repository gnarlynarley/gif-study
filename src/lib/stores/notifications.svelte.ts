import createId from "$lib/utils/createId";
import { writable } from "svelte/store";

export type NotificationType = "message" | "error";
export type NotificationEntry = {
  id: string;
  message: string;
  duration: number;
  type: NotificationType;
};

export const notificationsStore = writable<NotificationEntry[]>([]);

export function addNotification(
  message: string,
  type: NotificationType = "message",
  duration: number = 3000,
) {
  const notification: NotificationEntry = {
    id: createId(),
    message,
    duration,
    type,
  };
  notificationsStore.update((value) => value.concat(notification));
}

export function removeNotification(id: string) {
  notificationsStore.update((value) => value.filter((n) => n.id !== id));
}
