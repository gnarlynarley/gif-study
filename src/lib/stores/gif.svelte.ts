import { GifEntry, type GifEntryFrame } from "$lib/types.svelte";
import createCanvas from "$lib/utils/createCanvas";
import getFramesFromVideoFile from "$lib/utils/getFramesFromVideoFile";
import parseGif from "$lib/utils/parseGif";
import { writable } from "svelte/store";
import { latestFile } from "./latestFile";

export const gifPending = writable(false);

export const gif = $state<{ value: GifEntry | null }>({ value: null });

export async function loadGifFromFile(file: File) {
  try {
    gifPending.set(true);
    if (file.type === "image/gif") {
      latestFile.set(file);
      const buffer = await file.arrayBuffer();
      gif.value = parseGif(file.name, buffer);
    } else if (file.type.includes("video/")) {
      latestFile.set(file);
      const extracted = await getFramesFromVideoFile(file);
      const parsed = new GifEntry({
        name: extracted.name,
        width: extracted.width,
        height: extracted.height,
        frames: extracted.frames.map((frame, index) => ({
          width: frame.width,
          height: frame.height,
          delay: frame.delay,
          canvas: frame.canvas,
          index: index,
          sketch: null,
        })),
      });
      gif.value = parsed;
    }
  } finally {
    gifPending.set(false);
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
}
