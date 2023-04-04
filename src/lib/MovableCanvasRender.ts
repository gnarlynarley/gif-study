import { TimelineFrame } from "./models";
import OnionSkinFilter from "./OnionSkinFilter";
import type { TimelinePlayback } from "./TimelinePlayback";
import GameLoop from "./utils/game/GameLoop";

interface Options {
  timelinePlayback: TimelinePlayback;
}

export default class MovableCanvasRender {
  position = { x: 0, y: 0 };
  #loop: GameLoop;
  #canvas: HTMLCanvasElement | null = null;
  #context: CanvasRenderingContext2D | null = null;
  #timelinePlayback: TimelinePlayback;
  onionSkinFilter: OnionSkinFilter;

  constructor({ timelinePlayback }: Options) {
    this.#timelinePlayback = timelinePlayback;
    this.#loop = new GameLoop({
      render: this.#render,
    });
    this.#loop.play();
    this.onionSkinFilter = new OnionSkinFilter({
      contrastLevel: 0.3,
      frames: timelinePlayback.timeline.frames,
      opacity: 0.3,
      nextColor: "red",
      prevColor: "blue",
      unionFrames: 1,
    });
  }

  imageFromFrameCache = new WeakMap<ImageData, HTMLCanvasElement>();

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
      context.translate(
        (canvas.width - image.width) * 0.5 + x,
        (canvas.height - image.height) * 0.5 + y
      );
      context.drawImage(image, 0, 0);
      context.restore();
    }
  };

  setCanvas(canvas: HTMLCanvasElement | null) {
    if (this.#canvas) {
      this.#canvas.removeEventListener("pointerdown", this.#handlePointerMove);
    }
    this.#canvas = canvas;
    if (this.#canvas) {
      this.#context = this.#canvas.getContext("2d");
      this.#canvas.addEventListener("pointerdown", this.#handlePointerMove);
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

  destroy() {
    this.#loop.stop();
  }
}
