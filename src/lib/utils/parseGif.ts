import type { ParsedGif, ParsedGifFrame } from "$lib/types";
import { parseGIF, decompressFrames } from "gifuct-js";
import createCanvas from "./createCanvas";
import getFilename from "./getFilename";

function imageDataEquals(a: ImageData, b: ImageData): boolean {
  const aPixels = new Uint32Array(a.data.buffer);
  const bPixels = new Uint32Array(b.data.buffer);

  for (let i = 0; i < aPixels.length; i++) {
    if (aPixels[i] === bPixels[i]) continue;

    const aAlpha = a.data[i * 4 + 3];
    const bAlpha = b.data[i * 4 + 3];
    if (aAlpha === 0 && bAlpha === 0) continue;

    return false;
  }
  return true;
}

export default function parseGif(name: string, buffer: ArrayBuffer): ParsedGif {
  const gif = parseGIF(buffer);
  const gifFrames = decompressFrames(gif, true);

  const { width, height } = gif.lsd;

  const [workCanvas, workCtx] = createCanvas(width, height);
  const [patchCanvas, patchCtx] = createCanvas();
  const frames: ParsedGifFrame[] = [];
  let previousImageData: ImageData | null = null;
  let lastKeptImageData: ImageData | null = null;
  let frameNumber = 0;
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

    const currentImageData = workCtx.getImageData(0, 0, width, height);

    if (
      lastKeptImageData &&
      imageDataEquals(currentImageData, lastKeptImageData)
    ) {
      frames[frames.length - 1].delay += frame.delay;
    } else {
      const [frameCanvas, frameContext] = createCanvas(width, height);
      frameContext.putImageData(currentImageData, 0, 0);

      frameNumber++;
      frames.push({
        width,
        height,
        delay: frame.delay,
        canvas: frameCanvas,
        sketch: null,
        frameNumber,
      });

      lastKeptImageData = currentImageData;
    }

    // Apply disposal AFTER snapshotting, to prep workCanvas for the next frame
    if (frame.disposalType === 2) {
      workCtx.clearRect(dims.left, dims.top, dims.width, dims.height);
    } else if (frame.disposalType === 3 && previousImageData) {
      workCtx.putImageData(previousImageData, 0, 0);
    }
  }

  return {
    name: getFilename(name),
    width,
    height,
    frames,
    opacity: 1,
  };
}
