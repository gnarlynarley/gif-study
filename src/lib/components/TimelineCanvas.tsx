import React from "react";
import MovableCanvasRender from "../MovableCanvasRender";
import TimelinePlayback from "../TimelinePlayback";
import { IconButton } from "./IconButton";
import { ZoomInIcon, ZoomOutIcon } from "./Icons";
import $ from "./TimelineCanvas.module.scss";
import useScreenFilterOptions from "../hooks/useScreenFilterOptions";
import Panel from "./Panel";

type Props = {
  timelinePlayback: TimelinePlayback;
};

const ZOOM_AMOUNT = 0.2;

export function TimelineCanvas({ timelinePlayback }: Props) {
  const screenFilterOptions = useScreenFilterOptions();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const movableCanvasRenderRef = React.useRef<MovableCanvasRender | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const instance = new MovableCanvasRender({
      timelinePlayback,
      screenFilterOptions,
      canvas,
    });

    movableCanvasRenderRef.current = instance;

    return () => instance.destroy();
  }, [timelinePlayback]);

  React.useEffect(() => {
    movableCanvasRenderRef.current?.setOnionSkinOptions(screenFilterOptions);
  }, [screenFilterOptions]);

  const setZoom = (add: number) => {
    movableCanvasRenderRef.current?.addZoom(add);
  };

  return (
    <div className={$.container}>
      <div className={$.tools}>
        <Panel>
          <div className={$.toolsInner}>
            <IconButton onClick={() => setZoom(ZOOM_AMOUNT)} label="Zoom in">
              <ZoomInIcon />
            </IconButton>
            <IconButton
              onClick={() => setZoom(ZOOM_AMOUNT * -1)}
              label="Zoom out"
            >
              <ZoomOutIcon />
            </IconButton>
          </div>
        </Panel>
      </div>
      <canvas ref={canvasRef} className={$.canvas} />
    </div>
  );
}
