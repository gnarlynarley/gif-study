import React from "react";
import type MovableTimelineCanvas from "../canvas/MovableTimelineCanvas";
import { usePreviousValue, useValueRef } from "../hooks";
import { Timeline, TimelineFrame } from "../models";
import { toPercentage } from "../utils/calcModulo";
import { createCanvas } from "../utils/createCanvas";
import { cx } from "../utils/joinClassNames";
import { IconButton } from "./IconButton";
import { ZoomInIcon, ZoomOutIcon } from "./Icons";
import $ from "./TimelineCanvas.module.scss";

type Props = {
  timelineCanvasInstance: MovableTimelineCanvas;
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
  unionFrames: number;
  frames: ImageData[];
}

function createApplyOnionSkin({
  contrastLevel,
  nextColor,
  prevColor,
  opacity,
  frames,
  unionFrames,
}: ApplyOnionSkinOptions) {
  const maxUnionFrames = Math.floor(frames.length / 2);
  const frameCache = new WeakMap<ImageData, ImageData>();
  const cache = new WeakMap<ImageData, ImageData>();
  const offscreen = createCanvas();
  const destination = createCanvas();

  function createFrame(frame: ImageData) {
    let result = frameCache.get(frame);

    if (!result) {
      result = applyContrast(frame, contrastLevel);
      frameCache.set(frame, result);
    }

    return result;
  }

  return {
    applyOnionSkin(current: ImageData): ImageData {
      let result = cache.get(current);
      const currentIndex = frames.indexOf(current);

      if (!result) {
        const { width, height } = current;
        offscreen.canvas.width = width;
        offscreen.canvas.height = height;
        destination.canvas.width = width;
        destination.canvas.height = height;

        destination.context.putImageData(createFrame(current), 0, 0);
        destination.context.drawImage(offscreen.canvas, 0, 0);
        const _unionFrames = Math.min(maxUnionFrames, unionFrames);

        for (let i = _unionFrames * -1; i < _unionFrames + 1; i += 1) {
          if (i === 0) i = 1;

          const frame = frames.at(
            (frames.length + i + currentIndex) % frames.length
          );
          const currentOpacity = opacity;
          if (frame) {
            destination.context.globalAlpha = currentOpacity;
            offscreen.context.putImageData(createFrame(frame), 0, 0);
            offscreen.context.globalCompositeOperation = "screen";
            offscreen.context.fillStyle = i > 0 ? nextColor : prevColor;
            offscreen.context.fillRect(0, 0, width, height);
            destination.context.globalCompositeOperation = "multiply";
            destination.context.drawImage(offscreen.canvas, 0, 0);
          }
        }

        result = destination.context.getImageData(
          0,
          0,
          destination.canvas.width,
          destination.canvas.height
        );
        cache.set(current, result);
      }

      return result;
    },
    cleanup() {
      offscreen.cleanup();
      destination.cleanup();
    },
  };
}

const MIN_ZOOM_LEVEL = 0.01;
const MAX_ZOOM_LEVEL = 5;
const ZOOM_AMOUNT = 0.2;

