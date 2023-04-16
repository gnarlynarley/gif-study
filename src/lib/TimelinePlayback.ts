import { EventEmitter } from "./utils/EventEmitter";
import { Timeline, TimelineFrame } from "./models";
import GameLoop from "./utils/game/GameLoop";

export class TimelinePlayback {
  playing: boolean = false;
  loop: GameLoop;
  timeline: Timeline;
  #reversedFrames: TimelineFrame[];
  currentTime: number;
  clampedStartTime: number;
  clampedEndTime: number;
  currentFrame: TimelineFrame | null = null;
  events = {
    timeChanged: new EventEmitter<number>(),
    frameChanged: new EventEmitter<TimelineFrame | null>(),
    playingChanged: new EventEmitter<boolean>(),
  };

  constructor(timeline: Timeline) {
    this.timeline = timeline;
    this.clampedEndTime = timeline.totalTime;
    this.clampedStartTime = 0;
    this.currentTime = this.calculateCurrentTime(0);
    this.#reversedFrames = [...this.timeline.frames].reverse();
    this.loop = new GameLoop({
      fps: 60,
      update: this.#setCurrentTimeByDelta,
    });
    this.#updateFrame();
  }

  #setCurrentTimeByDelta = (delta: number) => {
    this.setCurrentTime(this.currentTime + delta * this.speed);
  };

  setClamp(start: number, end: number) {
    this.clampedStartTime = Math.min(start, end);
    this.clampedEndTime = Math.max(end, start);
    this.setCurrentTime(this.currentTime);
  }

  calculateCurrentTime = (value: number) => {
    const max = this.clampedEndTime;
    const min = this.clampedStartTime;
    const d = max - min;
    const result =
      value === max ? value : ((((value - min) % d) + d) % d) + min;
    return result;
  };

  setCurrentTime = (currentTime: number) => {
    this.currentTime = this.calculateCurrentTime(currentTime);
    this.events.timeChanged.emit(this.currentTime);
    this.#updateFrame();
  };

  #updateFrame = () => {
    const found = this.findFrameByTime(this.currentTime);
    this.#setFrame(found?.frame ?? null);
  };

  #setFrame = (frame: TimelineFrame | null) => {
    this.currentFrame = frame;
    this.events.frameChanged.emit(this.currentFrame);
  };

  destroy = () => {
    this.loop.stop();
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
      if (nextFrameIndex >= max) {
        nextFrameIndex = 0;
      } else if (nextFrameIndex <= -1) {
        nextFrameIndex = max;
      }
      const nextFrame = frames[nextFrameIndex];

      this.setCurrentTime(nextFrame.time);
    }
  };

  previousFrame = () => {
    this.navigateFrame(-1);
  };

  nextFrame = () => {
    this.navigateFrame(1);
  };
}

export default TimelinePlayback;
