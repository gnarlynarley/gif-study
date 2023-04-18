import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Timeline, TimelineFrame } from "./../models";
import { assert } from "./assert";
import { createCanvas } from "./createCanvas";

function createFileName(index: number) {
  return `${index}`.padStart(3, "0");
}

export async function downloadTimelineFrame(frame: TimelineFrame) {
  const { canvas, context, cleanup } = createCanvas(
    frame.data.width,
    frame.data.height,
  );
  context.putImageData(frame.data, 0, 0);
  const blob = await new Promise<Blob | null>((r) =>
    canvas.toBlob(r, "image/png"),
  );
  cleanup();
  if (blob) {
    saveAs(blob, `${createFileName(frame.index)}.png`);
  }
}

export async function downloadTimelineAsZip({ frames }: Timeline) {
  const minimalIndexCharacters = frames.length.toString().length;
  const { canvas, context, cleanup } = createCanvas();
  const entries = await Promise.all(
    frames.map(async (frame) => {
      canvas.width = frame.data.width;
      canvas.height = frame.data.height;
      context.putImageData(frame.data, 0, 0);
      const blob = await new Promise<Blob | null>((r) =>
        canvas.toBlob(r, "image/png"),
      );

      if (!blob) return null;

      let name = frame.index.toString().padStart(minimalIndexCharacters, "0");

      return {
        name: `${name}.png`,
        blob,
      };
    }),
  );

  cleanup();
  const zip = new JSZip();

  entries.forEach((entry) => {
    if (entry) {
      zip.file(entry.name, entry.blob);
    }
  });

  const content = await zip.generateAsync({ type: "blob" });
  saveAs(content, "frames.zip");
}
