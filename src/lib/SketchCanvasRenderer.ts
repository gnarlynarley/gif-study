import EventEmitter from "./utils/EventEmitter";
import { Canvas, createCanvas } from "./utils/createCanvas";
import Vector from "./utils/game/Vector";
import setMoveEvent from "./utils/setMoveEvent";

interface SketchCanvasRendererOptions {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
  position: { x: number; y: number };
}

function erasePoint(
  context: CanvasRenderingContext2D,
  { x, y }: Vector,
  radius: number,
) {
  context.save();
  context.beginPath();

  context.arc(x, y, radius, 0, Math.PI * 2);

  context.clip();
  context.clearRect(x - radius, y - radius, radius * 2, radius * 2);
  context.restore();
}

const STEP = 1;

function eraseLine(
  context: CanvasRenderingContext2D,
  from: Vector,
  to: Vector,
  radius: number,
) {
  const direction = to.sub(from);
  const mag = direction.mag();
  const steps = Math.floor(mag / STEP);
  const magStep = mag / steps;
  for (let i = 0; i < steps; i += 1) {
    const position = from.add(direction.normalize().mult(magStep * i));
    console.log(from, position);
    erasePoint(context, position, radius);
  }
}

export class SketchCanvasRenderer {
  offset: number;
  widthWithOffset: number;
  heightWithOffset: number;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  position: { x: number; y: number };
  brushSize = 5;
  eraserSize = 10;

  document: Canvas;

  events = {
    documentChanged: new EventEmitter<void>(),
  };

  constructor({
    canvas,
    context,
    width,
    height,
    position,
  }: SketchCanvasRendererOptions) {
    this.offset = Math.max(width, height) * 0.2;
    this.widthWithOffset = width + this.offset * 2;
    this.heightWithOffset = height + this.offset * 2;
    this.canvas = canvas;
    this.context = context;
    this.position = position;
    this.document = createCanvas(this.widthWithOffset, this.heightWithOffset);
  }

  drawDocument = (
    x: number,
    y: number,
    previousX: number,
    previousY: number,
    tool: "brush" | "eraser",
    position: Vector,
    zoom: number,
  ) => {
    const { brushSize, eraserSize, canvas, widthWithOffset, heightWithOffset } =
      this;
    const { context } = this.document;
    let offsetX = canvas.width - widthWithOffset;
    let offsetY = canvas.height - heightWithOffset;
    offsetX *= 0.5;
    offsetY *= 0.5;
    offsetX += position.x;
    offsetY += position.y;
    const brushPositionX = x - offsetX;
    const brushPositionY = y - offsetY;
    switch (tool) {
      case "brush": {
        context.beginPath();
        context.arc(
          brushPositionX,
          brushPositionY,
          brushSize / 2,
          0,
          Math.PI * 2,
        );
        context.fill();
        context.beginPath();
        context.lineWidth = brushSize;
        context.moveTo(previousX - offsetX, previousY - offsetY);
        context.lineTo(brushPositionX, brushPositionY);
        context.stroke();

        break;
      }
      case "eraser": {
        eraseLine(
          context,
          new Vector(brushPositionX, brushPositionY),
          new Vector(previousX - offsetX, previousY - offsetY),
          eraserSize / 2,
        );
        break;
      }
    }
    this.events.documentChanged.emit();
  };

  render() {
    this.context.drawImage(
      this.document.canvas,
      this.offset * -1,
      this.offset * -1,
    );
  }

  destroy() {}
}
