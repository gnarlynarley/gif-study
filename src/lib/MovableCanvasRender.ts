import { TimelineFrame } from "./models";
import ScreenFilter, { ScreenFilterOptions } from "./ScreenFilter";
import type { TimelinePlayback } from "./TimelinePlayback";
import { assert } from "./utils/assert";
import clamp from "./utils/clamp";

const MIN_ZOOM = 0.02;
const MAX_ZOOM = 5;

interface Options {
  container: HTMLElement;
  timelinePlayback: TimelinePlayback;
  onionSkinFilterOptions: ScreenFilterOptions;
  canvas: HTMLCanvasElement;
}

export default class MovableCanvasRender {
  #container: HTMLElement;
  #canvas: HTMLCanvasElement;
  #context: CanvasRenderingContext2D;
  position = { x: 0, y: 0 };
  #zoom = 1;
  #timelinePlayback: TimelinePlayback;
  onionSkinFilter: ScreenFilter;
  active = false;

  #resizeObserver = new ResizeObserver(() => {
    if (this.#canvas) {
      const rect = this.#canvas.getBoundingClientRect();
      this.#canvas.width = rect.width;
      this.#canvas.height = rect.height;
    }
    this.#render();
  });

  constructor({
    container,
    timelinePlayback,
    onionSkinFilterOptions,
    canvas,
  }: Options) {
    const context = canvas.getContext("2d");
    assert(context);
    this.#container = container;
    this.#canvas = canvas;
    this.#context = context;
    this.#timelinePlayback = timelinePlayback;
    this.onionSkinFilter = new ScreenFilter(
      onionSkinFilterOptions,
      timelinePlayback.timeline.frames,
    );
    this.#timelinePlayback.events.frameChanged.on(this.#render);
    this.#container.addEventListener("pointerdown", this.#handlePointerMove);
    this.#container.addEventListener("wheel", this.#handleZoom);
    this.#resizeObserver.observe(this.#container);
    this.#render();
  }

  imageFromFrameCache = new WeakMap<ImageData, HTMLCanvasElement>();

  addZoom(addition: number) {
    this.setZoom(this.#zoom + addition);
  }

  setZoom(zoom: number) {
    this.#zoom = clamp(MIN_ZOOM, MAX_ZOOM, zoom);
    this.#render();
  }

  setActive(active: boolean) {
    this.active = active;
  }

  getImageFromFrame = (frame: TimelineFrame): HTMLCanvasElement => {
    let canvas = this.imageFromFrameCache.get(frame.data);
    if (!canvas) {
      canvas = document.createElement("canvas");
      const imageDataWithFilter = this.onionSkinFilter.apply(frame.data);
      canvas.width = imageDataWithFilter.width;
      canvas.height = imageDataWithFilter.height;
      canvas.getContext("2d")?.putImageData(imageDataWithFilter, 0, 0);
      this.imageFromFrameCache.set(frame.data, canvas);
    }

    return canvas;
  };

  #rafId: number = 0;
  #render = () => {
    cancelAnimationFrame(this.#rafId);
    this.#rafId = requestAnimationFrame(() => {
      const canvas = this.#canvas;
      const context = this.#context;
      const frame = this.#timelinePlayback.currentFrame;
      if (frame) {
        const { x, y } = this.position;
        const zoom = this.#zoom;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.save();
        const image = this.getImageFromFrame(frame);
        context.translate(canvas.width * 0.5, canvas.height * 0.5);
        context.scale(zoom, zoom);
        context.translate(
          frame.width * -0.5 + x / zoom,
          frame.height * -0.5 + y / zoom,
        );
        context.drawImage(image, 0, 0);
        context.restore();
      }
    });
  };

  #handlePointerMove = (ev: PointerEvent) => {
    if (!this.active) return;
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
    this.#timelinePlayback.events.frameChanged.off(this.#render);
    cancelAnimationFrame(this.#rafId);

    this.#container.removeEventListener("pointerdown", this.#handlePointerMove);
    this.#container.removeEventListener("wheel", this.#handleZoom);
  }

  setOnionSkinOptions(options: ScreenFilterOptions) {
    this.onionSkinFilter.setOptions(options);
    this.imageFromFrameCache = new WeakMap();
    this.#render();
  }
}
