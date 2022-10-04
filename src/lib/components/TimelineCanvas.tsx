import React from "react";
import { Timeline, TimelineFrame } from "../models";
import { createCanvas } from "../utils/createCanvas";
import { ImageDataCanvas } from "./ImageDataCanvas";

type Props = {
  timeline: Timeline | null;
  currentFrame: TimelineFrame | null;
};

function applyOnionSkin(
  current: ImageData,
  prev: ImageData,
  next: ImageData
): ImageData {
  const { width, height } = current;
  const offscreen = createCanvas(width, height);
  const destination = createCanvas(width, height);

  destination.context.putImageData(current, 0, 0);
  destination.context.globalAlpha = 0.5;
  destination.context.globalCompositeOperation = "multiply";
  destination.context.drawImage(offscreen.canvas, 0, 0);

  offscreen.context.putImageData(prev, 0, 0);
  offscreen.context.fillStyle = "blue";
  offscreen.context.globalCompositeOperation = "color";
  offscreen.context.fillRect(0, 0, width, height);
  destination.context.drawImage(offscreen.canvas, 0, 0);

  offscreen.context.putImageData(next, 0, 0);
  offscreen.context.fillStyle = "red";
  offscreen.context.globalCompositeOperation = "color";
  offscreen.context.fillRect(0, 0, width, height);
  destination.context.drawImage(offscreen.canvas, 0, 0);

  return destination.context.getImageData(
    0,
    0,
    destination.canvas.width,
    destination.canvas.height
  );
}

export function TimelineCanvas({ timeline, currentFrame }: Props) {
  const imageData = React.useMemo((): ImageData | null => {
    if (timeline === null || currentFrame === null) return null;
    const { frames, renderCache } = timeline;
    let imageData = renderCache.get(currentFrame.data) ?? null;

    if (imageData === null) {
      const currentIndex = frames.indexOf(currentFrame);
      const prevFrame = frames.at(currentIndex - 1);
      const nextFrame = frames.at((currentIndex + 1) % frames.length);
      if (prevFrame && nextFrame) {
        return applyOnionSkin(
          currentFrame.data,
          prevFrame.data,
          nextFrame.data
        );
      }

      // renderCache.set(currentFrame.data, imageData);
    }

    return imageData;
  }, [timeline, currentFrame]);

  if (!imageData) return null;

  return <ImageDataCanvas data={imageData} />;
}
