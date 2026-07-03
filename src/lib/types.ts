export type ParsedGif = {
  name: string;
  width: number;
  height: number;
  frames: ParsedGifFrame[];
  opacity: number;
};

export type ParsedGifFrame = {
  width: number;
  height: number;
  delay: number;
  canvas: HTMLCanvasElement;
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

export type PointerEvent = { clientX: number; clientY: number };
