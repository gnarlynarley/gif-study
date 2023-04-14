import React from "react";
import MovableCanvasRender from "../MovableCanvasRender";
import TimelinePlayback from "../TimelinePlayback";
import { IconButton } from "./IconButton";
import { ZoomInIcon, ZoomOutIcon } from "./Icons";
import type { ScreenFilterOptions } from "../ScreenFilter";
import $ from "./TimelineCanvas.module.scss";

type Props = {
  timelinePlayback: TimelinePlayback;
  onionSkinFilterOptions: ScreenFilterOptions;
};

const ZOOM_AMOUNT = 0.2;

export function TimelineCanvas({
  timelinePlayback,
  onionSkinFilterOptions,
}: Props) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = React.useState({
    width: 0,
    height: 0,
  });

  React.useEffect(() => {
    const container = containerRef.current as HTMLDivElement;
    const observer = new ResizeObserver(([entry]) => {
      setContainerSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const movableCanvasRenderRef = React.useRef<MovableCanvasRender | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const instance = new MovableCanvasRender({
      timelinePlayback,
      onionSkinFilterOptions,
    });

    movableCanvasRenderRef.current = instance;

    instance.setCanvas(canvas);

    return () => instance.destroy();
  }, [timelinePlayback]);

  React.useEffect(() => {
    movableCanvasRenderRef.current?.setOnionSkinOptions(onionSkinFilterOptions);
  }, [onionSkinFilterOptions]);

  const setZoom = (add: number) => {
    movableCanvasRenderRef.current?.addZoom(add);
  };

  return (
    <div className={$.container} ref={containerRef}>
      <div className={$.tools}>
        <IconButton onClick={() => setZoom(ZOOM_AMOUNT)} label="Zoom in">
          <ZoomInIcon />
        </IconButton>
        <IconButton onClick={() => setZoom(ZOOM_AMOUNT * -1)} label="Zoom out">
          <ZoomOutIcon />
        </IconButton>
        <span className={$.toolsLine} />
      </div>
      <canvas
        ref={canvasRef}
        className={$.canvas}
        width={containerSize.width}
        height={containerSize.height}
      />
    </div>
  );
}
