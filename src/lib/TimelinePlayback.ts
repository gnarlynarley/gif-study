import { EventEmitter } from "./utils/EventEmitter";
import { Timeline, TimelineFrame } from "./models";
import GameLoop from "./utils/game/GameLoop";
import { calcModulo } from "./utils/calcModulo";

function findFrameByTime(
  reversedFrames: TimelineFrame[],
  time: number
): { frame: TimelineFrame; index: number } | null {
  for (const [index, frame] of reversedFrames.entries()) {
    if (time >= frame.time) {
      return { frame, index };
    }
  }
  return null;
}

export class TimelinePlayback {
  playing: boolean = false;
  loop: GameLoop;
  timeline: Timeline;
  #reversedFrames: TimelineFrame[];
  currentTime = 0;
  currentFrame: TimelineFrame | null = null;
  currentFrameIndex: number | null = null;
  events = {
    timeChanged: new EventEmitter<number>(),
    frameChanged: new EventEmitter<TimelineFrame | null>(),
    playingChanged: new EventEmitter<boolean>(),
  };

  constructor(timeline: Timeline) {
    this.timeline = timeline;
    this.#reversedFrames = [...this.timeline.frames].reverse();
    this.loop = new GameLoop({
      fps: 60,
      update: this.setCurrentTimeByDelta,
    });
    this.updateFrame();
  }

  setCurrentTime = (currentTime: number) => {
    this.currentTime = currentTime;
    this.updateFrame();
  };

  setCurrentTimeByDelta = (delta: number) => {
    this.currentTime = (this.currentTime + delta) % this.timeline.totalTime;
    this.updateFrame();
  };

  updateFrame = () => {
    this.events.timeChanged.emit(this.currentTime);
    const found = findFrameByTime(this.#reversedFrames, this.currentTime);
    this.currentFrame = found?.frame ?? null;
    this.currentFrameIndex = found?.index ?? null;
    this.events.frameChanged.emit(this.currentFrame);
  };

  destroy = () => {
    this.loop.stop();
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

  navigateFrame = (offset: number) => {
    this.pause();
    if (this.currentFrameIndex !== null) {
      const { frames } = this.timeline;
      const nextFrameIndex = calcModulo(
        this.currentFrameIndex + offset,
        frames.length - 1
      );
      this.currentFrame = frames[nextFrameIndex];
      this.currentFrameIndex = nextFrameIndex;
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
