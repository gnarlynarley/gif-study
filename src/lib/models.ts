export interface GifFrame {
  id: string;
  data: ImageData;
  delay: number;
}

export interface GifData {
  id: string;
  blob: Blob;
  frames: GifFrame[];
  width: number;
  height: number;
}

export interface Timeline {
  id: string;
  gifBlob: Blob;
  frames: TimelineFrame[];
  totalTime: number;
  averageFrameDelay: number;
  width: number;
  height: number;
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
