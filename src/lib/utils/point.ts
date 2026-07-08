import type { Point } from "$lib/types.svelte";

export function addPoints(a: Point, b: Point): Point {
  return {
    x: a.x + b.x,
    y: a.y + b.y,
    scale: a.scale + b.scale,
  };
}

export function subtractPoints(a: Point, b: Point): Point {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
    scale: a.scale,
  };
}
