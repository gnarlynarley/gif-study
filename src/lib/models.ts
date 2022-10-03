export interface Timeline {
  frames: TimelineFrame[];
  timelineFrames: TimelineFrame[];
}

export interface TimelineFrame {
  id: string;
  data: ImageData;
  time: number;
  hold: number;
  width: number;
  height: number;
}