export function TimelineCanvas({
  timelineCanvasInstance,
  timeline,
  currentFrame,
  onionSkinEnabled,
  onionSkinContrastLevel,
  onionSkinPrevColor,
  onionSkinNextColor,
  onionSkinOpacity,
}: Props) {
  // const onionSkin = React.useMemo(() => {
  //   return createApplyOnionSkin({
  //     contrastLevel: onionSkinContrastLevel * 255,
  //     prevColor: onionSkinPrevColor,
  //     nextColor: onionSkinNextColor,
  //     opacity: onionSkinOpacity,
  //     frames: timeline?.frames.map((frame) => frame.data) ?? [],
  //     unionFrames: 1,
  //   });
  // }, [
  //   timeline?.frames,
  //   onionSkinContrastLevel,
  //   onionSkinPrevColor,
  //   onionSkinNextColor,
  //   onionSkinOpacity,
  // ]);

  // const lastOnionSkin = usePreviousValue(onionSkin);

  // React.useEffect(() => {
  //   lastOnionSkin?.cleanup();
  // }, [lastOnionSkin]);

  // const imageData = React.useMemo((): ImageData | null => {
  //   if (timeline === null || currentFrame === null) return null;
  //   if (!onionSkinEnabled) return currentFrame.data;

  //   return onionSkin.applyOnionSkin(currentFrame.data);
  // }, [currentFrame, onionSkin, onionSkinEnabled]);

  // const playbackCanvasRef = React.useRef<HTMLCanvasElement>(null);
  // const contextRef = React.useRef<CanvasRenderingContext2D | null>(null);

  // React.useEffect(() => {
  //   contextRef.current = playbackCanvasRef.current?.getContext("2d") ?? null;
  //   if (contextRef.current === null)
  //     throw new Error("Something went wrong with the setup");
  // }, []);

  // const containerRef = React.useRef<HTMLDivElement>(null);
  // const [size, setSize] = React.useState({ width: 0, height: 0 });

  // React.useEffect(() => {
  //   const container = containerRef.current as HTMLDivElement;
  //   const observer = new ResizeObserver(() => {
  //     setSize({ width: container.offsetWidth, height: container.offsetHeight });
  //   });
  //   observer.observe(container);

  //   return () => {
  //     observer.disconnect();
  //   };
  // }, []);

  // const [canvasCache] = React.useState(
  //   () => new WeakMap<ImageData, HTMLCanvasElement>()
  // );
  // const imageCanvas = React.useMemo(() => {
  //   if (!imageData) return null;
  //   let canvas = canvasCache.get(imageData);

  //   if (!canvas) {
  //     canvas = document.createElement("canvas");
  //     canvas.width = imageData.width;
  //     canvas.height = imageData.height;
  //     canvas.getContext("2d")?.putImageData(imageData, 0, 0);
  //   }

  //   return canvas;
  // }, [imageData]);

  // const [zoom, setZoom] = React.useState(1);
  // const zoomRef = useValueRef(zoom);
  // const [position, setPosition] = React.useState({ x: 0, y: 0 });
  // const positionRef = useValueRef(position);

  // React.useEffect(() => {
  //   const container = containerRef.current;
  //   if (!container) return;
  //   function handler(ev: WheelEvent) {
  //     ev.preventDefault();

  //     const delta = (ev.deltaY * -1) / 1000;
  //     setPosition((prev) => ({ x: prev.x + delta, y: prev.y + delta }));
  //     setZoom((value) =>
  //       Math.min(Math.max(MIN_ZOOM_LEVEL, value + delta), MAX_ZOOM_LEVEL)
  //     );

  //     const context = contextRef.current as CanvasRenderingContext2D;

  //     const transform = context.getTransform();
  //     const invertedScaleX = 1 / transform.a;
  //     const invertedScaleY = 1 / transform.d;

  //     const transformedX =
  //       invertedScaleX * positionRef.current.x - invertedScaleX * transform.e;
  //     const transformedY =
  //       invertedScaleY * positionRef.current.y - invertedScaleY * transform.f;

  //     setPosition({ x: transformedX, y: transformedY });
  //   }
  //   container.addEventListener("wheel", handler, false);

  //   return () => {
  //     container.removeEventListener("wheel", handler);
  //   };
  // }, []);

  // React.useEffect(() => {
  //   if (!imageCanvas) return;
  //   const context = contextRef.current as CanvasRenderingContext2D;
  //   context.clearRect(0, 0, size.width, size.height);
  //   context.save();
  //   context.translate(
  //     size.width / 2 + position.x * -1,
  //     size.height / 2 + position.y * -1
  //   );
  //   context.scale(zoom, zoom);
  //   context.drawImage(
  //     imageCanvas,
  //     imageCanvas.width * -0.5,
  //     imageCanvas.height * -0.5
  //   );
  //   context.restore();
  // }, [imageCanvas, size, position, zoom]);

  // const [active, setActive] = React.useState(false);

  // React.useEffect(() => {
  //   setPosition({ x: 0, y: 0 });
  //   setZoom(1);
  // }, [timeline?.id]);

  // const pointerDownHandler = (ev: React.MouseEvent) => {
  //   const container = containerRef.current;
  //   if (!container) return;
  //   const zoomingMode = ev.metaKey || ev.ctrlKey || false;
  //   setActive(true);
  //   const startingX = ev.clientX;
  //   const startingY = ev.clientY;
  //   const startingPosition = positionRef.current;
  //   const startingZoom = zoomRef.current;

  //   function pointermoveHandler(ev: MouseEvent) {
  //     ev.preventDefault();
  //     const movedX = startingX - ev.clientX;
  //     const movedY = startingY - ev.clientY;
  //     if (zoomingMode) {
  //       setZoom(
  //         Math.min(
  //           Math.max(MIN_ZOOM_LEVEL, startingZoom + movedY / 100),
  //           MAX_ZOOM_LEVEL
  //         )
  //       );
  //     } else {
  //       const x = startingPosition.x + movedX;
  //       const y = startingPosition.y + movedY;

  //       setPosition({ x, y });
  //     }
  //   }
  //   function pointerupHandler(ev: MouseEvent) {
  //     ev.preventDefault();
  //     window.removeEventListener("pointermove", pointermoveHandler);
  //     window.removeEventListener("pointerup", pointerupHandler);
  //     setActive(false);
  //   }

  //   window.addEventListener("pointermove", pointermoveHandler);
  //   window.addEventListener("pointerup", pointerupHandler);
  // };

  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const zoomIn = () => {};
  const zoomOut = () => {};

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      timelineCanvasInstance.setCanvas(canvas);

      return () => {
        timelineCanvasInstance.setCanvas(null);
      };
    }
  }, [timelineCanvasInstance]);

  return (
    <div className={$.container} ref={containerRef}>
      <div className={$.tools}>
        <IconButton onClick={zoomIn} label="Zoom in">
          <ZoomInIcon />
        </IconButton>
        <IconButton onClick={zoomOut} label="Zoom out">
          <ZoomOutIcon />
        </IconButton>
        <span className={$.toolsLine} />
      </div>
      <canvas ref={canvasRef} className={$.canvas} />
    </div>
  );
}
