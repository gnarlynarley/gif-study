export type ParsedGif = {
  width: number;
  height: number;
  frames: ParsedGifFrame[];
};

export type ParsedGifFrame = {
  width: number;
  height: number;
  delay: number;
  canvas: HTMLCanvasElement;
  sketchCanvas: HTMLCanvasElement;
  sketchContext: CanvasRenderingContext2D;
};

export type Point = { x: number; y: number; scale: number };

export type SketchTool = 'brush' | 'eraser';
