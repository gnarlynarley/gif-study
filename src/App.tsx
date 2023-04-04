import * as React from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { convertGif, type Gif } from "./lib/buzzfeed-gif";
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
} from "./lib/components";
import { cx } from "./lib/utils/joinClassNames";
import type { Timeline as TimelineType, TimelineFrame } from "./lib/models";
import { useKeybind, useLocalForageState, useToast } from "./lib/hooks";
import { FileInput } from "./lib/components/FileInput";
import { Button } from "./lib/components/Button";
import { downloadTimelineAsZip } from "./lib/utils/downloadTimelineAsZip";
import { toggleFullScreen } from "./lib/utils/toggleFullScreen";
import { Toast } from "./lib/components/Toast";
import $ from "./App.module.scss";

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
  const [options, setOptions] = useLocalForageState(
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

const reloadSW = "__RELOAD_SW__" as string;

function usePwaUpdate() {
  const { addToast } = useToast();
  const {
    offlineReady: [offlineReady],
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      if (reloadSW === "true") {
        r &&
          setInterval(() => {
            console.log("Checking for sw update");
            r.update();
          }, 20000 /* 20s for testing purposes */);
      } else {
        console.log("SW Registered: " + r);
      }
    },
    onRegisterError(error: any) {
      console.log("SW registration error", error);
    },
  });

  React.useEffect(() => {
    if (offlineReady) {
      addToast("App ready to work offline");
    }
  }, [offlineReady]);

  React.useEffect(() => {
    if (needRefresh) {
      addToast(
        <>
          <span>New content available, click</span>
          <Button onClick={() => updateServiceWorker(true)}>here</Button>
          <span>to reload.</span>
        </>,
        "message",
        null
      );
    }
  }, [needRefresh]);
}

