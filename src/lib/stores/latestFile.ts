import { get, set, del, keys } from "idb-keyval";
import { writable } from "svelte/store";

const LOCAL_KEY_FILE = "gif-file";

get<File>(LOCAL_KEY_FILE).then((file) => {
  latestFileLoading.set(false);
  latestFile.set(file ?? null);
});

export const latestFile = writable<File | null>(null);
export const latestFileLoading = writable<boolean>(true);

latestFile.subscribe((file) => {
  if (file) {
    set(LOCAL_KEY_FILE, file);
  } else {
    del(LOCAL_KEY_FILE);
  }
});
