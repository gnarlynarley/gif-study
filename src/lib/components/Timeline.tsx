import { GifFrame } from "../buzzfeed-gif";
import { TimelineFrame } from "../models";
import { cx } from "../utils/joinClassNames";
import { ImageDataCanvas } from "./ImageDataCanvas";
import $ from "./Timeline.module.scss";

type TimelineProps = {
  frames: TimelineFrame[];
  currentFrame: TimelineFrame | null;
  onPointerDown?: () => void;
  onFrameChange: (frame: TimelineFrame) => void;
};

const WIDTH_MULTIPLIER = 0.05;

export function Timeline({
  frames,
  currentFrame,
  onFrameChange,
  onPointerDown,
}: TimelineProps) {
  return (
    <div className={$.container} onPointerDown={onPointerDown}>
      {frames.map((frame) => {
        const isActive = frame === currentFrame;
        const frameWidth = frame.data.width * WIDTH_MULTIPLIER;
        const cellWidth = frameWidth * frame.hold;
        return (
          <button
            key={frame.id}
            onClick={() => onFrameChange(frame)}
            className={cx($.item, isActive && $.isActive)}
          >
            <ImageDataCanvas data={frame.data} width={cellWidth} />
            <span className={$.itemFrames}>{frame.hold}</span>
          </button>
        );
      })}
    </div>
  );
}
