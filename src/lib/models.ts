export interface Timeline {
  id: string;
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
  duration: number;
  width: number;
  height: number;
  number: number;
}

export type ToastMessageType = "message" | "error";
export interface ToastMessage {
  id: string;
  message: string | JSX.Element;
  type: ToastMessageType;
  duration: number | null;
}
