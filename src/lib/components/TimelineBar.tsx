import React from "react";
import { Timeline as TimelineType, TimelineFrame } from "../models";
import { cx } from "../utils/joinClassNames";
import { ImageDataCanvas } from "./ImageDataCanvas";
import $ from "./TimelineBar.module.scss";

type TimelineProps = {
  time: number;
  timeline: TimelineType;
  currentFrame: TimelineFrame | null;
  onPointerDown?: () => void;
  onTimeChange: (time: number) => void;
  multiplierWidth?: number | null;
};
type TimelineFramesProps = {
  head?: boolean;
  tail?: boolean;
  frames: TimelineFrame[];
  currentFrame: TimelineFrame | null;
  multiplierWidth?: number | null;
  averageFrameDelay: number;
};

function TimelineFrames({
  head,
  tail,
  frames,
  currentFrame,
  multiplierWidth,
  averageFrameDelay,
}: TimelineFramesProps) {
  return (
    <div className={cx($.itemWrapper, head && $.isHead, tail && $.isTail)}>
      {frames.map((frame) => {
        const isActive = frame === currentFrame;
        const cellWidth =
          multiplierWidth != null
            ? frame.height *
              (multiplierWidth * 1.5) *
              (frame.duration / averageFrameDelay)
            : frame.width;
        return (
          <div key={frame.id} className={cx($.item, isActive && $.isActive)}>
            <ImageDataCanvas data={frame.data} width={cellWidth} />
            <span className={$.itemIndex}>{frame.number}</span>
            <span className={$.itemFrames}>{frame.duration}</span>
          </div>
        );
      })}
    </div>
  );
}

function mod(value: number, add: number): number {
  return ((value % add) + add) % add;
}

export function TimelineBar({
  time,
  timeline,
  currentFrame,
  onTimeChange,
  onPointerDown,
  multiplierWidth = null,
}: TimelineProps) {
  const [active, setActive] = React.useState(false);
  const { frames, averageFrameDelay, totalTime } = timeline;
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
      const nextTime = mod(startingTime + timeOffset, totalTime);
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
          head
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
          tail
          frames={frames}
          currentFrame={null}
          multiplierWidth={multiplierWidth}
          averageFrameDelay={averageFrameDelay}
        />
      </div>
    </div>
  );
}
