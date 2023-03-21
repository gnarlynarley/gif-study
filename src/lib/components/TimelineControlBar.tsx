import * as React from "react";
import useKeyboard from "../hooks/useKeyboard";
import type TimelinePlayback from "../TimelinePlayback";
import { FileInput } from "./FileInput";
import { IconButton } from "./IconButton";
import {
  PauseIcon,
  PlayIcon,
  SkipNextIcon,
  SkipPreviousIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "./Icons";
import $ from "./TimelineControlBar.module.scss";

const ZOOM_AMOUNT = 0.2;

type Props = {
  disableGifFileInput: boolean;
  timelinePlayback: TimelinePlayback | null;
  setGifFile: (file: File) => void;
};

export function TimelineControlBar({
  disableGifFileInput,
  setGifFile,
  timelinePlayback,
}: Props) {
  const [playing, setPlaying] = React.useState(false);
  const [time, setTime] = React.useState(0);
  React.useEffect(() => {
    if (timelinePlayback) {
      const cleanups = [
        timelinePlayback.events.playingChanged.on(setPlaying),
        timelinePlayback.events.timeChanged.on(setTime),
      ];

      return () => {
        cleanups.forEach((cleanup) => cleanup());
      };
    }
    setPlaying(false);
  }, [timelinePlayback]);

  const togglePlay = () => {
    timelinePlayback?.toggle();
  };

  useKeyboard("k", togglePlay);
  useKeyboard("space", togglePlay);

  return (
    <div className={$.container}>
      <FileInput
        disabled={disableGifFileInput}
        accept="image/gif"
        label="Open gif"
        onFile={setGifFile}
      />
      <span className={$.divider} />
      <IconButton label="next frame (l)">
        <SkipPreviousIcon />
      </IconButton>
      <IconButton
        label={playing ? "Pause (k)" : "Play (k)"}
        onClick={togglePlay}
      >
        {playing ? <PauseIcon /> : <PlayIcon />}
      </IconButton>
      <IconButton label="next frame (l)">
        <SkipNextIcon />
      </IconButton>

      <span className={$.divider} />

      <span className={$.info}>
        <span>current frame: {time} | </span>
        <span>repeating frame: {0} | </span>
        <span>duration: {0} frames</span>
      </span>

      <span className={$.toolbarPush} />

      {/* <DropDown>
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
          </DropDown> */}
    </div>
  );
}
