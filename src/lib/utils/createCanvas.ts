import { assert } from "./assert";

export function createCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  assert(context);

  canvas.width = width;
  canvas.height = height;

  return {
    canvas,
    context,
    cleanup() {},
  };
}
