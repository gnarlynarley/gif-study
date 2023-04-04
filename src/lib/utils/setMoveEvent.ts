export type MoveEventHandler = (event: {
  x: number;
  y: number;
  relativeX: number;
  relativeY: number;
}) => void;

export default function setMoveEvent(
  target: HTMLElement,
  handler: MoveEventHandler
) {
  let startingX = 0;
  let startingY = 0;

  function onPointerDown(ev: PointerEvent) {
    startingX = ev.clientX;
    startingY = ev.clientY;
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    handler({
      x: ev.clientX,
      y: ev.clientY,
      relativeX: 0,
      relativeY: 0,
    });
  }

  function onPointerMove(ev: PointerEvent) {
    handler({
      x: ev.clientX,
      y: ev.clientY,
      relativeX: ev.clientX - startingX,
      relativeY: ev.clientY - startingY,
    });
  }

  function onPointerUp(ev: PointerEvent) {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  }

  target.addEventListener("pointerdown", onPointerDown);

  return function destroy() {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
    target.removeEventListener("pointerdown", onPointerDown);
  };
}
