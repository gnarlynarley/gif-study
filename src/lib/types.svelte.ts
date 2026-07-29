import { SvelteMap, SvelteSet } from "svelte/reactivity";
import createCanvas from "./utils/createCanvas";
import modulo from "./utils/modulo";
import wrapSlice from "./utils/wrapSlice";

export type GifEntryData = {
  name: string;
  width: number;
  height: number;
  frames: Omit<GifEntryFrame, "prevIndex" | "nextIndex">[];
};

export type GifEntryFrameSketch = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
};

export type GifEntryOrder = {};

export class GifEntry {
  name: string;
  width: number;
  height: number;
  frames: GifEntryFrame[];
  sketches = new SvelteMap<number, GifEntryFrameSketch>();
  trimmedFrames: GifEntryFrame[];
  trimmedFramesMap: Map<number, GifEntryFrame>;
  #frameStartIndex: number;
  #frameEndIndex: number;
  opacity = $state(1);
  backgroundColor = $state<string>("white");
  #mergeFrames = new SvelteSet();
  isTrimmed: boolean;

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
      const frameCountTotal = this.frames.length;
      const frameByIndexArr: (GifEntryFrame | undefined)[] = new Array(
        frameCountTotal,
      );
      for (const frame of this.frames) {
        frameByIndexArr[frame.index] = frame;
      }
      const mergeSet = this.#mergeFrames;

      const survivingFrames: GifEntryFrame[] = [];
      let carryDelay = 0;

      let currentIndex = this.#frameStartIndex;
      const maxSteps = frameCountTotal;
      for (let step = 0; step < maxSteps; step++) {
        const frame = frameByIndexArr[currentIndex];
        if (!frame) {
          throw new Error(`Frame with index ${currentIndex} not found`);
        }

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

        if (currentIndex === this.#frameEndIndex) break;
        currentIndex = frame.nextIndex;
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

      survivingFrames.sort((a, b) => a.index - b.index);

      return survivingFrames;
    });
    this.trimmedFramesMap = $derived.by(() => {
      return new Map(this.trimmedFrames.map((frame) => [frame.index, frame]));
    });
    this.isTrimmed = $derived.by(() => {
      if (this.#frameStartIndex !== 0) return true;
      if (this.#frameEndIndex !== this.frames.length - 1) return true;
      if (this.#mergeFrames.size > 0) return true;
      return false;
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
    let sketch = this.sketches.get(index);
    if (!sketch) {
      const [canvas, context] = createCanvas(width, height);
      sketch = { canvas, context };
    }
    sketch.context.clearRect(0, 0, width, height);
    sketch.context.drawImage(canvas, 0, 0);
    this.sketches.set(index, sketch);
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

  resetTrim() {
    this.#mergeFrames.clear();
    this.#frameStartIndex = 0;
    this.#frameEndIndex = this.frames.length - 1;
  }

  getSketch({ index }: { index: number }): GifEntryFrameSketch | null {
    return this.sketches.get(index) ?? null;
  }
}

export type GifEntryFrame = {
  width: number;
  height: number;
  delay: number;
  canvas: HTMLCanvasElement;
  index: number;
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
