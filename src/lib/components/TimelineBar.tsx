import React from "react";
import type { Timeline as TimelineType } from "../models";
import type TimelinePlayback from "../TimelinePlayback";
import useEvent from "$lib/hooks/useEvent";
import setMoveEvent, { type MoveEvent } from "../utils/setMoveEvent";
import $ from "./TimelineBar.module.scss";
import { calcModulo } from "../utils/calcModulo";
import { cx } from "../utils/joinClassNames";

console.log($);

type TimelineProps = {
  timeline: TimelineType;
  timelinePlayback: TimelinePlayback;
};

function Progress({
  timelinePlayback,
}: {
  timelinePlayback: TimelinePlayback;
}) {
  const [active, setActive] = React.useState(false);
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

  const setCurrentTime = useEvent((event: MoveEvent) => {
    const currentTime = calcModulo(
      ((event.x - rect.l) / rect.w) * totalTime,
      totalTime,
    );
    timelinePlayback.pause();
    timelinePlayback.setCurrentTime(currentTime);
    setActive(event.active);
  });

  console.log(active);

  React.useEffect(() => {
    const cleanup = setMoveEvent(
      containerRef.current as HTMLDivElement,
      setCurrentTime,
    );

    return () => cleanup();
  }, []);

  return (
    <div ref={containerRef} className={cx($.timeWrapper, active && $.isActive)}>
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
