import { TimelineFrame } from "./models";
import ScreenFilter, { ScreenFilterOptions } from "./ScreenFilter";
import type { TimelinePlayback } from "./TimelinePlayback";
import { assert } from "./utils/assert";
import clamp from "./utils/clamp";
import CleanupCollector from "./utils/CleanupCollector";

const MIN_ZOOM = 0.02;
const MAX_ZOOM = 5;

interface Options {
  timelinePlayback: TimelinePlayback;
  screenFilterOptions: ScreenFilterOptions;
  canvas: HTMLCanvasElement;
}

const OFFSET = 30;

export default class MovableCanvasRenderer {
  #sizeInitialized = false;
  position = { x: 0, y: 0 };
  #zoom = 1;
  #canvas: HTMLCanvasElement;
  #context: CanvasRenderingContext2D;
  #timelinePlayback: TimelinePlayback;
  onionSkinFilter: ScreenFilter;
  #resizeObserver = new ResizeObserver(() => {
    if (this.#canvas) {
      const rect = this.#canvas.getBoundingClientRect();
      this.#canvas.width = rect.width;
      this.#canvas.height = rect.height;
    }
    if (this.#sizeInitialized === false) {
      this.#sizeInitialized = true;
      this.setZoom(
        clamp(
          MIN_ZOOM,
          1,
          Math.min(
            (this.#canvas.width - OFFSET * 2) /
              this.#timelinePlayback.timeline.width,
            (this.#canvas.height - OFFSET * 2) /
              this.#timelinePlayback.timeline.height,
          ),
        ),
      );
    }
    this.#render();
  });
  cleanupCollector = new CleanupCollector();

  constructor({ timelinePlayback, screenFilterOptions, canvas }: Options) {
    const context = canvas.getContext("2d");
    assert(canvas, "Unable to get context.");
    this.#canvas = canvas;
    this.#context = context as CanvasRenderingContext2D;
    this.#timelinePlayback = timelinePlayback;
    this.onionSkinFilter = new ScreenFilter(
      screenFilterOptions,
      timelinePlayback.timeline,
    );

    const cleanupFrameChanged = this.#timelinePlayback.events.frameChanged.on(
      this.#render,
    );
    this.cleanupCollector.add(cleanupFrameChanged);

    const cleanupTrimStartChanged =
      this.#timelinePlayback.events.trimStartChanged.on(() => {
        this.onionSkinFilter.updateTimeline(this.#timelinePlayback.timeline);
        this.cleanFrameCache();
      });
    this.cleanupCollector.add(cleanupTrimStartChanged);
    const cleanupTrimEndChanged =
      this.#timelinePlayback.events.trimStartChanged.on(() => {
        this.onionSkinFilter.updateTimeline(this.#timelinePlayback.timeline);
        this.cleanFrameCache();
      });
    this.cleanupCollector.add(cleanupTrimEndChanged);

    this.#canvas.addEventListener("pointerdown", this.#handlePointerMove);
    this.#canvas.addEventListener("wheel", this.#handleZoom, true);
    this.#resizeObserver.observe(this.#canvas);
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
    this.#rafId = requestAnimationFrame(() => {
      const canvas = this.#canvas;
      const context = this.#context;
      const frame = this.#timelinePlayback.currentFrame;
      if (frame) {
        const { x, y } = this.position;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.save();
        const image = this.getImageFromFrame(frame);
        context.translate(canvas.width * 0.5, canvas.height * 0.5);
        context.scale(this.#zoom, this.#zoom);
        context.translate(
          frame.width * -0.5 + x / this.#zoom,
          frame.height * -0.5 + y / this.#zoom,
        );
        context.drawImage(image, 0, 0);
        context.restore();
      }
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
    this.#timelinePlayback.events.frameChanged.off(this.#render);
    cancelAnimationFrame(this.#rafId);
    this.#canvas.removeEventListener("pointerdown", this.#handlePointerMove);
    this.#canvas.removeEventListener("wheel", this.#handleZoom);
    this.#resizeObserver.unobserve(this.#canvas);
    this.cleanupCollector.cleanup();
  }

  cleanFrameCache = () => {
    this.imageFromFrameCache = new WeakMap();
    this.#render();
  };

  setOnionSkinOptions = (options: ScreenFilterOptions) => {
    this.onionSkinFilter.setOptions(options);
    this.cleanFrameCache();
  };
}
