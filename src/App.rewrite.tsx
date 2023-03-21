import React from "react";
import gifPath from "./dance.gif";
import { useLocalForageState } from "./lib/hooks";
import { GifData } from "./lib/models";
import createGifDatafromBlob from "./lib/timeline/createGifDatafromBlob";
import createTimelineFromGifData from "./lib/timeline/createTimelineFromGifData";
import TimelinePlayback from "./lib/TimelinePlayback";

function TimeBar({ instance }: { instance: TimelinePlayback }) {
  const [time, setTime] = React.useState(0);

  React.useEffect(() => {
    return instance.events.timeChanged.on(setTime);
  }, [instance]);

  return <div>{time.toFixed()}</div>;
}

function PlaybackCanvas({ instance }: { instance: TimelinePlayback }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;

    instance.setCanvas(canvas);

    return () => {
      instance.setCanvas(null);
    };
  }, [instance]);

  return (
    <div>
      <canvas ref={canvasRef} />
    </div>
  );
}

export default function App() {
  const image = gifPath;
  const [gifData, setGifData] = useLocalForageState<GifData | null>(
    "gif-data",
    2,
    null
  );
  const timeline = React.useMemo(
    () => (gifData ? createTimelineFromGifData(gifData) : null),
    [gifData]
  );
  const [timelinePlaybackCanvas, setTimelinePlaybackCanvas] =
    React.useState<TimelinePlayback | null>(null);

  React.useEffect(() => {
    fetch(gifPath)
      .then((response) => response.blob())
      .then((blob) => createGifDatafromBlob(blob))
      .then(setGifData);
  }, []);

  React.useEffect(() => {
    if (timeline) {
      const instance = new TimelinePlayback(timeline);
      setTimelinePlaybackCanvas(instance);

      return () => {
        instance.destroy();
      };
    } else {
      setTimelinePlaybackCanvas(null);
    }
  }, [timeline]);

  return (
    <>
      {timelinePlaybackCanvas && (
        <>
          <PlaybackCanvas instance={timelinePlaybackCanvas} />
          <TimeBar instance={timelinePlaybackCanvas} />
          <button type="button" onClick={timelinePlaybackCanvas.toggle}>
            toggle play
          </button>
        </>
      )}
    </>
  );
}
