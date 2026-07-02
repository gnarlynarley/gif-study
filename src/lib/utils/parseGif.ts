import type { ParsedGif, ParsedGifFrame } from '$lib/models';
import { parseGIF, decompressFrames } from 'gifuct-js';
import { createContext } from 'svelte';
import createCanvas from './createCanvas';

export default function parseGif(buffer: ArrayBuffer): ParsedGif {
  const gif = parseGIF(buffer);
  const gifFrames = decompressFrames(gif, true);

  const { width, height } = gif.lsd;

  const [workCanvas, workCtx] = createCanvas(width, height);
  const [patchCanvas, patchCtx] = createCanvas();
  const frames: ParsedGifFrame[] = [];
  let previousImageData: ImageData | null = null;

  for (const frame of gifFrames) {
    const { dims } = frame;

    if (frame.disposalType === 3) {
      previousImageData = workCtx.getImageData(0, 0, width, height);
    }

    patchCanvas.width = dims.width;
    patchCanvas.height = dims.height;
    const patchImageData = new ImageData(
      new Uint8ClampedArray(frame.patch),
      dims.width,
      dims.height,
    );
    patchCtx.putImageData(patchImageData, 0, 0);

    workCtx.drawImage(patchCanvas, dims.left, dims.top);

    const [frameCanvas, frameContext] = createCanvas(width, height);

    frameContext.drawImage(workCanvas, 0, 0);
    const [sketchCanvas, sketchContext] = createCanvas(width, height);
    frames.push({
      width,
      height,
      delay: frame.delay,
      canvas: frameCanvas,
      sketchCanvas,
      sketchContext,
    });

    // Apply disposal AFTER snapshotting, to prep workCanvas for the next frame
    if (frame.disposalType === 2) {
      workCtx.clearRect(dims.left, dims.top, dims.width, dims.height);
    } else if (frame.disposalType === 3 && previousImageData) {
      workCtx.putImageData(previousImageData, 0, 0);
    }
  }

  return {
    width,
    height,
    frames,
  };
}
