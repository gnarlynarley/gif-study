export interface Timeline {
  version: "1";
  fileType: "gif";
  id: string;
  gifBlob: Blob;
  frames: TimelineFrame[];
  totalTime: number;
  width: number;
  height: number;
  trimStart: number;
  trimEnd: number;
}

export interface TimelineFrame {
  id: string;
  data: ImageData;
  time: number;
  duration: number;
  width: number;
  height: number;
  index: number;
}

export type ToastMessageType = "message" | "error";
export interface ToastMessage {
  id: string;
  message: string | JSX.Element;
  type: ToastMessageType;
  duration: number | null;
}
