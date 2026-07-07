export default function createCanvas(
  width = 0,
  height = 0,
  settings?: CanvasRenderingContext2DSettings,
): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", settings);

  if (!context) throw new Error("Could not retrieve context from canvas.");

  canvas.width = width;
  canvas.height = height;

  return [canvas, context];
}
