import type { GifEntry } from "$lib/types.svelte";
import { GIFEncoder, quantize, applyPalette } from "gifenc";
import flattenFrames from "./flattenFrames";

export default function createGifFile(gif: GifEntry) {
  const frames = flattenFrames(gif);
  const encoder = GIFEncoder();

  for (const frame of frames) {
    const context = frame.canvas.getContext("2d")!;
    const { width, height } = frame.canvas;
    const imageData = context.getImageData(0, 0, width, height);

    const palette = quantize(imageData.data, 256);
    const indexedPixels = applyPalette(imageData.data, palette);
    encoder.writeFrame(indexedPixels, width, height, {
      palette,
      delay: frame.delay,
      transparent: false,
    });
  }

  encoder.finish();
  const bytes = encoder.bytes();
  return new File([bytes], "preview.gif");
}
