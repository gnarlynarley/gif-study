import createCanvas from "./utils/createCanvas";
import wrapSlice from "./utils/wrapSlice";

export class GifEntry {
  name: string;
  width: number;
  height: number;
  frames: GifEntryFrame[];
  trimmedFrames: GifEntryFrame[];
  frameStartIndex: number;
  frameEndIndex: number;
  opacity: number;
  backgroundColor = $state<string>("white");

  constructor(
    opts: Pick<GifEntry, "name" | "width" | "height" | "frames" | "opacity">,
  ) {
    this.name = $state(opts.name);
    this.width = $state(opts.width);
    this.height = $state(opts.height);

    this.frames = $state(opts.frames);
    this.frameStartIndex = $state(0);
    this.frameEndIndex = $state(opts.frames.length - 1);
    this.trimmedFrames = $derived(
      wrapSlice(this.frames, this.frameStartIndex, this.frameEndIndex),
    );
    this.opacity = $state(opts.opacity);
  }

  updateFrameSketch = async (
    canvas: HTMLCanvasElement | null,
    { index }: GifEntryFrame,
  ) => {
    if (!canvas) return;
    const frame = this.frames.at(index);
    if (!frame) return;
    const { width, height } = frame;
    if (!frame.sketch) {
      const [canvas, context] = createCanvas(width, height);
      frame.sketch = { canvas, context };
    }
    frame.sketch.context.clearRect(0, 0, width, height);
    frame.sketch.context.drawImage(canvas, 0, 0);
    frame.sketch = { ...frame.sketch };
  };

  getIndexByOffset = (currentIndex: number, offset: number): number => {
    const startIndex = this.frameStartIndex;
    const endIndex = this.frameEndIndex;
    const length = this.frames.length;
    const rangeLength =
      startIndex <= endIndex
        ? endIndex - startIndex + 1
        : length - startIndex + endIndex + 1;

    // where currentIndex sits relative to startIndex, wrapped into the range
    const relative = (((currentIndex - startIndex) % length) + length) % length;

    // apply offset within the range, wrapped
    const newRelative =
      (((relative + offset) % rangeLength) + rangeLength) % rangeLength;

    const result = (startIndex + newRelative) % length;

    return result;
  };
}

export type GifEntryFrame = {
  width: number;
  height: number;
  delay: number;
  canvas: HTMLCanvasElement;
  index: number;
  sketch: {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
  } | null;
};

export type Point = { x: number; y: number; scale: number };

export type SketchTool = "brush" | "eraser";

export type Settings = {
  keybinds: {
    togglePlaying: string;
    brush: string;
    eraser: string;
    nextFrame: string;
    prevFrame: string;
    increaseBrushSize: string;
    decreaseBrushSize: string;
    panning: string;
  };
};
