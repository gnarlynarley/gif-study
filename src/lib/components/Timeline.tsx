import React from "react";
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
  multiplierWidth?: number | null;
};

export function Timeline({
  frames,
  currentFrame,
  onFrameChange,
  onPointerDown,
  multiplierWidth = null,
}: TimelineProps) {
  return (
    <div className={$.container} onPointerDown={onPointerDown}>
      {frames.map((frame) => {
        const isActive = frame === currentFrame;
        const cellWidth =
          multiplierWidth != null
            ? frame.width * (multiplierWidth / 10) * frame.hold
            : frame.width;
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
