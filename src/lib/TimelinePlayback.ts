import { EventEmitter } from "./utils/EventEmitter";
import { Timeline, TimelineFrame } from "./models";
import GameLoop from "./utils/game/GameLoop";
import { calcModulo } from "./utils/calcModulo";

export class TimelinePlayback {
  static findFrameByTime(
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

  playing: boolean = false;
  loop: GameLoop;
  timeline: Timeline;
  #reversedFrames: TimelineFrame[];
  currentTime = 0;
  currentFrame: TimelineFrame | null = null;
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
      update: this.#setCurrentTimeByDelta,
    });
    this.#updateFrame();
  }

  #setCurrentTimeByDelta = (delta: number) => {
    this.setCurrentTime(
      (this.currentTime + delta * this.speed) % this.timeline.totalTime
    );
  };

  setCurrentTime = (currentTime: number) => {
    this.currentTime = currentTime;
    this.events.timeChanged.emit(currentTime);
    this.#updateFrame();
  };

  #updateFrame = () => {
    const found = TimelinePlayback.findFrameByTime(
      this.#reversedFrames,
      this.currentTime
    );
    this.#setFrame(found?.frame ?? null);
  };

  #setFrame = (frame: TimelineFrame | null) => {
    this.currentFrame = frame;
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

  speed = 1;

  setSpeed = (speed: number) => {
    this.speed = speed;
  };

  navigateFrame = (offset: number) => {
    this.pause();
    const currentIndex = this.currentFrame?.index ?? null;
    if (currentIndex !== null) {
      const { frames } = this.timeline;
      const nextFrameIndex = calcModulo(
        currentIndex + offset,
        frames.length - 1
      );
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
