import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Timeline } from "./../models";
import { assert } from "./assert";

function createFileName(index: number) {
  return `${index}`.padStart(3, "0");
}

export async function downloadTimelineAsZip(timeline: Timeline) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  assert(context);
  const entries = await Promise.all(
    timeline.frames.map(async (frame) => {
      canvas.width = frame.data.width;
      canvas.height = frame.data.height;
      context.putImageData(frame.data, 0, 0);
      const blob = await new Promise<Blob | null>((r) =>
        canvas.toBlob(r, "image/png")
      );

      if (!blob) return null;

      return {
        name: `${createFileName(frame.number)}.png`,
        blob,
      };
    })
  );

  const zip = new JSZip();

  entries.forEach((entry) => {
    if (entry) {
      zip.file(entry.name, entry.blob);
    }
  });

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "frames.zip");
}
