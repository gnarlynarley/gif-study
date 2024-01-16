import React from "react";
import type { TimelineFrame } from "../models";
import TimelinePlayback from "../TimelinePlayback";
import useEvent from "$lib/hooks/useEvent";
import setMoveEvent, { type MoveEvent } from "../utils/setMoveEvent";
import { ImageDataCanvas } from "./ImageDataCanvas";
import { cx } from "../utils/joinClassNames";
import clamp from "../utils/clamp";
import Panel from "./Panel";
import formatDuration from "../utils/formatDuration";
import $ from "./TimelineBar.module.scss";

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
              {formatDuration(frame.duration)}
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
  const [trimStart, setTrimStart] = React.useState(
    timelinePlayback.timeline.trimStart,
  );
  const [trimEnd, setTrimEnd] = React.useState(
    timelinePlayback.timeline.trimEnd,
  );
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
    const cleanupMethods = [
      timelinePlayback.events.timeChanged.on(setTime),
      timelinePlayback.events.trimStartChanged.on(setTrimStart),
      timelinePlayback.events.trimEndChanged.on(setTrimEnd),
    ];
    setTrimStart(timelinePlayback.timeline.trimStart);
    setTrimEnd(timelinePlayback.timeline.trimEnd);

    return () => cleanupMethods.forEach((m) => m());
  }, [timelinePlayback]);

  const trimStartHandleRef = React.useRef<HTMLDivElement>(null);
  const trimEndHandleRef = React.useRef<HTMLDivElement>(null);

  const startingTimeRef = React.useRef(0);
  const setTrimTime = useEvent((isStart: boolean, event: MoveEvent) => {
    setActive(event.active);
    timelinePlayback.pause();

    if (event.start) {
      startingTimeRef.current = isStart ? trimStart : trimEnd;
    } else {
      const nextTime =
        startingTimeRef.current +
        calculateCurrentTime(event.relativeX + rect.l);
      if (isStart) {
        timelinePlayback.setTrimStart(nextTime);
      } else {
        timelinePlayback.setTrimEnd(nextTime);
      }
    }
  });

  const calculateCurrentTime = useEvent((x: number) => {
    return ((x - rect.l) / rect.w) * totalTime;
  });
  const setCurrentTime = useEvent((event: MoveEvent) => {
    if (trimStartHandleRef.current?.contains(event.currentTarget)) {
      setTrimTime(true, event);
      return;
    }
    if (trimEndHandleRef.current?.contains(event.currentTarget)) {
      setTrimTime(false, event);
      return;
    }
    const currentTime = clamp(0, totalTime, calculateCurrentTime(event.x));
    timelinePlayback.pause();
    timelinePlayback.setCurrentTime(currentTime);
    setActive(event.active);
  });

  React.useEffect(() => {
    const cleanupMethods = [
      setMoveEvent(containerRef.current as HTMLDivElement, setCurrentTime),
    ];

    return () => cleanupMethods.forEach((m) => m());
  }, []);

  return (
    <div
      className={cx($.progress, active && $.isActive)}
      onMouseMove={(ev) => {
        const x = ev.clientX;
        setHoverTime(clamp(0, totalTime, calculateCurrentTime(x)));
      }}
    >
      {hoverFrame && (
        <div className={$.thumbnailWrapper}>
          <div
            className={$.thumbnail}
            style={{ left: `${(shownTime / totalTime) * 100}%` }}
          >
            <ImageDataCanvas
              className={$.thumbnailImage}
              data={hoverFrame.frame.data}
            />
          </div>
        </div>
      )}
      <div className={$.timeIndicatorWrapper}>
        <div ref={containerRef} className={$.timeIndicator}>
          <div
            ref={trimStartHandleRef}
            className={$.trimHandle}
            style={{
              left: `${(trimStart / totalTime) * 100}%`,
            }}
          >
            <span />
          </div>
          <div
            ref={trimEndHandleRef}
            className={cx($.trimHandle, $.isEnd)}
            style={{ left: `${(trimEnd / totalTime) * 100}%` }}
          >
            <span />
          </div>
          <div
            className={$.timeIndicatorFill}
            style={{ translate: `${progress * 100 - 100}%` }}
          />
          <Frames frames={frames} totalTime={totalTime} />
        </div>
      </div>
    </div>
  );
}

export function TimelineBar({ timelinePlayback }: TimelineProps) {
  const frames = timelinePlayback.timeline.frames;

  return (
    <div className={$.container}>
      <Panel>
        {frames.map((frame) => (
          <div key={frame.id} className={$.frame}></div>
        ))}
        <div className={$.progressWrapper}>
          <Progress timelinePlayback={timelinePlayback} />
        </div>
      </Panel>
    </div>
  );
}
