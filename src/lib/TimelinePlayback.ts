import { EventEmitter } from "./utils/EventEmitter";
import { Timeline, TimelineFrame } from "./models";
import GameLoop from "./utils/game/GameLoop";
import clamp from "./utils/clamp";

export class TimelinePlayback {
  playing: boolean = false;
  loop: GameLoop;
  timeline: Timeline;
  #reversedFrames: TimelineFrame[];
  currentTime = 0;
  totalTime: number;
  currentFrame: TimelineFrame | null;
  events = {
    timeChanged: new EventEmitter<number>(),
    frameChanged: new EventEmitter<TimelineFrame | null>(),
    playingChanged: new EventEmitter<boolean>(),
    trimStartChanged: new EventEmitter<number>(),
    trimEndChanged: new EventEmitter<number>(),
    timelineChanged: new EventEmitter<Timeline>(),
  };

  constructor(timeline: Timeline) {
    if (timeline.frames.length === 0)
      throw new Error("Timeline did not have any frames.");
    this.timeline = timeline;
    this.#reversedFrames = [...this.timeline.frames].reverse();
    this.loop = new GameLoop({
      fps: 60,
      update: this.#setCurrentTimeByDelta,
    });
    this.#updateFrame();
    this.totalTime = timeline.totalTime;
    this.currentFrame = timeline.frames[0] ?? null;
  }

  setTrimStart(value: number) {
    this.timeline.trimStart = clamp(0, this.timeline.trimEnd, value);
    this.timeline.trimStart = this.timeline.trimStart;
    this.setCurrentTime(this.timeline.trimStart);
    this.events.trimStartChanged.emit(this.timeline.trimStart);
    this.events.timelineChanged.emit(this.timeline);
  }

  setTrimEnd(value: number) {
    this.timeline.trimEnd = clamp(
      this.timeline.trimStart,
      this.totalTime,
      value,
    );
    this.timeline.trimEnd = this.timeline.trimEnd;
    this.setCurrentTime(this.timeline.trimEnd);
    this.events.trimEndChanged.emit(this.timeline.trimEnd);
    this.events.timelineChanged.emit(this.timeline);
  }

  #setCurrentTimeByDelta = (delta: number) => {
    const {
      timeline: { trimStart, trimEnd },
      currentTime,
    } = this;
    const trimmedTotalTime = trimEnd - trimStart;
    this.setCurrentTime(
      trimStart +
        ((currentTime - trimStart + delta * this.speed) % trimmedTotalTime),
    );
  };

  setCurrentTime = (currentTime: number) => {
    this.currentTime = clamp(
      this.timeline.trimStart,
      this.timeline.trimEnd,
      currentTime,
    );
    this.events.timeChanged.emit(this.currentTime);
    this.#updateFrame();
  };

  #updateFrame = () => {
    const found = this.findFrameByTime(this.currentTime);
    this.#setFrame(found?.frame ?? null);
  };

  #setFrame = (frame: TimelineFrame | null) => {
    if (this.currentFrame?.index !== frame?.index) {
      this.events.frameChanged.emit(frame);
    }
    this.currentFrame = frame;
  };

  destroy = () => {
    this.loop.stop();
    Object.values(this.events).forEach((emitter) => {
      emitter.destroy();
    });
  };

  findFrameByTime = (
    time: number,
  ): { frame: TimelineFrame; index: number } | null => {
    const reversedFrames = this.#reversedFrames;
    for (const [index, frame] of reversedFrames.entries()) {
      if (time >= frame.time) {
        return { frame, index };
      }
    }
    return null;
  };

  play = () => {
    this.loop.play();
    this.playing = true;
    this.events.playingChanged.emit(this.playing);
  };

  pause = () => {
    this.loop.stop();
    this.playing = false;
    this.events.playingChanged.emit(this.playing);
  };

  toggle = () => {
    if (this.playing) {
      this.pause();
    } else {
      this.play();
    }
  };

  speed = 1;

  setSpeed = (speed: number) => {
    this.speed = speed;
  };

  navigateFrame = (offset: number) => {
    this.pause();
    const currentIndex = this.currentFrame?.index ?? null;
    if (currentIndex !== null) {
      const { frames } = this.timeline;
      const max = frames.length - 1;
      let nextFrameIndex = currentIndex + offset;
      if (nextFrameIndex > max) {
        nextFrameIndex = 0;
      } else if (nextFrameIndex <= -1) {
        nextFrameIndex = max;
      }
      let nextFrame = frames[nextFrameIndex];
      if (!this.isWithinTrimStart(nextFrame)) {
        nextFrame = frames[0];
      } else if (
        nextFrame.index !== frames.length - 1 &&
        !this.isWithinTrimEnd(nextFrame)
      ) {
        nextFrame = frames[frames.length - 1];
      }

      this.setCurrentTime(nextFrame.time);
    }
  };

  previousFrame = () => {
    this.navigateFrame(-1);
  };

  nextFrame = () => {
    this.navigateFrame(1);
  };

  isWithinTrimStart = (frame: TimelineFrame): boolean => {
    return frame.time >= this.timeline.trimStart;
  };

  isWithinTrimEnd = (frame: TimelineFrame): boolean => {
    return frame.time + frame.duration < this.timeline.trimEnd;
  };
}

export default TimelinePlayback;
