import { GifData, GifFrame } from "~src/lib/models";
import { GifReader } from "omggif";
import { createId } from "../utils/createId";
import { createCanvas } from "../utils/createCanvas";
import isPixelDataMatch from "../utils/isPixelDataMatch";
import createGifDataFromVideoBlob from "./createGifDataFromVideoBlob";

export default async function createGifDatafromBlob(
  blob: Blob,
  onProgress: (progress: number) => void,
): Promise<GifData> {
  if (/^video/.test(blob.type)) {
    return createGifDataFromVideoBlob(blob, onProgress);
  }
  if (blob.type !== "image/gif") throw new Error("Unsupported blob.");
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);
  const reader = new GifReader(buffer);
  const { width, height } = reader;
  const renderCanvas = createCanvas(width, height);
  const frameCanvas = createCanvas(width, height);
  const frames: GifFrame[] = [];

  for (let i = 0; i < reader.numFrames(); i += 1) {
    const data = new Uint8ClampedArray(width * height * 4);
    const imageData = new ImageData(data, width, height);
    const info = reader.frameInfo(i);
    if (info.disposal === 2) {
      renderCanvas.clear();
    }
    reader.decodeAndBlitFrameRGBA(i, data);
    frameCanvas.context.putImageData(imageData, 0, 0);
    renderCanvas.context.drawImage(frameCanvas.canvas, 0, 0);

    frames.push({
      id: createId(),
      delay: info.delay * 10,
      data: renderCanvas.context.getImageData(0, 0, width, height),
    });
  }

  let frameIndex = 0;
  let acc = 0;
  const filteredframes = frames.flatMap<GifFrame>((frame, i) => {
    const nextFrame = frames.at(i + 1);
    if (nextFrame && isPixelDataMatch(frame.data, nextFrame.data)) {
      acc += frame.delay;
      return [];
    }

    const delay = frame.delay + acc;
    acc = 0;
    return {
      ...frame,
      delay,
    };
  });

  return {
    id: createId(),
    width,
    height,
    frames: filteredframes,
    blob,
  };
}
