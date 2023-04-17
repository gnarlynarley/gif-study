import { assert } from "./utils/assert";
import setMoveEvent from "./utils/setMoveEvent";

interface DrawingCanvasOptions {
  canvas: HTMLCanvasElement;
  container: HTMLElement;
}

type ToolType = "none" | "brush" | "eraser";

export class DrawingCanvas {
  container: HTMLElement;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  resizeObserver = new ResizeObserver(() => {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  });
  destroyMoveEvent: () => void;

  constructor({ canvas, container }: DrawingCanvasOptions) {
    const context = canvas.getContext("2d");
    assert(context);
    this.container = container;
    this.canvas = canvas;
    this.context = context;
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
    this.resizeObserver.observe(this.canvas);
    this.destroyMoveEvent = setMoveEvent(
      this.container,
      ({ x, y, previousX, previousY }) => {
        context.beginPath();
        context.strokeStyle = "red";
        context.lineWidth = 1;
        context.lineJoin = "round";
        context.moveTo(previousX, previousY);
        context.lineTo(x, y);
        context.closePath();
        context.stroke();
      },
    );
  }

  render() {}

  destroy() {
    this.resizeObserver.disconnect();
    this.destroyMoveEvent();
  }

  setTool(tool: ToolType) {}
}
