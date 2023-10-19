import { GifReader } from "omggif";
import { createId } from "../utils/createId";
import { createCanvas } from "../utils/createCanvas";
import isPixelDataMatch from "../utils/isPixelDataMatch";
import { Timeline, TimelineFrame } from "../models";

interface GifFrame {
  id: string;
  data: ImageData;
  delay: number;
}

interface GifData {
  id: string;
  blob: Blob;
  frames: GifFrame[];
  width: number;
  height: number;
}

async function createGifDatafromBlob(blob: Blob): Promise<GifData> {
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

export default async function createTimelineFromGifBlob(
  blob: Blob,
): Promise<Timeline> {
  const data = await createGifDatafromBlob(blob);
  let time = 0;
  const frames = data.frames.map((frame, index): TimelineFrame => {
    time += frame.delay;
    return {
      id: frame.id,
      data: frame.data,
      duration: frame.delay,
      time: time - frame.delay,
      width: frame.data.width,
      height: frame.data.height,
      index,
    };
  });
  const lastFrame = frames[frames.length - 1];
  const totalTime = lastFrame.time + lastFrame.duration;

  return {
    version: "1",
    fileType: "gif",
    id: data.id,
    gifBlob: data.blob,
    frames,
    totalTime,
    width: data.width,
    height: data.height,
    trimStart: 0,
    trimEnd: totalTime,
  };
}
