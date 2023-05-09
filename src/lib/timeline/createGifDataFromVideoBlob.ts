import { GifData, GifFrame } from "../models";
import { createCanvas } from "../utils/createCanvas";
import { createId } from "../utils/createId";
import isPixelDataMatch from "../utils/isPixelDataMatch";
import noop from "../utils/noop";

interface RawFrame {
  data: ImageData;
  time: number;
}

const TRIM_START = 0;
const TRIM_END = 10;

export default async function createGifDataFromVideoBlob(
  blob: Blob,
  onProgress: (progress: number) => void = noop,
): Promise<GifData> {
  return new Promise((resolve) => {
    const path = URL.createObjectURL(blob);
    const rawFrames: RawFrame[] = [];
    const video = document.createElement("video");
    const renderer = createCanvas();

    let w = 0;
    let h = 0;
    let trimEnd = TRIM_END;

    video.muted = true;
    video.src = path;

    const delta = 1000 / 24;

    const progressFrame = () => {
      video.currentTime += delta / 1000;
    };

    const getFrame = () => {
      renderer.context.drawImage(video, 0, 0);
      const data = renderer.context.getImageData(0, 0, w, h);
      rawFrames.push({ data, time: video.currentTime * 1000 });
      onProgress(video.currentTime / trimEnd);
    };

    video.addEventListener("loadedmetadata", () => {
      w = video.videoWidth;
      h = video.videoHeight;
      trimEnd = Math.min(video.duration, TRIM_END);
      video.width = w;
      video.height = h;
      renderer.canvas.width = w;
      renderer.canvas.height = h;
      video.currentTime = TRIM_START;
      getFrame();
      progressFrame();
    });

    video.addEventListener("seeked", async () => {
      if (video.currentTime < trimEnd) {
        progressFrame();
        getFrame();
      } else {
        const filtered = rawFrames.filter((item, i, items) => {
          const nextItem = items[i + 1];
          if (nextItem && isPixelDataMatch(item.data, nextItem.data)) {
            return false;
          }
          return true;
        });
        const frames = filtered.map<GifFrame>((item, i, items) => {
          const prevFrame = items[i - 1];
          const delay = prevFrame ? item.time - prevFrame.time : 0;
          return {
            id: createId(),
            data: item.data,
            delay: Math.round(delay * 10000) / 10000,
          };
        });
        const data: GifData = {
          id: createId(),
          blob: await fetch(path).then((r) => r.blob()),
          width: video.videoHeight,
          height: video.videoHeight,
          frames,
        };

        video.remove();
        URL.revokeObjectURL(path);

        resolve(data);
      }
    });
  });
}
