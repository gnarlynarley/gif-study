import type { ParsedGif, ParsedGifFrame } from "$lib/types";
import createCanvas from "./createCanvas";
import downloadFile from "./downloadFile";

async function createFileFromFrame(
  frame: ParsedGifFrame,
  gif: ParsedGif,
  index: number,
) {
  const [canvas, context] = createCanvas(frame.width, frame.height);

  context.fillStyle = "white";
  context.fillRect(0, 0, frame.width, frame.height);
  context.globalAlpha = gif.opacity;
  context.drawImage(frame.canvas, 0, 0);
  context.globalAlpha = 1;
  if (frame.sketch) {
    context.drawImage(frame.sketch.canvas, 0, 0);
  }

  const blob = await new Promise<Blob | null>((r) =>
    canvas.toBlob(r, "image/png"),
  );
  if (!blob) return null;
  const frameString = (index + 1).toString().padStart(4, "0");
  const fileName = `${frameString} - ${frame.delay}ms.png`;
  return new File([blob], fileName);
}

export default async function exportFrames(gif: ParsedGif) {
  const zipFilesPromise = import("./zipFiles");
  const files = await Promise.all(
    gif.frames.map((frame, index) => createFileFromFrame(frame, gif, index)),
  );
  const filtered = files.filter((file) => file !== null);
  const zipFiles = (await zipFilesPromise).default;
  const zipFile = await zipFiles(`frames - ${gif.name}.zip`, filtered);

  await downloadFile(zipFile);
}
