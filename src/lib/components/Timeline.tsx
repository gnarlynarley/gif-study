import React from "react";
import { Timeline as TimelineType, TimelineFrame } from "../models";
import { cx } from "../utils/joinClassNames";
import { ImageDataCanvas } from "./ImageDataCanvas";
import $ from "./Timeline.module.scss";

type TimelineProps = {
  time: number;
  timeline: TimelineType;
  currentFrame: TimelineFrame | null;
  onPointerDown?: () => void;
  onTimeChange: (time: number) => void;
  multiplierWidth?: number | null;
};
type TimelineFramesProps = {
  extra?: boolean;
  frames: TimelineFrame[];
  currentFrame: TimelineFrame | null;
  multiplierWidth?: number | null;
  averageFrameDelay: number;
};

function TimelineFrames({
  extra,
  frames,
  currentFrame,
  multiplierWidth,
  averageFrameDelay,
}: TimelineFramesProps) {
  return (
    <>
      {frames.map((frame) => {
        const isActive = frame === currentFrame;
        const cellWidth =
          multiplierWidth != null
            ? frame.height *
              (multiplierWidth * 1.5) *
              (frame.delay / averageFrameDelay)
            : frame.width;
        return (
          <div
            key={frame.id}
            className={cx($.item, isActive && $.isActive, extra && $.isExtra)}
          >
            <ImageDataCanvas data={frame.data} width={cellWidth} />
            <span className={$.itemIndex}>{frame.index}</span>
            <span className={$.itemFrames}>{frame.delay}</span>
          </div>
        );
      })}
    </>
  );
}

export function Timeline({
  time,
  timeline,
  currentFrame,
  onTimeChange,
  onPointerDown,
  multiplierWidth = null,
}: TimelineProps) {
  const [active, setActive] = React.useState(false);
  const { frames, averageFrameDelay, totalTime } = timeline;
  const firstFrame = frames.at(0);
  const percentage =
    multiplierWidth !== null
      ? (time / totalTime) * 100
      : currentFrame
      ? (frames.indexOf(currentFrame) / frames.length) * 100
      : 0;
  const relativePercentage = 100 / 3 + percentage / 3;
  const frameContainerRef = React.useRef<HTMLDivElement>(null);
  const pointerDownHandler = (ev: React.MouseEvent) => {
    onPointerDown?.();
    const frameContainer = frameContainerRef.current;
    if (!frameContainer) return;
    setActive(true);
    const startingTime = time;
    const startingX = ev.clientX;
    const cellWidth = frameContainer.offsetWidth / 3 / totalTime;

    function pointermoveHandler(ev: MouseEvent) {
      ev.preventDefault();
      const x = startingX - ev.clientX;
      const timeOffset = Math.floor(x / cellWidth);
      const nextTime = (totalTime + timeOffset + startingTime) % totalTime;
      onTimeChange(nextTime);
    }
    function pointerupHandler(ev: MouseEvent) {
      ev.preventDefault();
      window.removeEventListener("pointermove", pointermoveHandler);
      window.removeEventListener("pointerup", pointerupHandler);
      setActive(false);
    }

    window.addEventListener("pointermove", pointermoveHandler);
    window.addEventListener("pointerup", pointerupHandler);
  };

  return (
    <div
      className={cx($.container, active && $.isActive)}
      onPointerDown={pointerDownHandler}
    >
      <div
        ref={frameContainerRef}
        className={$.frames}
        style={{
          translate: `${relativePercentage * -1}%`,
        }}
      >
        <TimelineFrames
          extra
          frames={frames}
          currentFrame={null}
          multiplierWidth={multiplierWidth}
          averageFrameDelay={averageFrameDelay}
        />
        <TimelineFrames
          frames={frames}
          currentFrame={currentFrame}
          multiplierWidth={multiplierWidth}
          averageFrameDelay={averageFrameDelay}
        />
        <TimelineFrames
          extra
          frames={frames}
          currentFrame={null}
          multiplierWidth={multiplierWidth}
          averageFrameDelay={averageFrameDelay}
        />
      </div>
    </div>
  );
}
