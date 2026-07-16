import { GifEntry, type GifEntryFrame } from "$lib/types.svelte";
import createCanvas from "./createCanvas";
import getFilename from "./getFilename";
import imageDataEquals from "./imageDataEquals";

export default async function getFramesFromAvifFile(
  file: File,
): Promise<GifEntry> {
  if (!("ImageDecoder" in window)) {
    throw new Error("ImageDecoder API not supported in this browser");
  }

  const buffer = await file.arrayBuffer();
  const decoder = new ImageDecoder({
    data: buffer,
    type: "image/avif",
    preferAnimation: true,
  });

  await decoder.tracks.ready;
  const track = decoder.tracks.selectedTrack;
  const frameCount = track?.frameCount ?? 1;

  const frames: GifEntryFrame[] = [];
  let lastImageData: ImageData | null = null;
  let index = 0;

  for (let i = 0; i < frameCount; i++) {
    const { image } = await decoder.decode({ frameIndex: i });

    const width = image.displayWidth;
    const height = image.displayHeight;

    const [canvas, context] = createCanvas(width, height);
    const delay = (image.duration ?? 0) / 1000;
    context.drawImage(image, 0, 0);
    const imageData = context.getImageData(0, 0, width, height);

    if (lastImageData && imageDataEquals(lastImageData, imageData)) {
      frames[frames.length - 1].delay += delay;
    } else {
      frames.push({
        canvas,
        delay,
        sketch: null,
        width,
        height,
        index,
      });
      lastImageData = imageData;
      index += 1;
    }

    image.close();
  }

  decoder.close();

  const first = frames.at(0);

  if (!first) throw new Error("No frames extracted");

  return new GifEntry({
    name: getFilename(file.name),
    frames,
    width: first.width,
    height: first.height,
  });
}
