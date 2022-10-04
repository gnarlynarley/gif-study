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
  onionSkinOpacity: number;
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

interface ApplyOnionSkinOptions {
  contrastLevel: number;
  prevColor: string;
  nextColor: string;
  opacity: number;
}

function createApplyOnionSkin({
  contrastLevel,
  nextColor,
  prevColor,
  opacity,
}: ApplyOnionSkinOptions) {
  const cache = new WeakMap<ImageData, ImageData>();

  return function applyOnionSkin(
    current: ImageData,
    prev: ImageData,
    next: ImageData
  ): ImageData {
    let result = cache.get(current);

    if (!result) {
      const { width, height } = current;
      const offscreen = createCanvas(width, height);
      const destination = createCanvas(width, height);

      destination.context.putImageData(
        applyContrast(current, contrastLevel),
        0,
        0
      );
      destination.context.globalAlpha = opacity;
      destination.context.drawImage(offscreen.canvas, 0, 0);

      [
        { color: prevColor, frame: prev },
        { color: nextColor, frame: next },
      ].forEach(({ color, frame }) => {
        offscreen.context.putImageData(
          applyContrast(frame, contrastLevel),
          0,
          0
        );
        offscreen.context.globalCompositeOperation = "screen";
        offscreen.context.fillStyle = color;
        offscreen.context.fillRect(0, 0, width, height);

        destination.context.globalCompositeOperation = "multiply";
        destination.context.drawImage(offscreen.canvas, 0, 0);
      });

      result = destination.context.getImageData(
        0,
        0,
        destination.canvas.width,
        destination.canvas.height
      );
      cache.set(current, result);
    }

    return result;
  };
}

export function TimelineCanvas({
  timeline,
  currentFrame,
  onionSkinEnabled,
  onionSkinContrastLevel,
  onionSkinPrevColor,
  onionSkinNextColor,
  onionSkinOpacity,
}: Props) {
  const applyOnionSkin = React.useMemo(() => {
    return createApplyOnionSkin({
      contrastLevel: onionSkinContrastLevel * 255,
      prevColor: onionSkinPrevColor,
      nextColor: onionSkinNextColor,
      opacity: onionSkinOpacity,
    });
  }, [
    onionSkinContrastLevel,
    onionSkinPrevColor,
    onionSkinNextColor,
    onionSkinOpacity,
  ]);

  const imageData = React.useMemo((): ImageData | null => {
    if (timeline === null || currentFrame === null) return null;
    const { frames } = timeline;
    if (!onionSkinEnabled) return currentFrame.data;

    const currentIndex = frames.indexOf(currentFrame);
    const prevFrame = frames.at(currentIndex - 1);
    const nextFrame = frames.at((currentIndex + 1) % frames.length);
    if (prevFrame && nextFrame) {
      return applyOnionSkin(currentFrame.data, prevFrame.data, nextFrame.data);
    }

    return null;
  }, [currentFrame, applyOnionSkin]);

  if (!imageData) return null;

  return <ImageDataCanvas data={imageData} />;
}
