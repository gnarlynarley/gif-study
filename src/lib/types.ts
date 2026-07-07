export type GifEntry = {
  name: string;
  width: number;
  height: number;
  frames: GifEntryFrame[];
  opacity: number;
};

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
