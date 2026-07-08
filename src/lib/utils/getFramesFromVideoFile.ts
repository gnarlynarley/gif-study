import getFilename from "./getFilename";
import createCanvas from "./createCanvas";
import imageDataEquals from "./imageDataEquals";

interface ExtractedVideo {
  name: string;
  width: number;
  height: number;
  frames: ExtractedFrame[];
}

interface ExtractedFrame {
  canvas: HTMLCanvasElement;
  timestamp: number;
  delay: number;
  width: number;
  height: number;
}

export default async function getFramesFromVideoFile(
  file: File,
): Promise<ExtractedVideo> {
  const { Input, ALL_FORMATS, BlobSource, VideoSampleSink } =
    await import("mediabunny");

  const input = new Input({
    formats: ALL_FORMATS,
    source: new BlobSource(file),
  });

  const videoTrack = await input.getPrimaryVideoTrack();
  if (!videoTrack) {
    throw new Error("No video track found in this file");
  }

  const decodable = await videoTrack.canDecode();
  if (!decodable) {
    throw new Error(
      "This video codec is not supported for decoding in this browser",
    );
  }

  const sink = new VideoSampleSink(videoTrack);
  const frames: ExtractedFrame[] = [];
  let lastKeptImageData: ImageData | null = null;

  for await (const sample of sink.samples()) {
    const [canvas, context] = createCanvas(
      sample.displayWidth,
      sample.displayHeight,
    );

    sample.draw(context, 0, 0);
    const currentImageData = context.getImageData(
      0,
      0,
      sample.displayWidth,
      sample.displayHeight,
    );

    const delay = sample.duration * 1000;

    if (
      lastKeptImageData &&
      imageDataEquals(currentImageData, lastKeptImageData)
    ) {
      frames[frames.length - 1].delay += delay;
    } else {
      frames.push({
        canvas,
        timestamp: sample.timestamp,
        delay,
        width: sample.displayWidth,
        height: sample.displayHeight,
      });
      lastKeptImageData = currentImageData;
    }

    sample.close();
  }

  const firstFrame = frames.at(0);

  if (!firstFrame)
    throw new Error("Not able to retrieve frames from video file");

  const result = {
    name: getFilename(file.name),
    width: firstFrame.width,
    height: firstFrame.height,
    frames,
  };

  return result;
}
