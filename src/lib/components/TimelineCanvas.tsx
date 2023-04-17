import React from "react";
import MovableCanvasRender from "../MovableCanvasRender";
import TimelinePlayback from "../TimelinePlayback";
import { IconButton } from "./IconButton";
import { ZoomInIcon, ZoomOutIcon } from "./Icons";
import type { ScreenFilterOptions } from "../ScreenFilter";
import $ from "./TimelineCanvas.module.scss";
import { DrawingCanvas } from "../DrawingCanvas";
import { cx } from "../utils/joinClassNames";

type Props = {
  timelinePlayback: TimelinePlayback;
  onionSkinFilterOptions: ScreenFilterOptions;
};

const ZOOM_AMOUNT = 0.2;

enum Tools {
  Pan,
  Draw,
  Erase,
}

export function TimelineCanvas({
  timelinePlayback,
  onionSkinFilterOptions,
}: Props) {
  const [tool, setTool] = React.useState(Tools.Pan);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const playbackCanvasRef = React.useRef<HTMLCanvasElement>(null);
  const drawingCanvasRef = React.useRef<HTMLCanvasElement>(null);

  const movableCanvasRenderRef = React.useRef<MovableCanvasRender | null>(null);
  const drawingCanvasInstanceRef = React.useRef<DrawingCanvas | null>(null);

  React.useEffect(() => {
    switch (tool) {
      case Tools.Pan:
        movableCanvasRenderRef.current?.setActive(true);
        drawingCanvasInstanceRef.current?.setTool("none");
      case Tools.Draw:
        movableCanvasRenderRef.current?.setActive(false);
        drawingCanvasInstanceRef.current?.setTool("none");
      case Tools.Erase:
        movableCanvasRenderRef.current?.setActive(false);
        drawingCanvasInstanceRef.current?.setTool("none");
    }
  }, [tool]);

  React.useEffect(() => {
    const container = containerRef.current;
    const canvas = drawingCanvasRef.current;
    if (!canvas || !container) return;
    if (!canvas) return;
    const instance = new DrawingCanvas({ canvas, container });
    drawingCanvasInstanceRef.current = instance;

    return () => instance.destroy();
  }, []);

  React.useEffect(() => {
    const container = containerRef.current;
    const canvas = playbackCanvasRef.current;
    if (!canvas || !container) return;
    const instance = new MovableCanvasRender({
      canvas,
      container,
      timelinePlayback,
      onionSkinFilterOptions,
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
    <div ref={containerRef} className={cx($.container)}>
      <div className={$.tools}>
        <IconButton onClick={() => setZoom(ZOOM_AMOUNT)} label="Zoom in">
          <ZoomInIcon />
        </IconButton>
        <IconButton onClick={() => setZoom(ZOOM_AMOUNT * -1)} label="Zoom out">
          <ZoomOutIcon />
        </IconButton>
        <span className={$.toolsLine} />
      </div>
      <canvas ref={playbackCanvasRef} className={$.canvas} />
      <canvas ref={drawingCanvasRef} className={$.canvas} />
    </div>
  );
}
