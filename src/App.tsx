import * as React from "react";
import { convertGif, type Gif } from "./lib/buzzfeed-gif";
import {
  PlayIcon,
  PauseIcon,
  IconButton,
  ImageDataCanvas,
  ResizableContainer,
  Timeline,
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
import $ from "./App.module.scss";
import { FileInput } from "./lib/components/FileInput";
import { Button } from "./lib/components/Button";

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
        id: frame.id,
        data: frame.data,
        hold: frame.delay,
        time: time - frame.delay,
        width: frame.data.width,
        height: frame.data.height,
      };
    });
    return {
      ...gif,
      frames,
      timelineFrames: frames.flatMap((frame) =>
        Array.from({ length: frame.hold }, () => frame)
      ),
      totalTime: frames.reduce((acc, frame) => acc + frame.hold, 0),
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
    if (!file) return;
    try {
      setPending(true);
      const nextGif = await convertGif(file);
      setGif(nextGif);
    } finally {
      setPending(false);
    }
  };

  React.useEffect(() => {
    generateGif(file);
  }, [file]);

  React.useEffect(() => {
    console.log(speedValue);
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
  useKeybind("j", () => {
    navigateFrame(-1);
  });
  useKeybind("l", () => {
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
    <DropZone accept="image/gif" onFileDrop={setFile}>
      <div className={cx($.container)}>
        <div className={$.toolbar}>
          <div className={$.toolbarRow}>
            <FileInput accept="image/gif" label="Open gif" onFile={setFile} />
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
            <span className={$.toolbarPush} />
            <DropDown>
              <RangeInput
                label="Playback speed"
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
                    label="Timeline width"
                    min={0}
                    max={1}
                    step={0.1}
                    value={timelineOptions.widthMultiplier}
                    onChange={(value) =>
                      changeTimelineOption("widthMultiplier", value)
                    }
                  />
                </>
              )}

              <Button onClick={() => generateGif(gif?.file ?? null)}>
                regenerate frames
              </Button>
            </DropDown>
          </div>
        </div>
        <div className={$.image}>
          {currentFrame && (
            <ImageDataCanvas
              className={cx($.canvas, $.isCurrentFrame)}
              data={currentFrame.data}
            />
          )}
        </div>
        {timeline && timelineOptions !== null && (
          <div className={$.thumbnails}>
            <ResizableContainer
              size={timelineOptions.height}
              min={50}
              max={600}
              onChange={(value) => changeTimelineOption("height", value)}
            >
              <Timeline
                time={time}
                totalTime={timeline.totalTime}
                frames={timeline.frames}
                currentFrame={currentFrame}
                onFrameChange={(frame) => setTime(frame.time)}
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
