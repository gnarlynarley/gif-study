import * as React from "react";
import localforage from "localforage";
import { convertGif, type Gif } from "./lib/buzzfeed-gif";
import { ImageDataCanvas } from "./lib/components";
import { cx } from "./lib/utils/joinClassNames";
import type { Timeline as TimelineType, TimelineFrame } from "./lib/models";
import { Timeline } from "./lib/components/Timeline";
import $ from "./App.module.scss";
import { useKeybind } from "./lib/hooks";

function useLocalForageState<T>(key: string, version: number, defaultState: T) {
  const storageKey = `${key}::${version}`;
  const [state, setState] = React.useState<T | null>(defaultState);

  React.useEffect(() => {
    localforage.getItem<T>(storageKey).then(setState);
  }, []);

  React.useEffect(() => {
    localforage.setItem(storageKey, state);
  }, [state]);

  return [state, setState] as const;
}

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
    };
  }, [gif]);
  const [file, setFile] = React.useState<File | null>(null);

  const [frame, setFrame] = React.useState(0);
  const currentFrame = timeline?.timelineFrames[frame] ?? null;
  const currentFrameIndex = currentFrame
    ? timeline?.frames.indexOf(currentFrame) ?? -1
    : -1;
  const length = timeline?.frames.length ?? 0;
  const prevFrame = timeline?.frames[(length + currentFrameIndex - 1) % length];
  const nextFrame = timeline?.frames[(length + currentFrameIndex + 1) % length];
  const navigateFrame = (add: number) => {
    setPlaying(false);
    if (currentFrameIndex === -1) return;
    const nextFrameIndex = (length + currentFrameIndex + add) % length;
    console.log(nextFrameIndex);
    const nextFrame = timeline?.frames[nextFrameIndex] ?? null;
    if (nextFrame) {
      setFrame(nextFrame.time);
    }
  };

  const [unionSkin, setUnionSkin] = React.useState(false);

  const generateGif = async (file: File | null) => {
    setFrame(0);
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
      setFrame((prev) => (prev + 1) % max);
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

  return (
    <div className={cx($.container, unionSkin && $.hasUnionSkin)}>
      <div className={$.toolbar}>
        <button type="button" onClick={() => navigateFrame(-1)}>
          previous frame (j)
        </button>
        <button type="button" onClick={() => setPlaying(!playing)}>
          {playing ? "pause" : "play"} (k)
        </button>
        <button type="button" onClick={() => navigateFrame(1)}>
          next frame (l)
        </button>
        <input
          type="file"
          accept="image/gif"
          onChange={(ev) => {
            const file = ev.target.files?.[0] ?? null;
            setFile(file);
            ev.target.value = "";
          }}
        />
        <label htmlFor="speed">Speed</label>
        <input
          id="speed"
          type="range"
          min="0"
          max="2"
          step={0.2}
          value={speedValue}
          onChange={(ev) => setSpeed(ev.target.valueAsNumber)}
        />
        <button type="button" onClick={() => setUnionSkin(!unionSkin)}>
          {unionSkin ? "Disable" : "Enable"} union
        </button>
        <button type="button" onClick={() => generateGif(gif?.file ?? null)}>
          regenerate frames
        </button>
        {pending && <span>pending..</span>}
      </div>
      <div className={$.image}>
        {unionSkin && (
          <>
            {prevFrame && (
              <ImageDataCanvas
                className={cx($.canvas, $.isPrevFrame)}
                data={prevFrame.data}
              />
            )}
            {nextFrame && (
              <ImageDataCanvas
                className={cx($.canvas, $.isNextFrame)}
                data={nextFrame.data}
              />
            )}
          </>
        )}
        {currentFrame && (
          <ImageDataCanvas
            className={cx($.canvas, $.isCurrentFrame)}
            data={currentFrame.data}
          />
        )}
      </div>
      {timeline && (
        <div className={$.thumbnails}>
          <Timeline
            frames={timeline.frames}
            currentFrame={currentFrame}
            onFrameChange={(frame) => setFrame(frame.time)}
            onPointerDown={() => {
              setPlaying(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
