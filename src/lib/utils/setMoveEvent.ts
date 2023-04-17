export type MoveEvent = {
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
) {
  let startingX = 0;
  let startingY = 0;
  let previousX = 0;
  let previousY = 0;

  function onPointerDown(ev: PointerEvent) {
    startingX = ev.clientX;
    startingY = ev.clientY;
    previousX = ev.clientX;
    previousY = ev.clientY;
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerCancel);
    window.addEventListener("pointercancel", onPointerCancel);

    handler({
      active: true,
      x: ev.clientX,
      y: ev.clientY,
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
      active: false,
      x: ev.clientX,
      y: ev.clientY,
      relativeX: ev.clientX - startingX,
      relativeY: ev.clientY - startingY,
      previousX,
      previousY,
    });
  }

  target.addEventListener("pointerdown", onPointerDown);

  return function destroy() {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerCancel);
    window.removeEventListener("pointercancel", onPointerCancel);
    target.removeEventListener("pointerdown", onPointerDown);
  };
}
