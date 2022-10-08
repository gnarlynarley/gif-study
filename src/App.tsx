import * as React from "react";
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
import { useKeybind, useLocalForageState } from "./lib/hooks";
import { FileInput } from "./lib/components/FileInput";
import { Button } from "./lib/components/Button";
import {
  downloadTimelineAsZip,
  downloadTimelineFrame,
} from "./lib/utils/downloadTimelineAsZip";
import { toggleFullScreen } from "./lib/utils/toggleFullScreen";
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

export function App() {
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
  const [file, setFile] = React.useState<File | null>(null);
  const [time, setTime] = React.useState(0);
  const { options, setOption } = useTimelineOptions();

  const currentFrame = timeline?.timelineFrames[time] ?? null;

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

  React.useEffect(() => {
    generateGif(file);
  }, [file]);

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

  useKeybind("k", () => {
    setPlaying(!playing);
  });
  useKeybind("space", () => {
    setPlaying(!playing);
  });
  useKeybind("j", () => {
    navigateFrame(-1);
  });
  useKeybind("left", () => {
    navigateFrame(-1);
  });
  useKeybind("l", () => {
    navigateFrame(1);
  });
  useKeybind("right", () => {
    navigateFrame(1);
  });
  useKeybind("f", () => {
    toggleFullScreen();
  });

  return (
    <DropZone accept="image/gif" disabled={pending} onFileDrop={setFile}>
      {pending && <span className={$.loading}>Loading gif..</span>}
      <div className={cx($.container)}>
        <div className={$.toolbar}>
          <FileInput
            disabled={pending}
            accept="image/gif"
            label="Open gif"
            onFile={setFile}
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
            frame: {currentFrame?.number ?? 0}, duration:{" "}
            {currentFrame?.duration ?? ""}
            0ms
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
              </>
            )}
            {currentFrame && (
              <Button onClick={() => downloadTimelineFrame(currentFrame)}>
                download current screen
              </Button>
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
      </div>
    </DropZone>
  );
}
