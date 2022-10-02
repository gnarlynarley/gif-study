import * as React from "react";
import localforage from "localforage";
import { convertGif, isPixelDataMatch, type Gif } from "./lib/buzzfeed-gif";
import { createImage } from "./lib/utils/createImage";
import $ from "./App.module.scss";
import { ImageDataCanvas } from "./lib/components";
import { cx } from "./lib/utils/joinClassNames";

function useLocalForageState<T>(key: string, defaultState: T) {
  const [state, setState] = React.useState<T | null>(defaultState);

  React.useEffect(() => {
    localforage.getItem<T>(key).then(setState);
  }, []);

  React.useEffect(() => {
    localforage.setItem(key, state);
  }, [state]);

  return [state, setState] as const;
}

export function App() {
  const [playing, setPlaying] = React.useState(true);
  const [pending, setPending] = React.useState(false);
  const [gif, setGif] = useLocalForageState<Gif | null>("data", null);
  const gifInfo = React.useMemo(() => {
    if (!gif) return null;
    let time = 0;
    const frames = gif.frames.map((frame) => {
      time += frame.delay;
      return {
        ...frame,
        time: time - frame.delay,
      };
    });
    return {
      ...gif,
      frames,
      timelineFrames: frames.flatMap((frame) =>
        Array.from({ length: frame.delay }, () => frame)
      ),
    };
  }, [gif]);
  const [file, setFile] = React.useState<File | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [frame, setFrame] = React.useState(0);

  React.useEffect(() => {
    setFrame(0);
    if (!file) return;
    (async () => {
      try {
        setPending(true);
        const nextGif = await convertGif(file);
        setGif(nextGif);
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) return;
        canvas.width = nextGif.width;
        canvas.height = nextGif.height;
      } finally {
        setPending(false);
      }
    })();
  }, [file]);

  React.useEffect(() => {
    if (playing === false) return;
    if (gifInfo === null) return;
    const max = gifInfo.timelineFrames.length;
    const id = setInterval(() => {
      setFrame((prev) => (prev + 1) % max);
    }, 1000 / 60);

    return () => {
      clearInterval(id);
    };
  }, [gifInfo, playing]);

  React.useEffect(() => {}, []);

  const currentFrame = gifInfo?.timelineFrames[frame];

  return (
    <div className={$.container}>
      <div className={$.toolbar}>
        <button type="button" onClick={() => setPlaying(!playing)}>
          {playing ? "pause" : "play"}
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
        {pending && <span>pending..</span>}
      </div>
      <div className={$.image}>
        {currentFrame && <ImageDataCanvas data={currentFrame.data} />}
      </div>
      {gifInfo && (
        <div className={$.thumbnails}>
          {gifInfo.frames.map((frame) => (
            <button
              type="button"
              onClick={() => {
                setPlaying(false);
                setFrame(frame.time);
              }}
              key={frame.id}
              className={cx($.thumbnail, frame === currentFrame && $.isActive)}
            >
              <ImageDataCanvas data={frame.data} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
