import type { GifEntry, GifEntryFrame } from "$lib/types.svelte";
import createCanvas from "./createCanvas";

export function flattenFrame(gif: GifEntry, frame: GifEntryFrame) {
  const [canvas, context] = createCanvas(frame.width, frame.height);

  context.fillStyle = gif.backgroundColor;
  context.fillRect(0, 0, frame.width, frame.height);
  context.globalAlpha = gif.opacity;
  context.drawImage(frame.canvas, 0, 0);
  context.globalAlpha = 1;
  const sketch = gif.getSketch(frame);
  if (sketch) {
    context.drawImage(sketch.canvas, 0, 0);
  }

  return { canvas, delay: frame.delay };
}

export default function flattenFrames(gif: GifEntry) {
  return gif.trimmedFrames.map((frame) => flattenFrame(gif, frame));
}
