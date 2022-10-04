import React from "react";
import { Timeline, TimelineFrame } from "../models";
import { createCanvas } from "../utils/createCanvas";
import { cx } from "../utils/joinClassNames";
import $ from "./TimelineCanvas.module.scss";

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
    const average = (r + g + b) / 3;

    if (average < removeBelow) {
      const color = (average / 255) * removeBelow;
      copy.data[i] = color;
      copy.data[i + 1] = color;
      copy.data[i + 2] = color;
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
  const offscreen = createCanvas();
  const destination = createCanvas();

  return function applyOnionSkin(
    current: ImageData,
    prev: ImageData,
    next: ImageData
  ): ImageData {
    let result = cache.get(current);

    if (!result) {
      const { width, height } = current;
      offscreen.canvas.width = width;
      offscreen.canvas.height = height;
      destination.canvas.width = width;
      destination.canvas.height = height;

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
  }, [currentFrame, applyOnionSkin, onionSkinEnabled]);

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const contextRef = React.useRef<CanvasRenderingContext2D | null>(null);

  React.useEffect(() => {
    contextRef.current = canvasRef.current?.getContext("2d") ?? null;
    if (contextRef.current === null)
      throw new Error("Something went wrong with the setup");
  }, []);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const [size, setSize] = React.useState({ width: 0, height: 0 });
  React.useEffect(() => {
    const container = containerRef.current as HTMLDivElement;
    const observer = new ResizeObserver(() => {
      setSize({ width: container.offsetWidth, height: container.offsetHeight });
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  const [canvasCache] = React.useState(
    () => new WeakMap<ImageData, HTMLCanvasElement>()
  );
  const imageCanvas = React.useMemo(() => {
    if (!imageData) return null;
    let canvas = canvasCache.get(imageData);

    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.width = imageData.width;
      canvas.height = imageData.height;
      canvas.getContext("2d")?.putImageData(imageData, 0, 0);
    }

    return canvas;
  }, [imageData]);

  const [zoom, setZoom] = React.useState(1);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const positionRef = React.useRef(position);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    function handler(ev: WheelEvent) {
      ev.preventDefault();

      const delta = (ev.deltaY * -1) / 100;
      setPosition((prev) => ({ x: prev.x + delta, y: prev.y + delta }));
      setZoom((value) => Math.min(Math.max(0.01, value + delta), 10));

      const context = contextRef.current as CanvasRenderingContext2D;

      const transform = context.getTransform();
      const invertedScaleX = 1 / transform.a;
      const invertedScaleY = 1 / transform.d;

      const transformedX =
        invertedScaleX * positionRef.current.x - invertedScaleX * transform.e;
      const transformedY =
        invertedScaleY * positionRef.current.y - invertedScaleY * transform.f;

      setPosition({ x: transformedX, y: transformedY });
    }
    container.addEventListener("wheel", handler, false);

    return () => {
      container.removeEventListener("wheel", handler);
    };
  }, []);

  React.useEffect(() => {
    if (!imageCanvas) return;
    const context = contextRef.current as CanvasRenderingContext2D;
    context.clearRect(0, 0, size.width, size.height);
    context.save();
    context.translate(
      size.width / 2 + position.x * -1,
      size.height / 2 + position.y * -1
    );
    context.scale(zoom, zoom);
    context.drawImage(
      imageCanvas,
      imageCanvas.width * -0.5,
      imageCanvas.height * -0.5
    );
    context.restore();
  }, [imageCanvas, size, position, zoom]);

  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
    setPosition({ x: 0, y: 0 });
    setZoom(1);
  }, [timeline?.id]);

  return (
    <div
      className={cx($.container, active && $.isActive)}
      onPointerDown={(ev) => {
        const container = containerRef.current;
        if (!container) return;
        setActive(true);
        const startingX = ev.clientX;
        const startingY = ev.clientY;
        const startingPosition = position;

        function pointermoveHandler(ev: MouseEvent) {
          ev.preventDefault();
          const x = startingPosition.x + (startingX - ev.clientX);
          const y = startingPosition.y + (startingY - ev.clientY);

          setPosition({ x, y });
        }
        function pointerupHandler(ev: MouseEvent) {
          ev.preventDefault();
          window.removeEventListener("pointermove", pointermoveHandler);
          window.removeEventListener("pointerup", pointerupHandler);
          setActive(false);
        }

        window.addEventListener("pointermove", pointermoveHandler);
        window.addEventListener("pointerup", pointerupHandler);
      }}
      ref={containerRef}
    >
      <canvas
        ref={canvasRef}
        className={$.canvas}
        width={size.width}
        height={size.height}
      />
    </div>
  );
}
