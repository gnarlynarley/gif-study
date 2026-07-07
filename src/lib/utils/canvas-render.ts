import type { Point } from "$lib/types";

export function renderLine(
  context: CanvasRenderingContext2D,
  a: Point,
  b: Point,
  width: number,
  color: string,
) {
  context.save();
  context.strokeStyle = color;
  context.lineWidth = width;
  context.beginPath();
  context.moveTo(a.x, a.y);
  context.lineTo(b.x, b.y);
  context.stroke();
  context.restore();
}

export const drawPoint = (
  context: CanvasRenderingContext2D,
  point: Point,
  width: number,
  color: string,
) => {
  context.save();
  context.fillStyle = color;
  context.beginPath();
  context.arc(point.x, point.y, width / 2, 0, Math.PI * 2);
  context.fill();
  context.restore();
};
