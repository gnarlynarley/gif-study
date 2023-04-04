import React from "react";
import type { Timeline as TimelineType, TimelineFrame } from "../models";
import { calcModulo } from "../utils/calcModulo";
import { cx } from "../utils/joinClassNames";
import { ImageDataCanvas } from "./ImageDataCanvas";
import $ from "./TimelineBar.module.scss";
import type TimelinePlayback from "../TimelinePlayback";

type TimelineProps = {
  timeline: TimelineType;
  timelinePlayback: TimelinePlayback;
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

export function TimelineBar({ timeline, timelinePlayback }: TimelineProps) {
  const [playing, setPlaying] = React.useState(false);
  const [time, setTime] = React.useState(0);
  const [currentFrame, setCurrentFrame] = React.useState<TimelineFrame | null>(
    null
  );
  React.useEffect(() => {
    if (timelinePlayback) {
      const cleanups = [
        timelinePlayback.events.playingChanged.on(setPlaying),
        timelinePlayback.events.timeChanged.on(setTime),
        timelinePlayback.events.frameChanged.on(setCurrentFrame),
      ];

      return () => {
        cleanups.forEach((cleanup) => cleanup());
      };
    }
    setPlaying(false);
  }, [timelinePlayback]);

  const [active, setActive] = React.useState(false);
  const { frames, averageFrameDelay, totalTime } = timeline;
  const multiplierWidth = 100;
  const percentage =
    multiplierWidth !== null
      ? (time / totalTime) * 100
      : currentFrame
      ? (frames.indexOf(currentFrame) / frames.length) * 100
      : 0;
  const relativePercentage = 100 / 3 + percentage / 3;
  const frameContainerRef = React.useRef<HTMLDivElement>(null);
  const pointerDownHandler = (ev: React.MouseEvent) => {
    timelinePlayback.pause();
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
      const nextTime = calcModulo(startingTime + timeOffset, totalTime);
      timelinePlayback.setCurrentTime(nextTime);
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
