import { SvelteSet } from "svelte/reactivity";
import createCanvas from "./utils/createCanvas";
import modulo from "./utils/modulo";
import wrapSlice from "./utils/wrapSlice";

export type GifEntryData = {
  name: string;
  width: number;
  height: number;
  frames: Omit<GifEntryFrame, "prevIndex" | "nextIndex">[];
};

export type GifEntryOrder = {};

export class GifEntry {
  name: string;
  width: number;
  height: number;
  frames: GifEntryFrame[];
  trimmedFrames: GifEntryFrame[];
  trimmedFramesMap: Map<number, GifEntryFrame>;
  #frameStartIndex: number;
  #frameEndIndex: number;
  opacity = $state(1);
  backgroundColor = $state<string>("white");
  #mergeFrames = new SvelteSet();

  constructor(opts: GifEntryData) {
    this.name = $state(opts.name);
    this.width = $state(opts.width);
    this.height = $state(opts.height);

    this.frames = $state(
      opts.frames.map((frame) => ({
        ...frame,
        nextIndex: modulo(frame.index + 1, opts.frames.length),
        prevIndex: modulo(frame.index - 1, opts.frames.length),
      })),
    );
    this.#frameStartIndex = $state(0);
    this.#frameEndIndex = $state(opts.frames.length - 1);
    this.trimmedFrames = $derived.by(() => {
      const frameByIndex = new Map(
        this.frames.map((frame) => [frame.index, frame]),
      );
      const mergeSet = this.#mergeFrames;

      const orderedFrames: GifEntryFrame[] = [];
      let currentIndex = this.#frameStartIndex;
      while (true) {
        const frame = frameByIndex.get(currentIndex);
        if (!frame) {
          throw new Error(`Frame with index ${currentIndex} not found`);
        }
        orderedFrames.push(frame);
        if (currentIndex === this.#frameEndIndex) break;
        currentIndex = frame.nextIndex;
      }

      const survivingFrames: GifEntryFrame[] = [];
      let carryDelay = 0;

      for (const frame of orderedFrames) {
        if (mergeSet.has(frame.index)) {
          if (survivingFrames.length > 0) {
            survivingFrames[survivingFrames.length - 1].delay += frame.delay;
          } else {
            carryDelay += frame.delay;
          }
        } else {
          survivingFrames.push({ ...frame, delay: frame.delay + carryDelay });
          carryDelay = 0;
        }
      }

      if (survivingFrames.length === 0) {
        return [this.frames[this.#frameStartIndex]];
      }

      if (carryDelay > 0) {
        survivingFrames[survivingFrames.length - 1].delay += carryDelay;
      }

      const frameCount = survivingFrames.length;
      for (let i = 0; i < frameCount; i++) {
        const nextFrame = survivingFrames[(i + 1) % frameCount];
        const prevFrame = survivingFrames[(i - 1 + frameCount) % frameCount];
        survivingFrames[i].nextIndex = nextFrame.index;
        survivingFrames[i].prevIndex = prevFrame.index;
      }

      survivingFrames.sort((a, b) => b.index - b.index);

      return survivingFrames;
    });
    this.trimmedFramesMap = $derived.by(() => {
      return new Map(this.trimmedFrames.map((frame) => [frame.index, frame]));
    });
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

  getIndexByOffset = (currentIndex: number, offset: 0 | 1 | -1): number => {
    const found = this.trimmedFrames.find(
      (frame) => frame.index === currentIndex,
    );
    if (!found) return this.#frameStartIndex;
    switch (offset) {
      case 1: {
        return found.nextIndex;
      }
      case -1: {
        return found.prevIndex;
      }
      case 0: {
        return currentIndex;
      }
    }
  };

  toggleSkipFrame({ index }: GifEntryFrame) {
    if (this.#mergeFrames.has(index)) {
      this.#mergeFrames.delete(index);
    } else {
      this.#mergeFrames.add(index);
    }
  }

  isMerge({ index }: GifEntryFrame): boolean {
    return this.#mergeFrames.has(index);
  }

  isWithinTrim({ index }: GifEntryFrame): boolean {
    const length = this.frames.length;
    if (length === 0) return false;
    const start = this.#frameStartIndex;
    const end = this.#frameEndIndex;
    const relativeIndex = (index - start + length) % length;
    const relativeEnd = (end - start + length) % length;
    return relativeIndex <= relativeEnd;
  }

  isStartFrame({ index }: GifEntryFrame): boolean {
    return this.#frameStartIndex === index;
  }

  isEndFrame({ index }: GifEntryFrame): boolean {
    return this.#frameEndIndex === index;
  }

  setStartFrame({ index }: GifEntryFrame) {
    this.#frameStartIndex = index;
    this.#mergeFrames.delete(index);
  }

  setEndFrame({ index }: GifEntryFrame) {
    this.#frameEndIndex = index;
    this.#mergeFrames.delete(index);
  }
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
  prevIndex: number;
  nextIndex: number;
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
