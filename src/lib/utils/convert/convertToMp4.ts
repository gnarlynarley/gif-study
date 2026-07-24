import type { GifEntry } from "$lib/types.svelte";
import createCanvas from "../createCanvas";
import flattenFrames from "../flattenFrames";

export default async function convertToMp4({
  gif,
  loops = 1,
  onProgress,
  signal,
}: {
  gif: GifEntry;
  loops?: number;
  onProgress: (progress: number | null) => void;
  signal: AbortSignal;
}) {
  const {
    Output,
    Mp4OutputFormat,
    BufferTarget,
    CanvasSource,
    getFirstEncodableVideoCodec,
    QUALITY_VERY_HIGH,
  } = await import("mediabunny");
  try {
    if (signal.aborted) throw new Error("Signal was aborted");
    onProgress(0);

    const { width, height } = gif;
    const [canvas, context] = createCanvas(width, height);
    const target = new BufferTarget();
    const output = new Output({
      format: new Mp4OutputFormat(),
      target,
    });

    const codec = await getFirstEncodableVideoCodec(
      output.format.getSupportedVideoCodecs(),
      {
        width,
        height,
      },
    );

    if (codec === null) throw new Error("No codec found.");

    const source = new CanvasSource(canvas, {
      codec,
      bitrate: QUALITY_VERY_HIGH,
    });

    output.addVideoTrack(source);

    await output.start();

    const frames = flattenFrames(gif);
    const length = frames.length * loops;
    let currentTime = 0;
    let index = 0;

    for (let i = 0; i < loops; i++) {
      for (const frame of frames) {
        signal.throwIfAborted();
        onProgress(index / length);
        context.clearRect(0, 0, width, height);
        context.drawImage(frame.canvas, 0, 0);
        const delta = frame.delay / 1000;
        await source.add(currentTime, delta);
        currentTime += delta;
        index += 1;
      }
    }

    signal.throwIfAborted();
    source.close();
    await output.finalize();
    signal.throwIfAborted();

    const file = new File([output.target.buffer!], `${gif.name}.mp4`, {
      type: output.format.mimeType,
    });

    return file;
  } finally {
    onProgress(null);
  }
}
