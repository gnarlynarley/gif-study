import React from "react";
import MovableCanvasRenderer from "../MovableCanvasRenderer";
import TimelinePlayback from "../TimelinePlayback";
import { IconButton } from "./IconButton";
import { ZoomInIcon, ZoomOutIcon } from "./Icons";
import useScreenFilterOptions from "../hooks/useScreenFilterOptions";
import Panel from "./Panel";
import ScreenFilter from "../ScreenFilter";
import $ from "./TimelineCanvas.module.scss";

type Props = {
  timelinePlayback: TimelinePlayback;
};

const ZOOM_AMOUNT = 0.2;

export function TimelineCanvas({ timelinePlayback }: Props) {
  const screenFilterOptions = useScreenFilterOptions();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const MovableCanvasRendererRef = React.useRef<MovableCanvasRenderer | null>(
    null,
  );

  const filterRef = React.useRef<ScreenFilter | null>(null);

  React.useEffect(() => {
    filterRef.current = new ScreenFilter(
      screenFilterOptions,
      timelinePlayback.timeline,
    );
  }, [screenFilterOptions, timelinePlayback]);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const frame =
      (timelinePlayback.currentFrame &&
        filterRef.current?.apply(timelinePlayback.currentFrame.data)) ||
      null;
    if (!canvas) return;
    const instance = new MovableCanvasRenderer({
      canvas,
      frame,
    });

    timelinePlayback.events.frameChanged.on((frame) => {
      if (frame && filterRef.current) {
        instance.setFrame(filterRef.current.apply(frame.data));
      }
    });

    MovableCanvasRendererRef.current = instance;

    return () => instance.destroy();
  }, [timelinePlayback]);

  const setZoom = (add: number) => {
    MovableCanvasRendererRef.current?.addZoom(add);
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
