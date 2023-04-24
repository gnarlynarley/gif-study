import { assert } from "./assert";

export interface Canvas {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  clear: () => void;
  cleanup: () => void;
}

export function createCanvas(width: number = 0, height: number = 0): Canvas {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  assert(context);

  canvas.width = width;
  canvas.height = height;

  return {
    canvas,
    context,
    clear() {
      context.clearRect(0, 0, canvas.width, canvas.height);
    },
    cleanup() {
      canvas.width = 0;
      canvas.height = 0;
    },
  };
}

export default createCanvas;
