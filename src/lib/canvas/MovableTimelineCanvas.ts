import EventEmitter from "./../utils/EventEmitter";
import { TimelineFrame } from "./../models";
import { Timeline } from "../models";
import { assert } from "../utils/assert";
import noop from "../utils/noop";
import { calcModulo } from "../utils/calcModulo";

const MIN_ZOOM_LEVEL = 0.01;
const MAX_ZOOM_LEVEL = 5;
const ZOOM_AMOUNT = 0.2;

export default class MovableTimelineCanvas {
  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;
  private timeline: Timeline;
  time: number = 0;
  speed: number = 0;
  position = { x: 0, y: 0 };
  zoom = 1;

  events = {
    timeChanged: new EventEmitter<number>(),
    playingChanged: new EventEmitter<boolean>(),
  };

  constructor(timeline: Timeline) {
    this.timeline = timeline;
    requestAnimationFrame(this.render);
    this.play();
  }

  destroy() {
    this.setCanvas(null);
    this.pause();
  }

  resizeObserver: ResizeObserver | null = null;
  setCanvas(canvas: HTMLCanvasElement | null) {
    if (canvas) {
      this.canvas = canvas;
      this.context = canvas.getContext("2d") ?? null;
      this.resizeObserver = new ResizeObserver(([entry]) => {
        canvas.width = entry.contentRect.width;
        canvas.height = entry.contentRect.height;
      });
      this.resizeObserver.observe(canvas);
      this.canvas.addEventListener("pointerdown", this.handlePointerMove);
      this.canvas.addEventListener("wheel", this.wheelHandler);
    } else {
      this.canvas?.removeEventListener("pointerdown", this.handlePointerMove);
      this.canvas?.removeEventListener("wheel", this.wheelHandler);
      this.canvas = null;
      this.context = null;
      this.resizeObserver?.disconnect();
      this.resizeObserver = null;
    }
  }

  playing = false;

  #pause = noop;

  play = () => {
    this.playing = true;
    this.events.playingChanged.emit(this.playing);
    const max = this.timeline.timelineFrames.length;

    const id = setInterval(() => {
      this.time = (this.time + 1) % max;
      this.events.timeChanged.emit(this.time);
    }, 10);

    this.#pause = () => {
      clearInterval(id);
    };
  };

  pause = () => {
    this.playing = false;
    this.#pause();
    this.#pause = noop;
  };

  private getFrameByTime(time: number) {
    return this.timeline.timelineFrames[time];
  }

  navigateFrame = (add: number) => {
    this.pause();
    // if (currentFrameIndex === -1) return;
    // const length = timeline?.frames.length ?? 0;
    // const nextFrameIndex = (length + currentFrameIndex + add) % length;
    // const nextFrame = timeline?.frames[nextFrameIndex] ?? null;
    // // if (nextFrame) {
    // //   setTime(nextFrame.time);
    // // }
    const currentFrame = this.getFrameByTime(this.time);
    const currentFrameIndex = this.timeline.frames.indexOf(currentFrame);
    const nextFrame =
      this.timeline.frames[
        calcModulo(currentFrameIndex + add, this.timeline.frames.length)
      ];
    this.time = nextFrame.time;
  };

  frameCache = new WeakMap<TimelineFrame, HTMLCanvasElement>();
  private getFrameCanvas = (frame: TimelineFrame): HTMLCanvasElement => {
    let canvas = this.frameCache.get(frame);

    if (!canvas) {
      canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      assert(context);
      canvas.width = frame.width;
      canvas.height = frame.height;
      context.putImageData(frame.data, 0, 0);
      this.frameCache.set(frame, canvas);
    }

    return canvas;
  };

  private render = () => {
    requestAnimationFrame(this.render);
    const { canvas, context } = this;
    if (!canvas || !context) return;
    const currentFrame = this.timeline.timelineFrames.at(this.time);

    context.clearRect(0, 0, canvas.width, canvas.height);
    if (currentFrame) {
      context.save();

      context.translate(
        canvas.width / 2 + this.position.x * -1,
        canvas.height / 2 + this.position.y * -1
      );
      context.scale(this.zoom, this.zoom);
      context.drawImage(
        this.getFrameCanvas(currentFrame),
        currentFrame.width * -0.5,
        currentFrame.height * -0.5
      );
      context.restore();
    }
  };

  setZoom(zoom: number) {
    this.zoom = Math.min(Math.max(MIN_ZOOM_LEVEL, zoom), MAX_ZOOM_LEVEL);
  }

  private handlePointerMove = (ev: PointerEvent) => {
    const zoomingMode = ev.metaKey || ev.ctrlKey || false;
    const startingX = ev.clientX;
    const startingY = ev.clientY;
    const startingPosition = { ...this.position };
    const startingZoom = this.zoom;
    const pointermoveHandler = (ev: MouseEvent) => {
      ev.preventDefault();
      const movedX = startingX - ev.clientX;
      const movedY = startingY - ev.clientY;
      if (zoomingMode) {
        this.setZoom(startingZoom + movedY / 100);
      } else {
        const x = startingPosition.x + movedX;
        const y = startingPosition.y + movedY;
        this.position = { x, y };
      }
    };
    function pointerupHandler(ev: MouseEvent) {
      ev.preventDefault();
      window.removeEventListener("pointermove", pointermoveHandler);
      window.removeEventListener("pointerup", pointerupHandler);
    }
    window.addEventListener("pointermove", pointermoveHandler);
    window.addEventListener("pointerup", pointerupHandler);
  };

  private wheelHandler = (ev: WheelEvent) => {
    ev.preventDefault();

    const delta = (ev.deltaY * -1) / 1000;
    this.position.x + delta;
    this.position.y + delta;
    this.setZoom(this.zoom + delta);

    const context = this.context;

    if (context) {
      const transform = context.getTransform();
      const invertedScaleX = 1 / transform.a;
      const invertedScaleY = 1 / transform.d;

      const transformedX =
        invertedScaleX * this.position.x - invertedScaleX * transform.e;
      const transformedY =
        invertedScaleY * this.position.y - invertedScaleY * transform.f;

      this.position.x = transformedX;
      this.position.y = transformedY;
    }
  };
}
