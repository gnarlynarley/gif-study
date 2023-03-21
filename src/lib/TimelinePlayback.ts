import { EventEmitter } from "./utils/EventEmitter";
import { Timeline, TimelineFrame } from "./models";
import GameLoop from "./utils/game/GameLoop";

function findFrameByTime(
  reversedFrames: TimelineFrame[],
  time: number
): TimelineFrame | null {
  for (const frame of reversedFrames) {
    if (time >= frame.time) {
      return frame;
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
  events = {
    timeChanged: new EventEmitter<number>(),
    frameChanged: new EventEmitter<TimelineFrame | null>(),
    playingChanged: new EventEmitter<boolean>(),
  };

  constructor(timeline: Timeline) {
    this.timeline = timeline;
    this.#reversedFrames = [...this.timeline.frames].reverse();
    this.loop = new GameLoop({
      update: this.updateFrame,
    });
  }

  updateFrame = (delta: number) => {
    this.currentTime = (this.currentTime + delta) % this.timeline.totalTime;
    this.events.timeChanged.emit(this.currentTime);
    this.currentFrame = findFrameByTime(this.#reversedFrames, this.currentTime);
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
}

export default TimelinePlayback;
