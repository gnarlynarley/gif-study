import type { Timeline, TimelineFrame, GifData } from "../models";

export default function createTimelineFromGifData(gifData: GifData): Timeline {
  let time = 0;
  const frames = gifData.frames.map((frame, index): TimelineFrame => {
    time += frame.delay;
    return {
      id: frame.id,
      data: frame.data,
      duration: frame.delay,
      time: time - frame.delay,
      width: frame.data.width,
      height: frame.data.height,
      index,
    };
  });
  const lastFrame = frames[frames.length - 1];
  const totalTime = lastFrame.time + lastFrame.duration;

  return {
    version: "1",
    id: gifData.id,
    gifBlob: gifData.blob,
    frames,
    totalTime,
    width: gifData.width,
    height: gifData.height,
    trimStart: 0,
    trimEnd: totalTime,
  };
}
