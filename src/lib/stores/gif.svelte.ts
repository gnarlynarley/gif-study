import { GifEntry, type GifEntryFrame } from "$lib/types.svelte";
import createCanvas from "$lib/utils/createCanvas";
import getFramesFromVideoFile from "$lib/utils/getFramesFromVideoFile";
import getFramesFromGifFile from "$lib/utils/getFramesFromGifFile";
import { latestFile } from "./latestFile";
import { addNotification } from "./notifications.svelte";
import getFramesFromAvifFile from "$lib/utils/getFramesFromAvifFile";

export const gif = $state<{ value: GifEntry | null }>({ value: null });
export const gifPending = $state({
  pending: false,
  progress: 0,
});

export async function loadGifFromFile(
  file: File,
  startTimestamp?: number,
  endTimestamp?: number,
) {
  try {
    gifPending.pending = true;
    gifPending.progress = 0;
    if (file.type === "image/gif") {
      latestFile.set(file);
      gif.value = await getFramesFromGifFile(file);
    } else if (file.type === "image/avif") {
      latestFile.set(file);
      gif.value = await getFramesFromAvifFile(file);
    } else if (file.type.includes("video/")) {
      latestFile.set(file);
      gif.value = await getFramesFromVideoFile(
        file,
        startTimestamp,
        endTimestamp,
        (progress) => {
          gifPending.progress = progress;
        },
      );
    }
  } catch (err) {
    if (err instanceof Error) {
      addNotification(err.message, "error");
    }
  } finally {
    gifPending.pending = false;
    gifPending.progress = 1;
  }
}

export function unloadGif() {
  gif.value = null;
}
