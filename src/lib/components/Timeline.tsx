import { Timeline as TimelineType, TimelineFrame } from "../models";
import { cx } from "../utils/joinClassNames";
import { ImageDataCanvas } from "./ImageDataCanvas";
import $ from "./Timeline.module.scss";

type TimelineProps = {
  time: number;
  timeline: TimelineType;
  currentFrame: TimelineFrame | null;
  onPointerDown?: () => void;
  onFrameChange: (frame: TimelineFrame) => void;
  multiplierWidth?: number | null;
};
type TimelineFramesProps = {
  extra?: boolean;
  frames: TimelineFrame[];
  currentFrame: TimelineFrame | null;
  onFrameChange: (frame: TimelineFrame) => void;
  multiplierWidth?: number | null;
  averageFrameDelay: number;
};

function TimelineFrames({
  extra,
  frames,
  currentFrame,
  multiplierWidth,
  onFrameChange,
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
          <button
            key={frame.id}
            onClick={() => onFrameChange(frame)}
            className={cx($.item, isActive && $.isActive, extra && $.isExtra)}
          >
            <ImageDataCanvas data={frame.data} width={cellWidth} />
            <span className={$.itemIndex}>{frame.index}</span>
            <span className={$.itemFrames}>{frame.delay}</span>
          </button>
        );
      })}
    </>
  );
}

export function Timeline({
  time,
  timeline,
  currentFrame,
  onFrameChange,
  onPointerDown,
  multiplierWidth = null,
}: TimelineProps) {
  const { frames, averageFrameDelay, totalTime } = timeline;
  const percentage =
    multiplierWidth !== null
      ? (time / totalTime) * 100
      : currentFrame
      ? (frames.indexOf(currentFrame) / frames.length) * 100
      : 0;
  const relativePercentage = 100 / 3 + percentage / 3;

  return (
    <div className={$.container} onPointerDown={onPointerDown}>
      <div
        className={$.frames}
        style={{
          translate: `${relativePercentage * -1}%`,
        }}
      >
        <TimelineFrames
          extra
          frames={frames}
          currentFrame={null}
          onFrameChange={onFrameChange}
          multiplierWidth={multiplierWidth}
          averageFrameDelay={averageFrameDelay}
        />
        <TimelineFrames
          frames={frames}
          currentFrame={currentFrame}
          onFrameChange={onFrameChange}
          multiplierWidth={multiplierWidth}
          averageFrameDelay={averageFrameDelay}
        />
        <TimelineFrames
          extra
          frames={frames}
          currentFrame={null}
          onFrameChange={onFrameChange}
          multiplierWidth={multiplierWidth}
          averageFrameDelay={averageFrameDelay}
        />
      </div>
    </div>
  );
}
