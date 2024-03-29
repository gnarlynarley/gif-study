import { Timeline, TimelineFrame } from "./models";
import { assert } from "./utils/assert";
import { createCanvas } from "./utils/createCanvas";

export interface ScreenFilterOptions {
  contrastEnabled: boolean;
  contrastLevel: number;
  onionSkinEnabled: boolean;
  onionSkinPrevColor: string;
  onionSkinNextColor: string;
  onionSkinOpacity: number;
  onionSkinSteps: number;
}

function getFrames({ frames, trimStart, trimEnd }: Timeline): TimelineFrame[] {
  return frames.filter((frame) => {
    if (frame.time < trimStart) return false;
    if (frame.time + frame.duration > trimEnd) return false;
    return true;
  });
}

export default class ScreenFilter {
  contrastCache = new WeakMap<ImageData, HTMLCanvasElement>();
  options: ScreenFilterOptions;
  frames: TimelineFrame[] = [];

  constructor(options: ScreenFilterOptions, timeline: Timeline) {
    this.options = options;
    this.updateTimeline(timeline);
  }

  updateTimeline(timeline: Timeline) {
    this.frames = getFrames(timeline);
    this.cache = new WeakMap();
  }

  setOptions(options: ScreenFilterOptions) {
    this.options = options;
    this.contrastCache = new WeakMap();
    this.cache = new WeakMap();
  }

  applyContrast(imageData: ImageData): HTMLCanvasElement {
    let canvas = this.contrastCache.get(imageData);

    if (!canvas) {
      const destination = createCanvas(imageData.width, imageData.height);
      const contrastLevel = this.options.contrastLevel * 255;

      if (this.options.contrastEnabled) {
        const newData = new ImageData(imageData.width, imageData.height);

        for (let i = 0; i < newData.data.length; i += 4) {
          const r = imageData.data[i];
          const g = imageData.data[i + 1];
          const b = imageData.data[i + 2];
          const average = (r + g + b) / 3;
          // const average = r * 0.3 + g * 0.59 + b * 0.11;
          // const average = (Math.min(r, g, b) + Math.max(r, g, b)) / 2;

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
      } else {
        destination.context.putImageData(imageData, 0, 0);
      }

      this.contrastCache.set(imageData, destination.canvas);
      canvas = destination.canvas;
    }

    return canvas;
  }

  cache = new WeakMap<ImageData, HTMLCanvasElement>();

  apply(imageData: ImageData): HTMLCanvasElement {
    let result = this.cache.get(imageData);

    if (result) return result;

    const { width, height } = imageData;
    const destination = createCanvas(width, height);

    if (!this.options.onionSkinEnabled) {
      destination.context.putImageData(imageData, 0, 0);
      return destination.canvas;
    }

    const { frames } = this;
    const {
      onionSkinOpacity: opacity,
      onionSkinSteps: steps,
      onionSkinPrevColor: prevColor,
      onionSkinNextColor: nextColor,
      onionSkinEnabled: enabled,
    } = this.options;

    const offscreen = createCanvas(width, height);
    const currentIndex = frames.findIndex((frame) => frame.data === imageData);

    assert(currentIndex !== -1);

    destination.context.drawImage(this.applyContrast(imageData), 0, 0);

    for (let i = steps * -1; i < steps; i += 1) {
      if (i === 0) i = 1;

      const frame = frames.at(
        (frames.length + i + currentIndex) % frames.length,
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

    offscreen.cleanup();

    result = destination.canvas;
    this.cache.set(imageData, result);

    return result;
  }
}
