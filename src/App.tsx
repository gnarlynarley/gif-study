import * as React from "react";
import { convertGif, type Gif } from "./lib/buzzfeed-gif";
import {
  PlayIcon,
  PauseIcon,
  IconButton,
  ImageDataCanvas,
  ResizableContainer,
  TimelineBar,
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
import { downloadTimelineAsZip } from "./lib/utils/downloadTimelineAsZip";
import $ from "./App.module.scss";
import { TimelineCanvas } from "./lib/components/TimelineCanvas";

export function App() {
  const [playing, setPlaying] = React.useState(true);
  const [speed, setSpeed] = useLocalForageState<number>("speed", 2, 1);
  const speedValue = speed ?? 1;
  const [pending, setPending] = React.useState(false);
  const [gif, setGif] = useLocalForageState<Gif | null>("data", 2, null);
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
      gifFile: gif.file,
      frames,
      timelineFrames,
      totalTime,
      averageFrameDelay,
      renderCache: new WeakMap(),
    };
  }, [gif]);
  const [file, setFile] = React.useState<File | null>(null);

  const [time, setTime] = React.useState(0);

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
    }, 10 - 10 * (speedValue - 1));

    return () => {
      clearInterval(id);
    };
  }, [timeline, playing, speedValue]);

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

  const timelineOptionsDefaults = {
    height: 100,
    widthMultiplier: 0.5,
    relativeCellWidth: true,
  };
  const [timelineOptions, setTimelineOptions] = useLocalForageState(
    "timelineOptions",
    1,
    timelineOptionsDefaults
  );
  const changeTimelineOption = <
    K extends keyof typeof timelineOptionsDefaults,
    T extends typeof timelineOptionsDefaults[K]
  >(
    option: K,
    value: T
  ) => {
    setTimelineOptions((prev) => ({ ...prev, [option]: value }));
  };

  return (
    <DropZone accept="image/gif" disabled={pending} onFileDrop={setFile}>
      {pending && <span className={$.loading}>Loading gif..</span>}
      <div className={cx($.container)}>
        <div className={$.toolbar}>
          <div className={$.toolbarRow}>
            <FileInput
              disabled={pending}
              accept="image/gif"
              label="Open gif"
              onFile={setFile}
            />
            <span className={$.toolbarDivider} />
            <IconButton
              label="next frame (l)"
              onClick={() => navigateFrame(-1)}
            >
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

            {currentFrame && (
              <span className={$.toolbarInfo}>
                frame: {currentFrame.number}, duration: {currentFrame.duration}
                ms
              </span>
            )}

            <span className={$.toolbarPush} />

            <DropDown>
              <RangeInput
                label={`Playback speed ${speedValue * 100}%`}
                min={0}
                max={2}
                step={0.2}
                value={speedValue}
                onChange={setSpeed}
              />

              <CheckboxInput
                id="timeline-relative-width"
                label="use relative width"
                checked={timelineOptions.relativeCellWidth}
                onChange={(value) =>
                  changeTimelineOption("relativeCellWidth", value)
                }
              />
              {timelineOptions.relativeCellWidth && (
                <>
                  <RangeInput
                    label={`Timeline width ${
                      timelineOptions.widthMultiplier * 100
                    }%`}
                    min={0}
                    max={1}
                    step={0.05}
                    value={timelineOptions.widthMultiplier}
                    onChange={(value) =>
                      changeTimelineOption("widthMultiplier", value)
                    }
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

              <h3>Keybinds:</h3>
              <ul style={{ whiteSpace: "nowrap" }}>
                <li>J = Previous frame</li>
                <li>L = Next frame</li>
                <li>K = Toggle playback</li>
              </ul>
            </DropDown>
          </div>
        </div>
        <div className={cx($.image)}>
          <TimelineCanvas currentFrame={currentFrame} timeline={timeline} />
        </div>
        {timeline && timelineOptions !== null && (
          <div className={$.thumbnails}>
            <ResizableContainer
              size={timelineOptions.height}
              min={50}
              max={600}
              onChange={(value) => changeTimelineOption("height", value)}
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
                  timelineOptions.relativeCellWidth
                    ? timelineOptions.widthMultiplier
                    : null
                }
              />
            </ResizableContainer>
          </div>
        )}
      </div>
    </DropZone>
  );
}
