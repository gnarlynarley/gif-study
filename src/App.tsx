import * as React from "react";
import {
  PlayIcon,
  PauseIcon,
  IconButton,
  ResizableContainer,
  TimelineBar,
  TimelineCanvas,
  SkipPreviousIcon,
  SkipNextIcon,
  CheckboxInput,
  DropZone,
  RangeInput,
  DropDown,
  Toast,
} from "$lib/components";
import { cx } from "$lib/utils/joinClassNames";
import type {
  GifData,
  Timeline as TimelineType,
  TimelineFrame,
} from "$lib/models";
import usePersistedState from "$lib/hooks/usePersistedState";
import useToast from "$lib/hooks/useToast";
import useKeyboard from "$lib/hooks/useKeyboard";
import { FileInput } from "$lib/components/FileInput";
import usePwaUpdate from "$lib/hooks/usePwaUpdate";
import { Button } from "$lib/components/Button";
import { downloadTimelineAsZip } from "$lib/utils/downloadTimelineAsZip";
import { toggleFullScreen } from "$lib/utils/toggleFullScreen";
import $ from "./App.module.scss";
import TimelinePlayback from "~src/lib/TimelinePlayback";
import createTimelineFromGifData from "$lib/timeline/createTimelineFromGifData";
import createGifDatafromBlob from "$lib/timeline/createGifDatafromBlob";
import { TimelineControlBar } from "./lib/components/TimelineControlBar";

function useTimelineOptions() {
  const timelineOptionsDefaults = {
    height: 100,
    widthMultiplier: 0.5,
    relativeCellWidth: true,
    onionSkinEnabled: false,
    onionSkinContrastLevel: 0.3,
    onionSkinPrevColor: "#0000ff",
    onionSkinNextColor: "#ff6a00",
    onionSkinOpacity: 0.3,
  };
  const [options, setOptions] = usePersistedState(
    "timelineOptions",
    3,
    timelineOptionsDefaults
  );
  const setOption = <
    K extends keyof typeof timelineOptionsDefaults,
    T extends typeof timelineOptionsDefaults[K]
  >(
    option: K,
    value: T
  ) => {
    setOptions((prev) => ({ ...prev, [option]: value }));
  };

  return {
    options,
    setOption,
  };
}

export default function App() {
  usePwaUpdate();
  const [pending, setPending] = React.useState<boolean>(false);
  const [gifData, setGifData] = usePersistedState<GifData | null>(
    "gif-data",
    2,
    null
  );

  const setGifFile = async (gifFile: File) => {
    setPending(true);
    const nextGifData = await createGifDatafromBlob(gifFile);
    setGifData(nextGifData);
    setPending(false);
  };

  const timeline = React.useMemo(
    () => (gifData ? createTimelineFromGifData(gifData) : null),
    [gifData]
  );
  const [timelinePlayback, setTimelinePlayback] =
    React.useState<TimelinePlayback | null>(null);

  const [playing, setPlaying] = React.useState(false);
  const [time, setTime] = React.useState(0);
  const [currentFrame, setCurrentFrame] = React.useState<TimelineFrame | null>(
    null
  );
  React.useEffect(() => {
    if (timelinePlayback) {
      const cleanups = [
        timelinePlayback.events.playingChanged.on(setPlaying),
        timelinePlayback.events.timeChanged.on(setTime),
        timelinePlayback.events.frameChanged.on(setCurrentFrame),
      ];

      return () => {
        cleanups.forEach((cleanup) => cleanup());
      };
    }
    setPlaying(false);
  }, [timelinePlayback]);

  React.useEffect(() => {
    if (timeline) {
      const instance = new TimelinePlayback(timeline);
      setTimelinePlayback(instance);

      return () => {
        instance.destroy();
      };
    } else {
      setTimelinePlayback(null);
    }
  }, [timeline]);

  return (
    <DropZone accept="image/gif" disabled={pending} onFileDrop={setGifFile}>
      {pending && <span className={$.loading}>Loading gif..</span>}
      <div className={cx($.container)}>
        <div className={$.controlBar}>
          <TimelineControlBar
            timelinePlayback={timelinePlayback}
            disableGifFileInput={pending}
            setGifFile={setGifFile}
          />
        </div>
        {timelinePlayback && (
          <div className={cx($.canvas)}>
            <TimelineCanvas timelinePlayback={timelinePlayback} />
          </div>
        )}

        {timeline && (
          <div className={$.timeline}>
            <TimelineBar
              time={time}
              timeline={timeline}
              currentFrame={currentFrame}
              onTimeChange={setTime}
              onPointerDown={() => {
                setPlaying(false);
              }}
              multiplierWidth={100}
            />
          </div>
        )}

        {/* <div className={$.toasts}>
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} />
          ))}
        </div> */}
      </div>
    </DropZone>
  );
}
