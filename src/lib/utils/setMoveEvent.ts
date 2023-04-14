export type MoveEvent = {
  active: boolean;
  x: number;
  y: number;
  relativeX: number;
  relativeY: number;
};
export type MoveEventHandler = (event: MoveEvent) => void;

export default function setMoveEvent(
  target: HTMLElement,
  handler: MoveEventHandler,
) {
  let startingX = 0;
  let startingY = 0;

  function onPointerDown(ev: PointerEvent) {
    startingX = ev.clientX;
    startingY = ev.clientY;
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerCancel);
    window.addEventListener("pointercancel", onPointerCancel);

    handler({
      active: true,
      x: ev.clientX,
      y: ev.clientY,
      relativeX: 0,
      relativeY: 0,
    });
  }

  function onPointerMove(ev: PointerEvent) {
    handler({
      active: true,
      x: ev.clientX,
      y: ev.clientY,
      relativeX: ev.clientX - startingX,
      relativeY: ev.clientY - startingY,
    });
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
