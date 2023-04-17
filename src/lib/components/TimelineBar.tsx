import React, { useEffect } from "react";
import type { Timeline as TimelineType, TimelineFrame } from "../models";
import TimelinePlayback from "../TimelinePlayback";
import useEvent from "$lib/hooks/useEvent";
import setMoveEvent, { type MoveEvent } from "../utils/setMoveEvent";
import { ImageDataCanvas } from "./ImageDataCanvas";
import { cx } from "../utils/joinClassNames";
import clamp from "../utils/clamp";
import useKeyboard from "../hooks/useKeyboard";
import $ from "./TimelineBar.module.scss";

const FRAMES_PER_SECOND = 24;

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
  const [clampStart, setClampStart] = React.useState(
    timelinePlayback.clampedStartTime,
  );
  const [clampEnd, setClampEnd] = React.useState(
    timelinePlayback.clampedEndTime,
  );
  const [active, setActive] = React.useState(false);
  const [hoverTime, setHoverTime] = React.useState(0);
  const shownTime = active ? time : hoverTime;
  const hoverFrame = React.useMemo(
    () => timelinePlayback.findFrameByTime(shownTime),
    [shownTime, active],
  );
  const { totalTime, frames } = timelinePlayback.timeline;
  const [rect, setRect] = React.useState({ w: 0, l: 0 });
  const timeIndicatorRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const rect = entry.target.getBoundingClientRect();
      setRect({ w: rect.width, l: rect.left });
    });

    observer.observe(timeIndicatorRef.current as HTMLDivElement);

    return () => {
      observer.disconnect();
    };
  }, []);

  React.useEffect(() => {
    const destroys = [
      timelinePlayback.events.timeChanged.on(setTime),
      timelinePlayback.events.clampedStartTimeChanged.on(setClampStart),
      timelinePlayback.events.clampedEndTimeChanged.on(setClampEnd),
    ];
    setTime(timelinePlayback.currentTime);
    setClampStart(timelinePlayback.clampedStartTime);
    setClampEnd(timelinePlayback.clampedEndTime);

    return () => destroys.forEach((d) => d());
  }, [timelinePlayback]);

  const calculateCurrentTime = (x: number) => {
    const currentTime = ((x - rect.l) / rect.w) * totalTime;
    return currentTime;
  };
  const setCurrentTime = useEvent((event: MoveEvent) => {
    const currentTime = clamp(
      timelinePlayback.clampedStartTime,
      timelinePlayback.clampedEndTime,
      calculateCurrentTime(event.x),
    );
    timelinePlayback.pause();
    timelinePlayback.setCurrentTime(currentTime);
    setActive(event.active);
  });

  const startHandleRef = React.useRef<HTMLDivElement>(null);
  const endHandleRef = React.useRef<HTMLDivElement>(null);

  const onStartTimeChange = useEvent((event) => {
    const currentTime = clamp(0, totalTime, calculateCurrentTime(event.x));
    timelinePlayback.setStartClamp(currentTime);
    setActive(event.active);
  });

  const onEndTimeChange = useEvent((event) => {
    const currentTime = clamp(0, totalTime, calculateCurrentTime(event.x));
    timelinePlayback.setEndclamp(currentTime);
    setActive(event.active);
  });

  React.useEffect(() => {
    const cleanups = [
      setMoveEvent(timeIndicatorRef.current as HTMLDivElement, setCurrentTime),
      setMoveEvent(startHandleRef.current as HTMLDivElement, onStartTimeChange),
      setMoveEvent(endHandleRef.current as HTMLDivElement, onEndTimeChange),
    ];

    return () => cleanups.forEach((c) => c());
  }, []);
  100;
  const scale = time / totalTime;

  return (
    <>
      <div
        className={cx($.timeWrapper, active && $.isActive)}
        onPointerMove={(ev) => {
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
        <div className={$.timeIndicator} ref={timeIndicatorRef}>
          <div
            className={$.timeIndicatorFill}
            style={{
              scale: `${scale} 1`,
            }}
          ></div>

          <div className={$.frames}>
            {frames.map((frame) => {
              return (
                <span
                  key={frame.id}
                  className={$.frame}
                  style={{ width: `${(frame.duration / totalTime) * 100}%` }}
                >
                  <span className={$.frameText}>
                    {Math.floor(frame.duration / FRAMES_PER_SECOND)}
                  </span>
                </span>
              );
            })}
          </div>
        </div>

        <div
          ref={startHandleRef}
          className={cx($.timeClamp, $.isStart)}
          style={{
            ["--progress" as any]: `${clampStart / totalTime}`,
          }}
        />
        <div
          ref={endHandleRef}
          className={cx($.timeClamp, $.isEnd)}
          style={{
            ["--progress" as any]: `${clampEnd / totalTime}`,
          }}
        />
      </div>
    </>
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
