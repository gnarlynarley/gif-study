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
import { TimelineFrame } from "../models";
import { DropDown } from "./DropDown";
import { CheckboxInput } from "./CheckboxInput";
import { RangeInput } from "./RangeInput";
import { OnionSkinFilterOptions } from "../OnionSkinFilter";
import { downloadTimelineAsZip } from "../utils/downloadTimelineAsZip";
import { Button } from "./Button";

const ZOOM_AMOUNT = 0.2;

type Props = {
  disableGifFileInput: boolean;
  timelinePlayback: TimelinePlayback | null;
  setGifFile: (file: File | null) => void;
  onionSkinFilterOptions: OnionSkinFilterOptions;
  setOnionSkinFilterOptions: <T extends keyof OnionSkinFilterOptions>(
    key: T,
    value: OnionSkinFilterOptions[T]
  ) => void;
};

export function TimelineControlBar({
  disableGifFileInput,
  setGifFile,
  timelinePlayback,
  onionSkinFilterOptions,
  setOnionSkinFilterOptions,
}: Props) {
  const [playing, setPlaying] = React.useState(false);
  const [speed, setSpeed] = React.useState(timelinePlayback?.speed ?? 1);

  React.useEffect(() => {
    if (!timelinePlayback) {
      setPlaying(false);
      setSpeed(1);
    } else {
      const cleanups = [timelinePlayback.events.playingChanged.on(setPlaying)];
      setSpeed(timelinePlayback.speed);

      return () => {
        cleanups.forEach((cleanup) => cleanup());
      };
    }
  }, [timelinePlayback]);

  const togglePlay = () => {
    timelinePlayback?.toggle();
  };

  useKeyboard("k", togglePlay);
  useKeyboard("space", togglePlay);
  useKeyboard("j", () => timelinePlayback?.previousFrame());
  useKeyboard("l", () => timelinePlayback?.nextFrame());

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

      {/* <span className={$.divider} />

      <span className={$.info}>
        <span>current frame: {0} | </span>
        <span>repeating frame: {0} | </span>
        <span>duration: {0} frames</span>
      </span> */}

      <span className={$.push} />

      {timelinePlayback && (
        <DropDown>
          <RangeInput
            label={`Playback speed ${Math.round(
              timelinePlayback.speed * 100
            )}%`}
            min={0}
            max={3}
            step={0.05}
            value={speed}
            onChange={(value) => {
              setSpeed(value);
              timelinePlayback.setSpeed(value);
            }}
          />

          <>
            <Button
              onClick={() => downloadTimelineAsZip(timelinePlayback.timeline)}
            >
              download frames
            </Button>
            <Button onClick={() => setGifFile(null)}>clear frames</Button>
          </>

          <h3>Onion skin options:</h3>

          <CheckboxInput
            id="union-enabled"
            label="Enabled"
            checked={onionSkinFilterOptions.enabled}
            onChange={(value) => setOnionSkinFilterOptions("enabled", value)}
          />
          {onionSkinFilterOptions.enabled && (
            <>
              <RangeInput
                label={`Contrast ${Math.round(
                  onionSkinFilterOptions.contrastLevel * 100
                )}%`}
                min={0}
                max={1}
                step={0.01}
                value={onionSkinFilterOptions.contrastLevel}
                onChange={(value) =>
                  setOnionSkinFilterOptions("contrastLevel", value)
                }
              />
              <RangeInput
                label={`Opacity ${Math.round(
                  onionSkinFilterOptions.opacity * 100
                )}%`}
                min={0}
                max={1}
                step={0.01}
                value={onionSkinFilterOptions.opacity ?? 0}
                onChange={(value) =>
                  setOnionSkinFilterOptions("opacity", value)
                }
              />
              <RangeInput
                label={`Steps: ${onionSkinFilterOptions.steps}`}
                min={0}
                max={5}
                step={1}
                value={onionSkinFilterOptions.steps ?? 0}
                onChange={(value) => setOnionSkinFilterOptions("steps", value)}
              />
              <div>
                <input
                  type="color"
                  value={onionSkinFilterOptions.prevColor}
                  onChange={(ev) =>
                    setOnionSkinFilterOptions("prevColor", ev.target.value)
                  }
                />
                <input
                  type="color"
                  value={onionSkinFilterOptions.nextColor}
                  onChange={(ev) =>
                    setOnionSkinFilterOptions("nextColor", ev.target.value)
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
      )}
    </div>
  );
}
