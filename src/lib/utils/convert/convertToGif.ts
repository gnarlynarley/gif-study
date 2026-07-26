import type { GifEntry } from "$lib/types.svelte";
import flattenFrames from "../flattenFrames";
import type {
  ConvertToGifRequest,
  ConvertToGifResponse,
} from "./convertToGif.worker";

function getFrameRgba(canvas: HTMLCanvasElement): Uint8ClampedArray {
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not get 2d context from canvas");
  return context.getImageData(0, 0, canvas.width, canvas.height).data;
}

function runGifWorker({
  request,
  signal,
  onProgress,
}: {
  request: ConvertToGifRequest;
  signal: AbortSignal;
  onProgress: (progress: number | null) => void;
}): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL("./convertToGif.worker.ts", import.meta.url),
      {
        type: "module",
      },
    );

    worker.onmessage = (event: MessageEvent<ConvertToGifResponse>) => {
      switch (event.data.type) {
        case "success": {
          worker.terminate();
          resolve(event.data.bytes);
          break;
        }
        case "error": {
          worker.terminate();
          reject(new Error(event.data.message));
          break;
        }
        case "progress": {
          onProgress(event.data.progress);
          break;
        }
      }
    };

    worker.onerror = (event) => {
      worker.terminate();
      reject(new Error(event.message));
    };

    worker.postMessage(request, request.frameBuffers);

    signal.throwIfAborted();
    signal.addEventListener("abort", () => {
      worker.terminate();
    });
  });
}

export default async function convertToGif({
  gif,
  signal,
  onProgress,
}: {
  gif: GifEntry;
  signal: AbortSignal;
  onProgress: (progress: number | null) => void;
}): Promise<File> {
  try {
    onProgress(0);
    signal.throwIfAborted();
    const frames = flattenFrames(gif);
    const width = gif.width;
    const height = gif.height;

    const frameBuffers = frames.map((frame) => {
      const rgba = getFrameRgba(frame.canvas);
      return rgba.buffer.slice(
        rgba.byteOffset,
        rgba.byteOffset + rgba.byteLength,
      );
    });
    const delays = frames.map((frame) => frame.delay);

    const bytes = await runGifWorker({
      request: { width, height, delays, frameBuffers },
      signal,
      onProgress,
    });

    signal.throwIfAborted();

    return new File([bytes], "animation.gif", { type: "image/gif" });
  } finally {
    onProgress(null);
  }
}
