export interface Timeline {
  gifFile: File;
  frames: TimelineFrame[];
  timelineFrames: TimelineFrame[];
  totalTime: number;
}

export interface TimelineFrame {
  id: string;
  data: ImageData;
  time: number;
  hold: number;
  width: number;
  height: number;
  index: number;
}
