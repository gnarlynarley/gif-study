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
import type { OnionSkinFilterOptions } from "./lib/OnionSkinFilter";

function useOnionSkinFilter() {
  const timelineOptionsDefaults: OnionSkinFilterOptions = {
    enabled: false,
    contrastLevel: 0.3,
    prevColor: "#0000ff",
    nextColor: "#ff6a00",
    opacity: 0.3,
    steps: 1,
  };
  const [options, setOptions] = usePersistedState(
    "onionSkinOptions",
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
  const onionSkinFilter = useOnionSkinFilter();

  const timeline = React.useMemo(
    () => (gifData ? createTimelineFromGifData(gifData) : null),
    [gifData]
  );
  const [timelinePlayback, setTimelinePlayback] =
    React.useState<TimelinePlayback | null>(null);

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

  const setGifFile = async (gifFile: File | null) => {
    if (gifFile) {
      setPending(true);
      const nextGifData = await createGifDatafromBlob(gifFile);
      setGifData(nextGifData);
      setPending(false);
    } else {
      setGifData(null);
    }
  };

  return (
    <DropZone accept="image/gif" disabled={pending} onFileDrop={setGifFile}>
      {pending && <span className={$.loading}>Loading gif..</span>}
      <div className={cx($.container)}>
        <div className={$.controlBar}>
          <TimelineControlBar
            timelinePlayback={timelinePlayback}
            disableGifFileInput={pending}
            setGifFile={setGifFile}
            onionSkinFilterOptions={onionSkinFilter.options}
            setOnionSkinFilterOptions={onionSkinFilter.setOption}
          />
        </div>
        {timelinePlayback && (
          <div className={cx($.canvas)}>
            <TimelineCanvas
              timelinePlayback={timelinePlayback}
              onionSkinFilterOptions={onionSkinFilter.options}
            />
          </div>
        )}

        {timeline && timelinePlayback && (
          <div className={$.timeline}>
            <TimelineBar
              timeline={timeline}
              timelinePlayback={timelinePlayback}
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
