import React from "react";
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

enum Mode {
  Navigation,
  Clipping,
}

function Progress({
  timelinePlayback,
}: {
  timelinePlayback: TimelinePlayback;
}) {
  const [mode, setMode] = React.useState(Mode.Navigation);
  const [time, setTime] = React.useState(0);
  const [active, setActive] = React.useState(false);
  const [hoverTime, setHoverTime] = React.useState(0);
  const shownTime = active ? time : hoverTime;
  const hoverFrame = React.useMemo(
    () => timelinePlayback.findFrameByTime(shownTime),
    [shownTime, active],
  );
  const { totalTime, frames } = timelinePlayback.timeline;
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

  const calculateCurrentTime = (x: number) => {
    const currentTime = ((x - rect.l) / rect.w) * totalTime;
    return currentTime;
  };
  const setCurrentTime = useEvent((event: MoveEvent) => {
    if (mode !== Mode.Navigation) return;
    const currentTime = clamp(
      timelinePlayback.clampedStartTime,
      timelinePlayback.clampedEndTime,
      calculateCurrentTime(event.x),
    );
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

  const [clampBeginFrame, setClampBeginFrame] =
    React.useState<TimelineFrame | null>(null);

  const onFrameClick = (frame: TimelineFrame) => {
    if (mode !== Mode.Clipping) return;
    if (clampBeginFrame === null) {
      setClampBeginFrame(frame);
    } else {
      timelinePlayback.setClamp(
        clampBeginFrame.time,
        frame.time + frame.duration,
      );
      setMode(Mode.Navigation);
    }
  };

  React.useEffect(() => {
    if (mode === Mode.Clipping) {
      setClampBeginFrame(null);
    }
  }, [mode]);

  useKeyboard("c", () => {
    switch (mode) {
      case Mode.Navigation:
        setMode(Mode.Clipping);
        break;
      default:
        setMode(Mode.Navigation);
    }
  });

  const width =
    ((timelinePlayback.clampedEndTime - timelinePlayback.clampedStartTime) /
      totalTime) *
    100;
  const scale =
    (time - timelinePlayback.clampedStartTime) /
    (timelinePlayback.clampedEndTime - timelinePlayback.clampedStartTime);

  return (
    <>
      <h1>{mode}</h1>
      <div
        ref={containerRef}
        className={cx($.timeWrapper, active && $.isActive)}
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
        <div className={$.timeIndicatorWrapper}>
          <div
            className={$.timeIndicator}
            style={{
              left: `${(timelinePlayback.clampedStartTime / totalTime) * 100}%`,
              width: `${width}%`,
              scale: `${scale} 1`,
            }}
          ></div>
        </div>
        <div className={$.frames}>
          {frames.map((frame) => {
            const isClamped =
              frame.time < timelinePlayback.clampedStartTime ||
              frame.time + frame.duration > timelinePlayback.clampedEndTime;
            return (
              <button
                key={frame.id}
                className={cx($.frame, isClamped && $.isClamped)}
                style={{ width: `${(frame.duration / totalTime) * 100}%` }}
                onClick={() => onFrameClick(frame)}
              >
                <span className={$.frameText}>
                  {Math.floor(frame.duration / FRAMES_PER_SECOND)}
                </span>
              </button>
            );
          })}
        </div>
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