export function App() {
  usePwaUpdate();
  const [playing, setPlaying] = React.useState(true);
  const [pending, setPending] = React.useState(false);
  const [speed, setSpeed] = useLocalForageState<number>("speed", 2, 1);
  const [gif, setGif] = useLocalForageState<Gif | null>("gif", 1, null);

  const timeline = React.useMemo((): TimelineType | null => {
    if (!gif) return null;
    let time = 0;
    const frames = gif.frames.map((frame): TimelineFrame => {
      time += frame.delay;
      return {
        number: frame.frameIndex,
        id: frame.id,
        data: frame.data,
        duration: frame.delay,
        time: time - frame.delay,
        width: frame.data.width,
        height: frame.data.height,
      };
    });
    const timelineFrames = frames.flatMap((frame) =>
      Array.from({ length: frame.duration }, () => frame)
    );
    const totalTime = timelineFrames.length;
    const averageFrameDelay = totalTime / frames.length;

    return {
      id: gif.id,
      gifFile: gif.file,
      frames,
      timelineFrames,
      totalTime,
      averageFrameDelay,
    };
  }, [gif]);

  const [time, setTime] = React.useState(0);
  const { options, setOption } = useTimelineOptions();

  const currentFrame = timeline?.timelineFrames[time] ?? null;

  const navigateTime = (add: number) => {
    setPlaying(false);
    setTime((prev) => {
      const max = timeline?.timelineFrames.length ?? 0;
      return (max + prev + add) % max;
    });
  };
  const navigateFrame = (add: number) => {
    const currentFrameIndex = currentFrame
      ? timeline?.frames.indexOf(currentFrame) ?? -1
      : -1;
    setPlaying(false);
    if (currentFrameIndex === -1) return;
    const length = timeline?.frames.length ?? 0;
    const nextFrameIndex = (length + currentFrameIndex + add) % length;
    const nextFrame = timeline?.frames[nextFrameIndex] ?? null;
    if (nextFrame) {
      setTime(nextFrame.time);
    }
  };

  const generateGif = async (file: File | null) => {
    setTime(0);
    setPlaying(false);
    if (!file) return;
    try {
      setPending(true);
      const nextGif = await convertGif(file);
      setGif(nextGif);
      setPlaying(true);
    } finally {
      setPending(false);
    }
  };
  const setGifFile = (file: File) => {
    generateGif(file);
  };

  const { toasts, addToast } = useToast();
  const addInvalidGifToast = () => {
    addToast("Invalid file, only .gif files are supported right now", "error");
  };

  React.useEffect(() => {
    if (playing === false) return;
    if (timeline === null) return;
    const max = timeline.timelineFrames.length;
    const id = setInterval(() => {
      setTime((prev) => (prev + 1) % max);
    }, 10 - 10 * (speed - 1));

    return () => {
      clearInterval(id);
    };
  }, [timeline, playing, speed]);

  useKeybind("k", () => setPlaying(!playing));
  useKeybind("space", () => setPlaying(!playing));
  useKeybind("j", () => navigateFrame(-1));
  useKeybind("left", () => navigateFrame(-1));
  useKeybind("l", () => navigateFrame(1));
  useKeybind("right", () => navigateFrame(1));
  useKeybind("f", () => toggleFullScreen());

  return (
    <DropZone
      accept="image/gif"
      disabled={pending}
      onFileDrop={setGifFile}
      onInvalid={addInvalidGifToast}
    >
      {pending && <span className={$.loading}>Loading gif..</span>}
      <div className={cx($.container)}>
        <div className={$.toolbar}>
          <FileInput
            disabled={pending}
            accept="image/gif"
            label="Open gif"
            onFile={setGifFile}
            onInvalid={addInvalidGifToast}
          />
          <span className={$.toolbarDivider} />
          <IconButton label="next frame (l)" onClick={() => navigateFrame(-1)}>
            <SkipPreviousIcon />
          </IconButton>
          <IconButton
            label={playing ? "Pause (k)" : "Play (k)"}
            onClick={() => setPlaying(!playing)}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </IconButton>
          <IconButton label="next frame (l)" onClick={() => navigateFrame(1)}>
            <SkipNextIcon />
          </IconButton>

          <span className={$.toolbarDivider} />

          <span className={$.toolbarInfo}>
            <span>current frame: {time} | </span>
            <span>repeating frame: {currentFrame?.number ?? 0} | </span>
            <span>duration: {currentFrame?.duration ?? ""} frames</span>
          </span>

          <span className={$.toolbarPush} />

          <DropDown>
            <RangeInput
              label={`Playback speed ${speed * 100}%`}
              min={0}
              max={2}
              step={0.2}
              value={speed}
              onChange={setSpeed}
            />

            <CheckboxInput
              id="timeline-relative-width"
              label="use relative width"
              checked={options.relativeCellWidth}
              onChange={(value) => setOption("relativeCellWidth", value)}
            />
            {options.relativeCellWidth && (
              <>
                <RangeInput
                  label={`Timeline width ${options.widthMultiplier * 100}%`}
                  min={0}
                  max={1}
                  step={0.05}
                  value={options.widthMultiplier}
                  onChange={(value) => setOption("widthMultiplier", value)}
                />
              </>
            )}

            {timeline && (
              <>
                <Button onClick={() => generateGif(timeline.gifFile)}>
                  regenerate frames
                </Button>
                <Button onClick={() => downloadTimelineAsZip(timeline)}>
                  download frames
                </Button>
                <Button onClick={() => setGif(null)}>clear frames</Button>
              </>
            )}

            <h3>Onion skin options:</h3>

            <CheckboxInput
              id="union-enabled"
              label="Enabled"
              checked={options.onionSkinEnabled}
              onChange={(value) => setOption("onionSkinEnabled", value)}
            />
            {options.onionSkinEnabled && (
              <>
                <RangeInput
                  label={`Contrast ${Math.round(
                    options.onionSkinContrastLevel * 100
                  )}%`}
                  min={0}
                  max={1}
                  step={0.01}
                  value={options.onionSkinContrastLevel}
                  onChange={(value) =>
                    setOption("onionSkinContrastLevel", value)
                  }
                />
                <RangeInput
                  label={`Opacity ${Math.round(
                    options.onionSkinOpacity * 100
                  )}%`}
                  min={0}
                  max={1}
                  step={0.01}
                  value={options.onionSkinOpacity ?? 0}
                  onChange={(value) => setOption("onionSkinOpacity", value)}
                />
                <div>
                  <input
                    type="color"
                    value={options.onionSkinPrevColor}
                    onChange={(ev) =>
                      setOption("onionSkinPrevColor", ev.target.value)
                    }
                  />
                  <input
                    type="color"
                    value={options.onionSkinNextColor}
                    onChange={(ev) =>
                      setOption("onionSkinNextColor", ev.target.value)
                    }
                  />
                </div>
              </>
            )}

            <h3>Keybinds:</h3>
            <ul style={{ whiteSpace: "nowrap" }}>
              <li>J = Previous frame</li>
              <li>L = Next frame</li>
              <li>K = Toggle playback</li>
            </ul>
          </DropDown>
        </div>

        <div className={cx($.canvas)}>
          <TimelineCanvas
            currentFrame={currentFrame}
            timeline={timeline}
            onionSkinEnabled={options.onionSkinEnabled}
            onionSkinContrastLevel={options.onionSkinContrastLevel}
            onionSkinPrevColor={options.onionSkinPrevColor}
            onionSkinNextColor={options.onionSkinNextColor}
            onionSkinOpacity={options.onionSkinOpacity}
          />
        </div>

        {timeline && options !== null && (
          <div className={$.timeline}>
            <ResizableContainer
              size={options.height}
              min={50}
              max={600}
              onChange={(value) => setOption("height", value)}
            >
              <TimelineBar
                time={time}
                timeline={timeline}
                currentFrame={currentFrame}
                onTimeChange={setTime}
                onPointerDown={() => {
                  setPlaying(false);
                }}
                multiplierWidth={
                  options.relativeCellWidth ? options.widthMultiplier : null
                }
              />
            </ResizableContainer>
          </div>
        )}

        <div className={$.toasts}>
          {toasts.map((toast) => (
            <Toast key={toast.id} toast={toast} />
          ))}
        </div>
      </div>
    </DropZone>
  );
}
