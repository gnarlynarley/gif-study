import * as React from "react";
import useKeyboard from "../hooks/useKeyboard";
import type TimelinePlayback from "../TimelinePlayback";
import { FileInput } from "./FileInput";
import { IconButton } from "./IconButton";
import { PauseIcon, PlayIcon, SkipNextIcon, SkipPreviousIcon } from "./Icons";
import { DropDown } from "./DropDown";
import { CheckboxInput } from "./CheckboxInput";
import { RangeInput } from "./RangeInput";
import { ScreenFilterOptions } from "../ScreenFilter";
import { downloadTimelineAsZip } from "../utils/downloadTimelineAsZip";
import { Button } from "./Button";
import $ from "./TimelineControlBar.module.scss";

type Props = {
  disableGifFileInput: boolean;
  timelinePlayback: TimelinePlayback | null;
  setGifFile: (file: File | null) => void;
  screenFilterOptions: ScreenFilterOptions;
  setScreenFilterOptions: <T extends keyof ScreenFilterOptions>(
    key: T,
    value: ScreenFilterOptions[T],
  ) => void;
};

export function TimelineControlBar({
  disableGifFileInput,
  setGifFile,
  timelinePlayback,
  screenFilterOptions,
  setScreenFilterOptions,
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

      {timelinePlayback && (
        <>
          <span className={$.divider} />
          <IconButton
            label="previous frame (l)"
            onClick={() => timelinePlayback.previousFrame()}
          >
            <SkipPreviousIcon />
          </IconButton>
          <IconButton
            label={playing ? "Pause (k)" : "Play (k)"}
            onClick={togglePlay}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </IconButton>
          <IconButton
            label="next frame (l)"
            onClick={() => timelinePlayback.nextFrame()}
          >
            <SkipNextIcon />
          </IconButton>
        </>
      )}

      <span className={$.push} />

      {timelinePlayback && (
        <DropDown>
          <RangeInput
            label={`Playback speed ${Math.round(
              timelinePlayback.speed * 100,
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
            checked={screenFilterOptions.onionSkinEnabled}
            onChange={(value) => {
              setScreenFilterOptions("onionSkinEnabled", value);
              setScreenFilterOptions("contrastEnabled", value);
            }}
          />
          {screenFilterOptions.onionSkinEnabled && (
            <>
              <RangeInput
                label={`Opacity ${Math.round(
                  screenFilterOptions.onionSkinOpacity * 100,
                )}%`}
                min={0}
                max={1}
                step={0.01}
                value={screenFilterOptions.onionSkinOpacity ?? 0}
                onChange={(value) =>
                  setScreenFilterOptions("onionSkinOpacity", value)
                }
              />
              <RangeInput
                label={`Contrast ${Math.round(
                  screenFilterOptions.contrastLevel * 100,
                )}%`}
                min={0}
                max={1}
                step={0.01}
                value={screenFilterOptions.contrastLevel}
                onChange={(value) =>
                  setScreenFilterOptions("contrastLevel", value)
                }
              />
              <RangeInput
                label={`Steps: ${screenFilterOptions.onionSkinSteps}`}
                min={0}
                max={5}
                step={1}
                value={screenFilterOptions.onionSkinSteps ?? 0}
                onChange={(value) =>
                  setScreenFilterOptions("onionSkinSteps", value)
                }
              />
              <div>
                <input
                  type="color"
                  value={screenFilterOptions.onionSkinPrevColor}
                  onChange={(ev) =>
                    setScreenFilterOptions(
                      "onionSkinPrevColor",
                      ev.target.value,
                    )
                  }
                />
                <input
                  type="color"
                  value={screenFilterOptions.onionSkinNextColor}
                  onChange={(ev) =>
                    setScreenFilterOptions(
                      "onionSkinNextColor",
                      ev.target.value,
                    )
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
