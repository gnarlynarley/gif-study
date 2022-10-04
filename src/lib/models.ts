export interface Timeline {
  gifFile: File;
  frames: TimelineFrame[];
  timelineFrames: TimelineFrame[];
  totalTime: number;
  averageFrameDelay: number;
  renderCache: WeakMap<ImageData, ImageData>;
}

export interface TimelineFrame {
  id: string;
  data: ImageData;
  time: number;
  duration: number;
  width: number;
  height: number;
  number: number;
}
