import type { Timeline, TimelineFrame, GifData } from "../models";

export default function createTimelineFromGifData(gifData: GifData): Timeline {
  let time = 0;
  const frames = gifData.frames.map((frame): TimelineFrame => {
    time += frame.delay;
    return {
      number: frame.frameIndex,
      id: frame.id,
      data: frame.data,
      duration: frame.delay,
      time: time - frame.delay,
      width: frame.data.width,
      height: frame.data.height,
    };
  });
  const timelineFrames = frames.flatMap((frame) =>
    Array.from({ length: frame.duration }, () => frame)
  );
  const totalTime = timelineFrames.length;
  const averageFrameDelay = totalTime / frames.length;

  return {
    id: gifData.id,
    gifFile: gifData.file,
    frames,
    timelineFrames,
    totalTime,
    averageFrameDelay,
    width: gifData.width,
    height: gifData.height,
  };
}
