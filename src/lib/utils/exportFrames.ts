import type { GifEntry, GifEntryFrame } from "$lib/types.svelte";
import downloadFile from "./downloadFile";
import { flattenFrame } from "./flattenFrames";

async function createFileFromFrame(
  frame: GifEntryFrame,
  gif: GifEntry,
  index: number,
) {
  const { canvas } = flattenFrame(gif, frame);
  const blob = await new Promise<Blob | null>((r) =>
    canvas.toBlob(r, "image/png"),
  );
  if (!blob) return null;
  const frameString = (index + 1).toString().padStart(4, "0");
  const fileName = `${frameString} - ${frame.delay}ms.png`;
  return new File([blob], fileName);
}

export default async function exportFrames(gif: GifEntry) {
  const zipFilesPromise = import("./zipFiles");
  const files = await Promise.all(
    gif.trimmedFrames.map((frame, index) =>
      createFileFromFrame(frame, gif, index),
    ),
  );
  const filtered = files.filter((file) => file !== null);
  const zipFiles = (await zipFilesPromise).default;
  const zipFile = await zipFiles(`frames - ${gif.name}.zip`, filtered);

  await downloadFile(zipFile);
}
