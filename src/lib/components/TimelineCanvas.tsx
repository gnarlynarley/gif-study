import React from "react";
import { Timeline, TimelineFrame } from "../models";
import { createCanvas } from "../utils/createCanvas";
import { ImageDataCanvas } from "./ImageDataCanvas";

type Props = {
  timeline: Timeline | null;
  currentFrame: TimelineFrame | null;
  onionSkinEnabled: boolean;
  onionSkinContrastLevel: number;
  onionSkinPrevColor: string;
  onionSkinNextColor: string;
};

function applyContrast(imageData: ImageData, removeBelow: number) {
  const copy = new ImageData(imageData.width, imageData.height);

  for (let i = 0; i < copy.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];
    const a = imageData.data[i + 3];
    const average = (r + g + b) / 3;
    if (average < removeBelow) {
      copy.data[i] = 0;
      copy.data[i + 1] = 0;
      copy.data[i + 2] = 0;
      copy.data[i + 3] = 255;
    } else {
      copy.data[i] = 255;
      copy.data[i + 1] = 255;
      copy.data[i + 2] = 255;
      copy.data[i + 3] = 255;
    }
  }

  return copy;
}

function applyOnionSkin(
  current: ImageData,
  prev: ImageData,
  next: ImageData,
  colorLevel: number,
  onionSkinPrevColor: string,
  onionSkinNextColor: string
): ImageData {
  const { width, height } = current;
  const offscreen = createCanvas(width, height);
  const destination = createCanvas(width, height);

  destination.context.putImageData(applyContrast(current, colorLevel), 0, 0);
  destination.context.globalAlpha = 0.4;
  destination.context.drawImage(offscreen.canvas, 0, 0);

  [
    { color: onionSkinPrevColor, frame: prev },
    { color: onionSkinNextColor, frame: next },
  ].forEach(({ color, frame }) => {
    offscreen.context.putImageData(applyContrast(frame, colorLevel), 0, 0);
    offscreen.context.globalCompositeOperation = "screen";
    offscreen.context.fillStyle = color;
    offscreen.context.fillRect(0, 0, width, height);

    destination.context.globalCompositeOperation = "multiply";
    destination.context.drawImage(offscreen.canvas, 0, 0);
  });

  return destination.context.getImageData(
    0,
    0,
    destination.canvas.width,
    destination.canvas.height
  );
}

export function TimelineCanvas({
  timeline,
  currentFrame,
  onionSkinEnabled,
  onionSkinContrastLevel,
  onionSkinPrevColor,
  onionSkinNextColor,
}: Props) {
  const cache = React.useMemo(() => {
    return new WeakMap<ImageData, ImageData>();
  }, [
    onionSkinContrastLevel,
    onionSkinPrevColor,
    onionSkinNextColor,
  ]);
  const imageData = React.useMemo((): ImageData | null => {
    if (timeline === null || currentFrame === null) return null;
    const { frames } = timeline;
    if (!onionSkinEnabled) return currentFrame.data;

    let data = cache.get(currentFrame.data) ?? null;

    if (data === null) {
      const currentIndex = frames.indexOf(currentFrame);
      const prevFrame = frames.at(currentIndex - 1);
      const nextFrame = frames.at((currentIndex + 1) % frames.length);
      if (prevFrame && nextFrame) {
        data = applyOnionSkin(
          currentFrame.data,
          prevFrame.data,
          nextFrame.data,
          onionSkinContrastLevel * 255,
          onionSkinPrevColor,
          onionSkinNextColor
        );
        cache.set(currentFrame.data, data);
      }
    }

    return data;
  }, [
    currentFrame,
    onionSkinEnabled,
    onionSkinContrastLevel,
    onionSkinPrevColor,
    onionSkinNextColor,
  ]);

  if (!imageData) return null;

  return <ImageDataCanvas data={imageData} />;
}
