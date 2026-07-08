import localforage from "localforage";
import { writable } from "svelte/store";

const LOCAL_KEY_FILE = "gif-file";

localforage.getItem<File>(LOCAL_KEY_FILE).then((file) => {
  latestFileLoading.set(false);
  latestFile.set(file);
});

export const latestFile = writable<File | null>(null);
export const latestFileLoading = writable<boolean>(true);

latestFile.subscribe((file) => {
  if (file) {
    localforage.setItem(LOCAL_KEY_FILE, file);
  } else {
    localforage.removeItem(LOCAL_KEY_FILE);
  }
});
