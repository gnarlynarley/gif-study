import type { GifEntry, GifEntryFrame } from "$lib/types.svelte";
import createCanvas from "$lib/utils/createCanvas";
import parseGif from "$lib/utils/parseGif";
import localforage from "localforage";
import { writable } from "svelte/store";

const LOCAL_KEY_FILE = "gif-file";

localforage.getItem<File>(LOCAL_KEY_FILE).then((file) => {
  localGifLoading.set(false);
  if (file) loadGifFromFile(file);
});

export const localGifLoading = writable(true);

export const gif = $state<{ value: GifEntry | null }>({ value: null });

export async function loadGifFromFile(file: File) {
  try {
    localGifLoading.set(true);

    await localforage.setItem(LOCAL_KEY_FILE, file);
    const buffer = await file.arrayBuffer();
    gif.value = parseGif(file.name, buffer);
  } finally {
    localGifLoading.set(false);
  }
}

export async function updateFrameSketch(
  canvas: HTMLCanvasElement | null,
  { index, width, height }: GifEntryFrame,
) {
  if (!canvas) return;
  const draft = gif.value;
  if (!draft) return;
  const frame = draft.frames.at(index);
  if (!frame) return;
  if (!frame.sketch) {
    const [canvas, context] = createCanvas(width, height);
    frame.sketch = { canvas, context };
  }
  frame.sketch.context.clearRect(0, 0, width, height);
  frame.sketch.context.drawImage(canvas, 0, 0);
  frame.sketch = { ...frame.sketch };
}

export function unloadGif() {
  gif.value = null;
  localforage.removeItem(LOCAL_KEY_FILE);
}
