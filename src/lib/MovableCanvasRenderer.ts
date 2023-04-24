import { TimelineFrame } from "./models";
import ScreenFilter, { ScreenFilterOptions } from "./ScreenFilter";
import { SketchCanvasRenderer } from "./SketchCanvasRenderer";
import type { TimelinePlayback } from "./TimelinePlayback";
import { assert } from "./utils/assert";
import clamp from "./utils/clamp";
import EventEmitter from "./utils/EventEmitter";
import Vector from "./utils/game/Vector";
import setMoveEvent from "./utils/setMoveEvent";

const MIN_ZOOM = 0.02;
const MAX_ZOOM = 5;

interface Options {
  timelinePlayback: TimelinePlayback;
  screenFilterOptions: ScreenFilterOptions;
  canvas: HTMLCanvasElement;
}

const OFFSET = 40;

export enum Tools {
  Pan,
  Zoom,
  Brush,
  Eraser,
}

export default class MovableCanvasRenderer {
  tool = Tools.Brush;
  #sizeInitialized = false;
  position = new Vector(0, 0);
  #zoom = 1;
  #canvas: HTMLCanvasElement;
  #context: CanvasRenderingContext2D;
  #timelinePlayback: TimelinePlayback;
  onionSkinFilter: ScreenFilter;
  sketchCanvasRenderer: SketchCanvasRenderer;
  abortController = new AbortController();

  events = {
    toolChanged: new EventEmitter<Tools>(),
  };

  constructor({ timelinePlayback, screenFilterOptions, canvas }: Options) {
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    assert(canvas, "Unable to get context.");
    this.#canvas = canvas;
    this.#context = context;
    this.#timelinePlayback = timelinePlayback;
    this.onionSkinFilter = new ScreenFilter(
      screenFilterOptions,
      timelinePlayback.timeline.frames,
    );
    let startingX = 0;
    let startingY = 0;
    setMoveEvent(
      this.#canvas,
      ({ start, x, y, relativeX, relativeY, previousX, previousY, active }) => {
        if (start) {
          startingX = this.position.x;
          startingY = this.position.y;
        }
        if (active) {
          switch (this.tool) {
            case Tools.Pan: {
              this.position.x = startingX + relativeX;
              this.position.y = startingY + relativeY;
              break;
            }
            case Tools.Brush:
            case Tools.Eraser: {
              this.sketchCanvasRenderer.drawDocument(
                x,
                y,
                previousX,
                previousY,
                this.tool === Tools.Brush ? "brush" : "eraser",
                this.position,
                this.#zoom,
              );
              break;
            }
          }
        }
        this.#render();
      },
      { signal: this.abortController.signal },
    );
    this.#canvas.addEventListener("wheel", this.#handleZoom);
    this.#resizeObserver.observe(this.#canvas);
    this.sketchCanvasRenderer = new SketchCanvasRenderer({
      canvas,
      context,
      width: timelinePlayback.width,
      height: timelinePlayback.height,
      position: this.position,
    });
    this.sketchCanvasRenderer.events.documentChanged.on(this.#render);
    this.#timelinePlayback.events.frameChanged.on(this.#render);
    this.#render();
  }

  #resizeObserver = new ResizeObserver(() => {
    if (this.#canvas) {
      const rect = this.#canvas.getBoundingClientRect();
      this.#canvas.width = rect.width;
      this.#canvas.height = rect.height;
    }
    if (this.#sizeInitialized === false) {
      this.#sizeInitialized = true;
      this.setZoom(
        Math.min(
          1.5,
          Math.max(
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

  imageFromFrameCache = new WeakMap<ImageData, HTMLCanvasElement>();

  addZoom(addition: number) {
    this.setZoom(this.#zoom + addition);
  }

  setTool(tool: Tools) {
    this.tool = tool;
    this.events.toolChanged.emit(this.tool);
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
      const { width, height } = this.#canvas;
      const context = this.#context;
      const frame = this.#timelinePlayback.currentFrame;
      const { x, y } = this.position;
      if (frame) {
        context.clearRect(0, 0, width, height);

        context.save();
        context.translate(width * 0.5, height * 0.5);
        context.scale(this.#zoom, this.#zoom);
        context.translate(
          frame.width * -0.5 + x / this.#zoom,
          frame.height * -0.5 + y / this.#zoom,
        );

        const image = this.getImageFromFrame(frame);
        context.drawImage(image, 0, 0);
        this.sketchCanvasRenderer.render();

        context.restore();
      }
    });
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
    this.#canvas.removeEventListener("wheel", this.#handleZoom);
    this.#resizeObserver.unobserve(this.#canvas);
    this.sketchCanvasRenderer.destroy();
    this.abortController.abort();
  }

  setOnionSkinOptions(options: ScreenFilterOptions) {
    this.onionSkinFilter.setOptions(options);
    this.imageFromFrameCache = new WeakMap();
    this.#render();
  }
}
