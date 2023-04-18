import * as React from "react";
import { TimelineBar, TimelineCanvas, DropZone, Toast } from "$lib/components";
import TimelinePlayback from "~src/lib/TimelinePlayback";
import { cx } from "$lib/utils/joinClassNames";
import type { GifData } from "$lib/models";
import usePersistedState from "$lib/hooks/usePersistedState";
import usePwaUpdate from "$lib/hooks/usePwaUpdate";
import $ from "./App.module.scss";
import createTimelineFromGifData from "$lib/timeline/createTimelineFromGifData";
import createGifDatafromBlob from "$lib/timeline/createGifDatafromBlob";
import { TimelineControlBar } from "./lib/components/TimelineControlBar";
import type { ScreenFilterOptions } from "./lib/ScreenFilter";
import useToast from "./lib/hooks/useToast";

function useScreenFilter() {
  const optionsDefault: ScreenFilterOptions = {
    contrastEnabled: false,
    contrastLevel: 0.3,
    onionSkinEnabled: false,
    onionSkinPrevColor: "#0000ff",
    onionSkinNextColor: "#ff6a00",
    onionSkinOpacity: 0.3,
    onionSkinSteps: 1,
  };
  const [options, setOptions] = usePersistedState(
    "screenFilterOptions",
    3,
    optionsDefault,
  );
  const setOption = <
    K extends keyof typeof optionsDefault,
    T extends typeof optionsDefault[K],
  >(
    option: K,
    value: T,
  ) => {
    setOptions((prev) => ({ ...prev, [option]: value }));
  };

  return {
    options,
    setOption,
  };
}

const Toasts: React.FC = React.memo(() => {
  const { toasts } = useToast();
  return (
    <div className={$.toasts}>
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
});

export default function App() {
  usePwaUpdate();
  const [pending, setPending] = React.useState<boolean>(false);
  const [gifData, setGifData] = usePersistedState<GifData | null>(
    "gif-data",
    3,
    null,
  );
  const screenFilter = useScreenFilter();

  const timeline = React.useMemo(
    () => (gifData ? createTimelineFromGifData(gifData) : null),
    [gifData],
  );
  const [timelinePlayback, setTimelinePlayback] =
    React.useState<TimelinePlayback | null>(null);

  React.useEffect(() => {
    if (timeline) {
      const instance = new TimelinePlayback(timeline);
      instance.play();
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
            screenFilterOptions={screenFilter.options}
            setScreenFilterOptions={screenFilter.setOption}
          />
        </div>
        {timelinePlayback && (
          <div className={cx($.canvas)}>
            <TimelineCanvas
              timelinePlayback={timelinePlayback}
              onionSkinFilterOptions={screenFilter.options}
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

        <Toasts />
      </div>
    </DropZone>
  );
}
