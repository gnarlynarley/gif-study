import { TimelineFrame } from "./models";
import OnionSkinFilter, { OnionSkinFilterOptions } from "./OnionSkinFilter";
import type { TimelinePlayback } from "./TimelinePlayback";
import clamp from "./utils/clamp";
import GameLoop from "./utils/game/GameLoop";

const MIN_ZOOM = 0.02;
const MAX_ZOOM = 5;

interface Options {
  timelinePlayback: TimelinePlayback;
  onionSkinFilterOptions: OnionSkinFilterOptions;
}

export default class MovableCanvasRender {
  position = { x: 0, y: 0 };
  #zoom = 1;
  #loop: GameLoop;
  #canvas: HTMLCanvasElement | null = null;
  #context: CanvasRenderingContext2D | null = null;
  #timelinePlayback: TimelinePlayback;
  onionSkinFilter: OnionSkinFilter;

  constructor({ timelinePlayback, onionSkinFilterOptions }: Options) {
    this.#timelinePlayback = timelinePlayback;
    this.#loop = new GameLoop({
      render: this.#render,
    });
    this.#loop.play();
    this.onionSkinFilter = new OnionSkinFilter(
      onionSkinFilterOptions,
      timelinePlayback.timeline.frames
    );
  }

  imageFromFrameCache = new WeakMap<ImageData, HTMLCanvasElement>();

  addZoom(addition: number) {
    this.setZoom(this.#zoom + addition);
  }

  setZoom(zoom: number) {
    this.#zoom = clamp(MIN_ZOOM, MAX_ZOOM, zoom);
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

  #render = () => {
    const canvas = this.#canvas;
    const context = this.#context;
    if (!canvas || !context) return;
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
        frame.height * -0.5 + y / this.#zoom
      );
      context.drawImage(image, 0, 0);
      context.restore();
    }
  };

  setCanvas(canvas: HTMLCanvasElement | null) {
    if (this.#canvas) {
      this.#canvas.removeEventListener("pointerdown", this.#handlePointerMove);
      this.#canvas.removeEventListener("wheel", this.#handleZoom);
    }
    this.#canvas = canvas;
    if (this.#canvas) {
      this.#context = this.#canvas.getContext("2d");
      this.#canvas.addEventListener("pointerdown", this.#handlePointerMove);
      this.#canvas.addEventListener("wheel", this.#handleZoom);
    }
  }

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
    this.#loop.stop();
  }

  setOnionSkinOptions(options: OnionSkinFilterOptions) {
    this.onionSkinFilter.setOptions(options);
    this.imageFromFrameCache = new WeakMap();
  }
}