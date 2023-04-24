export type MoveEvent = {
  start: boolean;
  active: boolean;
  x: number;
  y: number;
  relativeX: number;
  relativeY: number;
  previousX: number;
  previousY: number;
};
export type MoveEventHandler = (event: MoveEvent) => void;

export default function setMoveEvent(
  target: HTMLElement,
  handler: MoveEventHandler,
  { signal }: { signal?: AbortSignal } = {},
) {
  let startingX = 0;
  let startingY = 0;
  let previousX = 0;
  let previousY = 0;

  function onPointerDown(ev: PointerEvent) {
    const x = ev.clientX;
    const y = ev.clientY;
    startingX = x;
    startingY = y;
    previousX = x;
    previousY = y;
    window.addEventListener("pointermove", onPointerMove, { signal });
    window.addEventListener("pointerup", onPointerCancel, { signal });
    window.addEventListener("pointercancel", onPointerCancel, { signal });

    handler({
      start: true,
      active: false,
      x,
      y,
      relativeX: 0,
      relativeY: 0,
      previousX,
      previousY,
    });
  }

  function onPointerMove(ev: PointerEvent) {
    const x = ev.clientX;
    const y = ev.clientY;
    handler({
      start: false,
      active: true,
      x,
      y,
      relativeX: x - startingX,
      relativeY: y - startingY,
      previousX,
      previousY,
    });
    previousX = x;
    previousY = y;
  }

  function onPointerCancel(ev: PointerEvent) {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerCancel);
    window.removeEventListener("pointercancel", onPointerCancel);
    handler({
      start: false,
      active: false,
      x: ev.clientX,
      y: ev.clientY,
      relativeX: ev.clientX - startingX,
      relativeY: ev.clientY - startingY,
      previousX,
      previousY,
    });
  }

  target.addEventListener("pointerdown", onPointerDown, { signal });

  return function destroy() {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerCancel);
    window.removeEventListener("pointercancel", onPointerCancel);
    target.removeEventListener("pointerdown", onPointerDown);
  };
}
