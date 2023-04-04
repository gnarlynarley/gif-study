import React from "react";
import type { Timeline as TimelineType, TimelineFrame } from "../models";
import type TimelinePlayback from "../TimelinePlayback";
import $ from "./TimelineBar.module.scss";
import setMoveEvent from "../utils/setMoveEvent";

type TimelineProps = {
  timeline: TimelineType;
  timelinePlayback: TimelinePlayback;
};

function Progress({
  timelinePlayback,
}: {
  timelinePlayback: TimelinePlayback;
}) {
  const [time, setTime] = React.useState(0);
  const { totalTime } = timelinePlayback.timeline;
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

  React.useEffect(() => {
    const cleanup = setMoveEvent(
      containerRef.current as HTMLDivElement,
      ({ x }) => {
        const currentTime = ((x - rect.l) / rect.w) * totalTime;
        timelinePlayback.pause();
        timelinePlayback.setCurrentTime(currentTime);
      }
    );

    return () => cleanup();
  }, []);

  return (
    <div
      ref={containerRef}
      className={$.timeWrapper}
      onClick={(ev) => {
        const currentTime = ((ev.clientX - rect.l) / rect.w) * totalTime;
        timelinePlayback.pause();
        timelinePlayback.setCurrentTime(currentTime);
      }}
    >
      <div
        className={$.timeIndicator}
        style={{ translate: `${progress * 100 - 100}%` }}
      ></div>
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
