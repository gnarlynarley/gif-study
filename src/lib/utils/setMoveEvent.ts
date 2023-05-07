export type MoveEvent = {
  active: boolean;
  currentTarget: HTMLElement;
  start: boolean;
  shiftKey: boolean;
  x: number;
  y: number;
  relativeX: number;
  relativeY: number;
  startingX: number;
  startingY: number;
};
export type MoveEventHandler = (event: MoveEvent) => void;

export default function setMoveEvent(
  target: HTMLElement,
  handler: MoveEventHandler,
  { signal }: { signal?: AbortSignal } = {},
) {
  let currentTarget: any = null;
  let startingX = 0;
  let startingY = 0;

  function onPointerDown(ev: PointerEvent) {
    currentTarget = ev.target;
    startingX = ev.clientX;
    startingY = ev.clientY;
    window.addEventListener("pointermove", onPointerMove, { signal });
    window.addEventListener("pointerup", onPointerCancel, { signal });
    window.addEventListener("pointercancel", onPointerCancel, { signal });

    handler({
      active: true,
      currentTarget,
      start: true,
      shiftKey: ev.shiftKey,
      x: ev.clientX,
      y: ev.clientY,
      relativeX: 0,
      relativeY: 0,
      startingX,
      startingY,
    });
  }

  function onPointerMove(ev: PointerEvent) {
    handler({
      active: true,
      currentTarget,
      start: false,
      shiftKey: ev.shiftKey,
      x: ev.clientX,
      y: ev.clientY,
      relativeX: ev.clientX - startingX,
      relativeY: ev.clientY - startingY,
      startingX,
      startingY,
    });
  }

  function onPointerCancel(ev: PointerEvent) {
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerCancel);
    window.removeEventListener("pointercancel", onPointerCancel);
    handler({
      active: false,
      currentTarget,
      start: false,
      shiftKey: ev.shiftKey,
      x: ev.clientX,
      y: ev.clientY,
      relativeX: ev.clientX - startingX,
      relativeY: ev.clientY - startingY,
      startingX,
      startingY,
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
