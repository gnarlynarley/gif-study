import { assert } from "./utils/assert";
import clamp from "./utils/clamp";
import CleanupCollector from "./utils/CleanupCollector";

const MIN_ZOOM = 0.02;
const MAX_ZOOM = 5;

interface Options {
  canvas: HTMLCanvasElement;
  frame: HTMLCanvasElement | HTMLVideoElement | null;
}

const OFFSET = 30;

export default class MovableCanvasRenderer {
  #sizeInitialized = false;
  #zoom = 1;
  #canvas: HTMLCanvasElement;
  #context: CanvasRenderingContext2D;

  position = { x: 0, y: 0 };
  frame: HTMLCanvasElement | HTMLVideoElement | null;

  #resizeObserver: ResizeObserver;
  cleanupCollector = new CleanupCollector();

  constructor({ canvas, frame }: Options) {
    const context = canvas.getContext("2d");
    assert(canvas, "Unable to get context.");
    this.#canvas = canvas;
    this.#context = context as CanvasRenderingContext2D;
    this.frame = frame;
    this.#canvas.addEventListener("pointerdown", this.#handlePointerMove);
    this.#canvas.addEventListener("wheel", this.#handleZoom, { passive: true });
    this.#resizeObserver = new ResizeObserver(() => {
      if (this.#canvas) {
        const rect = this.#canvas.getBoundingClientRect();
        this.#canvas.width = rect.width;
        this.#canvas.height = rect.height;
      }
      if (this.#sizeInitialized === false) {
        this.#sizeInitialized = true;
        if (!this.frame) return;
        this.setZoom(
          clamp(
            MIN_ZOOM,
            1,
            Math.min(
              (this.#canvas.width - OFFSET * 2) / this.frame.width,
              (this.#canvas.height - OFFSET * 2) / this.frame.height,
            ),
          ),
        );
      }
      this.#render();
    });
    this.#resizeObserver.observe(this.#canvas);
    this.#render();
  }

  setFrame(frame: HTMLCanvasElement | HTMLVideoElement) {
    this.frame = frame;
    this.#render();
  }

  addZoom(addition: number) {
    this.setZoom(this.#zoom + addition);
  }

  setZoom(zoom: number) {
    this.#zoom = clamp(MIN_ZOOM, MAX_ZOOM, zoom);
    this.#render();
  }

  #rafId: number = 0;
  #render = () => {
    this.#rafId = requestAnimationFrame(() => {
      const { frame } = this;
      const canvas = this.#canvas;
      const context = this.#context;
      const { x, y } = this.position;
      context.clearRect(0, 0, canvas.width, canvas.height);
      if (frame) {
        context.save();
        context.translate(canvas.width * 0.5, canvas.height * 0.5);
        context.scale(this.#zoom, this.#zoom);
        context.translate(
          frame.width * -0.5 + x / this.#zoom,
          frame.height * -0.5 + y / this.#zoom,
        );
        context.drawImage(frame, 0, 0);
      }
      context.restore();
    });
  };

  #handlePointerMove = (ev: PointerEvent) => {
    const relativeX = ev.clientX;
    const relativeY = ev.clientY;
    const currentX = this.position.x;
    const currentY = this.position.y;
    const onPointerMove = (moveEv: PointerEvent) => {
      const x = moveEv.clientX - relativeX;
      const y = moveEv.clientY - relativeY;
      this.position.x = currentX + x;
      this.position.y = currentY + y;
      this.#render();
    };
    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  #handleZoom = (ev: WheelEvent) => {
    ev.preventDefault();
    const delta = (ev.deltaY * -1) / 1000;
    this.addZoom(delta);
  };

  destroy() {
    this.#resizeObserver.disconnect();
    cancelAnimationFrame(this.#rafId);
    this.#canvas.removeEventListener("pointerdown", this.#handlePointerMove);
    this.#canvas.removeEventListener("wheel", this.#handleZoom);
    this.#resizeObserver.unobserve(this.#canvas);
    this.cleanupCollector.cleanup();
  }
}
