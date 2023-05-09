import { GifData, GifFrame } from "../models";
import { createCanvas } from "../utils/createCanvas";
import { createId } from "../utils/createId";
import filterArray from "../utils/filterArray";
import isPixelDataMatch from "../utils/isPixelDataMatch";

interface RawFrame {
  data: ImageData;
  time: number;
}

export default async function createGifDataFromVideoBlob(
  blob: Blob,
): Promise<GifData> {
  return new Promise((resolve) => {
    const path = URL.createObjectURL(blob);
    const frames: RawFrame[] = [];
    const video = document.createElement("video");
    document.body.appendChild(video);
    const renderer = createCanvas();

    video.autoplay = true;
    video.muted = true;
    video.src = path;
    video.playsInline = true;
    video.style.position = "fixed";
    video.style.top = "0px";
    video.style.left = "0px";
    video.style.pointerEvents = "none";
    video.style.opacity = "0";
    console.log(path);
    // video.playbackRate = 2;

    const frame: VideoFrameRequestCallback = (now, metadata) => {
      console.log("frame");
      const w = metadata.width;
      const h = metadata.width;
      const time = metadata.mediaTime * 1000;
      renderer.canvas.width = w;
      renderer.canvas.height = h;
      renderer.context.drawImage(video, 0, 0);
      const data = renderer.context.getImageData(0, 0, w, h);
      frames.push({ data, time });
      video.requestVideoFrameCallback(frame);
    };
    video.requestVideoFrameCallback(frame);

    video.addEventListener("play", () => {
      console.log("playing");
    });

    video.addEventListener("ended", async () => {
      const filtered = frames.filter((frame, i) => {
        const nextFrame = frames[i + 1];
        if (nextFrame && isPixelDataMatch(frame.data, nextFrame.data)) {
          return false;
        }
        return true;
      });
      const data: GifData = {
        id: createId(),
        blob: await fetch(path).then((r) => r.blob()),
        width: video.videoHeight,
        height: video.videoHeight,
        frames: filtered.map<GifFrame>((item, i, items) => {
          const prevFrame = items[i - 1];
          const delay = prevFrame ? item.time - prevFrame.time : 0;
          return {
            id: createId(),
            data: item.data,
            delay: Math.round(delay * 10000) / 10000,
          };
        }),
      };

      video.remove();
      URL.revokeObjectURL(path);

      resolve(data);
    });
  });
}
