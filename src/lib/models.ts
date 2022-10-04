export interface Timeline {
  gifFile: File;
  frames: TimelineFrame[];
  timelineFrames: TimelineFrame[];
  totalTime: number;
  averageFrameDelay: number;
}

export interface TimelineFrame {
  id: string;
  data: ImageData;
  time: number;
  delay: number;
  width: number;
  height: number;
  index: number;
}
