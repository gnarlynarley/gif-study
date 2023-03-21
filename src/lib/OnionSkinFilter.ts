import Color from "color";
import { TimelineFrame } from "./models";
import { assert } from "./utils/assert";
import { createCanvas } from "./utils/createCanvas";

export interface OnionSkinFilterOptions {
  enabled: boolean;
  contrastLevel: number;
  prevColor: string;
  nextColor: string;
  opacity: number;
  steps: number;
}

export default class OnionSkinFilter {
  contrastCache = new WeakMap<ImageData, HTMLCanvasElement>();
  options: OnionSkinFilterOptions;
  frames: TimelineFrame[];

  constructor(options: OnionSkinFilterOptions, frames: TimelineFrame[]) {
    this.frames = frames;
    this.options = options;
  }

  setOptions(options: OnionSkinFilterOptions) {
    this.options = options;
    this.contrastCache = new Map();
    this.cache = new Map();
  }

  applyContrast(imageData: ImageData): HTMLCanvasElement {
    let canvas = this.contrastCache.get(imageData);

    if (!canvas) {
      const destination = createCanvas(imageData.width, imageData.height);
      const contrastLevel = this.options.contrastLevel * 255;
      const newData = new ImageData(imageData.width, imageData.height);

      for (let i = 0; i < newData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const average = (r + g + b) / 3;

        if (average < contrastLevel) {
          const color = (average / 255) * contrastLevel;
          newData.data[i] = color;
          newData.data[i + 1] = color;
          newData.data[i + 2] = color;
          newData.data[i + 3] = 255;
        } else {
          newData.data[i] = 255;
          newData.data[i + 1] = 255;
          newData.data[i + 2] = 255;
          newData.data[i + 3] = 255;
        }
      }

      destination.context.putImageData(newData, 0, 0);

      this.contrastCache.set(imageData, destination.canvas);
      canvas = destination.canvas;
    }

    return canvas;
  }

  cache = new WeakMap<ImageData, ImageData>();

  apply(imageData: ImageData): ImageData {
    if (!this.options.enabled) return imageData;

    let newData = this.cache.get(imageData);

    if (!newData) {
      const { frames } = this;
      const { opacity, steps, prevColor, nextColor, enabled } = this.options;
      const { width, height } = imageData;

      const offscreen = createCanvas(width, height);
      const destination = createCanvas(width, height);
      const currentIndex = frames.findIndex(
        (frame) => frame.data === imageData
      );

      assert(currentIndex !== -1);

      destination.context.drawImage(this.applyContrast(imageData), 0, 0);

      for (let i = steps * -1; i < steps; i += 1) {
        if (i === 0) i = 1;

        const frame = frames.at(
          (frames.length + i + currentIndex) % frames.length
        );
        if (!frame) break;

        destination.context.globalAlpha = opacity / Math.abs(i);
        offscreen.context.drawImage(this.applyContrast(frame.data), 0, 0);
        offscreen.context.globalCompositeOperation = "screen";
        offscreen.context.fillStyle = i > 0 ? nextColor : prevColor;
        offscreen.context.fillRect(0, 0, width, height);

        destination.context.globalCompositeOperation = "multiply";
        destination.context.drawImage(offscreen.canvas, 0, 0);

        offscreen.context.clearRect(0, 0, width, height);
      }

      newData = destination.context.getImageData(0, 0, width, height);

      offscreen.cleanup();
      destination.cleanup();

      this.cache.set(imageData, newData);
    }

    return newData;
  }
}