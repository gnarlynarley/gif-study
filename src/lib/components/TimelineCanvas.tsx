import React from "react";
import MovableCanvasRender from "../MovableCanvasRender";
import TimelinePlayback from "../TimelinePlayback";
import { IconButton } from "./IconButton";
import { ZoomInIcon, ZoomOutIcon } from "./Icons";
import type { ScreenFilterOptions } from "../ScreenFilter";
import $ from "./TimelineCanvas.module.scss";
import useToast from "../hooks/useToast";

type Props = {
  timelinePlayback: TimelinePlayback;
  onionSkinFilterOptions: ScreenFilterOptions;
};

const ZOOM_AMOUNT = 0.2;

export function TimelineCanvas({
  timelinePlayback,
  onionSkinFilterOptions,
}: Props) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const movableCanvasRenderRef = React.useRef<MovableCanvasRender | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const instance = new MovableCanvasRender({
      timelinePlayback,
      onionSkinFilterOptions,
      canvas,
    });

    movableCanvasRenderRef.current = instance;

    return () => instance.destroy();
  }, [timelinePlayback]);

  React.useEffect(() => {
    movableCanvasRenderRef.current?.setOnionSkinOptions(onionSkinFilterOptions);
  }, [onionSkinFilterOptions]);

  const setZoom = (add: number) => {
    movableCanvasRenderRef.current?.addZoom(add);
  };

  return (
    <div className={$.container}>
      <div className={$.tools}>
        <IconButton onClick={() => setZoom(ZOOM_AMOUNT)} label="Zoom in">
          <ZoomInIcon />
        </IconButton>
        <IconButton onClick={() => setZoom(ZOOM_AMOUNT * -1)} label="Zoom out">
          <ZoomOutIcon />
        </IconButton>
        <span className={$.toolsLine} />
      </div>
      <canvas ref={canvasRef} className={$.canvas} />
    </div>
  );
}
