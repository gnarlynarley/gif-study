import type { GifEntry, GifEntryFrame } from "$lib/types";
import createCanvas from "$lib/utils/createCanvas";
import parseGif from "$lib/utils/parseGif";
import { produce, castDraft, finishDraft } from "immer";

export const gif = $state<{ value: GifEntry | null }>({ value: null });

export async function loadGifFromFile(file: File) {
  const buffer = await file.arrayBuffer();
  gif.value = parseGif(file.name, buffer);
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

window.addEventListener("beforeunload", (e) => {
  if (gif.value === null) return;
  e.preventDefault();
});
