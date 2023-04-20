import React from "react";
import type { Timeline as TimelineType, TimelineFrame } from "../models";
import TimelinePlayback from "../TimelinePlayback";
import useEvent from "$lib/hooks/useEvent";
import setMoveEvent, { type MoveEvent } from "../utils/setMoveEvent";
import { ImageDataCanvas } from "./ImageDataCanvas";
import { cx } from "../utils/joinClassNames";
import clamp from "../utils/clamp";
import $ from "./TimelineBar.module.scss";

const FRAMES_PER_SECOND = 24;

type TimelineProps = {
  timelinePlayback: TimelinePlayback;
};

const Frames: React.FC<{
  frames: TimelineFrame[];
  totalTime: number;
}> = React.memo(({ frames, totalTime }) => {
  return (
    <div className={$.frames}>
      {frames.map((frame) => {
        return (
          <div
            key={frame.id}
            className={$.frame}
            style={{ width: `${(frame.duration / totalTime) * 100}%` }}
          >
            <span className={$.frameText}>
              {Math.floor(frame.duration / FRAMES_PER_SECOND)}
            </span>
          </div>
        );
      })}
    </div>
  );
});

function Progress({
  timelinePlayback,
}: {
  timelinePlayback: TimelinePlayback;
}) {
  const [time, setTime] = React.useState(0);
  const [active, setActive] = React.useState(false);
  const [hoverTime, setHoverTime] = React.useState(0);
  const shownTime = active ? time : hoverTime;
  const hoverFrame = React.useMemo(
    () => timelinePlayback.findFrameByTime(shownTime),
    [shownTime, active],
  );
  const { totalTime, frames } = timelinePlayback.timeline;
  const progress = time / totalTime;
  const [rect, setRect] = React.useState({ w: 0, l: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const rect = entry.target.getBoundingClientRect();
      setRect({ w: rect.width, l: rect.left });
    });

    observer.observe(containerRef.current as HTMLDivElement);

    return () => {
      observer.disconnect();
    };
  }, []);

  React.useEffect(() => {
    const destroy = timelinePlayback.events.timeChanged.on(setTime);

    return () => destroy();
  }, [timelinePlayback]);

  const calculateCurrentTime = (x: number) =>
    ((x - rect.l) / rect.w) * totalTime;
  const setCurrentTime = useEvent((event: MoveEvent) => {
    const currentTime = clamp(0, totalTime, calculateCurrentTime(event.x));
    timelinePlayback.pause();
    timelinePlayback.setCurrentTime(currentTime);
    setActive(event.active);
  });

  React.useEffect(() => {
    const cleanup = setMoveEvent(
      containerRef.current as HTMLDivElement,
      setCurrentTime,
    );

    return () => cleanup();
  }, []);

  return (
    <div
      ref={containerRef}
      className={cx($.progress, active && $.isActive)}
      onMouseMove={(ev) => {
        const x = ev.clientX - rect.l;
        setHoverTime(calculateCurrentTime(x));
      }}
    >
      {hoverFrame && (
        <div
          className={$.thumbnail}
          style={{ left: `${(shownTime / totalTime) * 100}%` }}
        >
          <ImageDataCanvas
            className={$.thumbnailImage}
            data={hoverFrame.frame.data}
          />
        </div>
      )}
      <div className={$.timeIndicator}>
        <div
          className={$.timeIndicatorFill}
          style={{ translate: `${progress * 100 - 100}%` }}
        ></div>
      </div>
      <Frames frames={frames} totalTime={totalTime} />
    </div>
  );
}

export function TimelineBar({ timelinePlayback }: TimelineProps) {
  const frames = timelinePlayback.timeline.frames;

  return (
    <div className={$.container}>
      {frames.map((frame) => (
        <div key={frame.id} className={$.frame}></div>
      ))}
      <div className={$.progressWrapper}>
        <Progress timelinePlayback={timelinePlayback} />
      </div>
    </div>
  );
}
