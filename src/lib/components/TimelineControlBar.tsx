import * as React from "react";
import useKeyboard from "../hooks/useKeyboard";
import type TimelinePlayback from "../TimelinePlayback";
import { FileInput } from "./FileInput";
import { IconButton, IconLink } from "./IconButton";
import {
  FullscreenCloseIcon,
  FullscreenOpenIcon,
  GithubIcon,
  PauseIcon,
  PlayIcon,
  SkipNextIcon,
  SkipPreviousIcon,
  TwitterIcon,
} from "./Icons";
import { DropDown } from "./DropDown";
import { CheckboxInput } from "./CheckboxInput";
import { RangeInput } from "./RangeInput";
import { downloadTimelineAsZip } from "../utils/downloadTimelineAsZip";
import { Button } from "./Button";
import { GITHUB_URL, TWITTER_URL } from "~src/constants";
import useScreenFilterOptions from "../hooks/useScreenFilterOptions";
import Panel from "./Panel";
import useTimeline from "../hooks/useTimeline";
import useFullscreen from "../hooks/useFullscreen";
import $ from "./TimelineControlBar.module.scss";

type Props = {
  timelinePlayback: TimelinePlayback | null;
};

export function TimelineControlBar({ timelinePlayback }: Props) {
  const timeline = useTimeline((s) => s.timeline);
  const timelinePending = useTimeline((s) => s.pending);
  const setTimelineFile = useTimeline((s) => s.setFile);
  const screenFilterOptions = useScreenFilterOptions();
  const [playing, setPlaying] = React.useState(false);
  const [speed, setSpeed] = React.useState(timelinePlayback?.speed ?? 1);
  const fullscreen = useFullscreen();

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
  const previousFrame = () => {
    timelinePlayback?.previousFrame();
  };
  const nextFrame = () => {
    timelinePlayback?.nextFrame();
  };

  const regenerateFrames = () => {
    setTimelineFile(timeline?.gifBlob ?? null);
  };

  useKeyboard("k", togglePlay);
  useKeyboard("space", togglePlay);
  useKeyboard("j", previousFrame);
  useKeyboard("arrowleft", previousFrame);
  useKeyboard("l", nextFrame);
  useKeyboard("arrowright", nextFrame);
  useKeyboard("f", fullscreen.toggle);

  return (
    <Panel>
      <div className={$.container}>
        <FileInput
          disabled={timelinePending}
          accept="image/gif"
          label="Open gif"
          onFile={setTimelineFile}
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

        <span className={$.divider} />

        <IconButton
          label={
            fullscreen.enabled ? "Close fullscreen (f)" : "Open fullscreen (f)"
          }
          onClick={fullscreen.toggle}
        >
          {fullscreen.enabled ? (
            <FullscreenCloseIcon />
          ) : (
            <FullscreenOpenIcon />
          )}
        </IconButton>

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
              <Button onClick={() => setTimelineFile(null)}>
                clear frames
              </Button>
              <Button onClick={regenerateFrames}>regenerate frames</Button>
            </>

            <h3>Onion skin options:</h3>

            <CheckboxInput
              id="union-enabled"
              label="Enabled"
              checked={screenFilterOptions.onionSkinEnabled}
              onChange={(value) => {
                screenFilterOptions.setValue("onionSkinEnabled", value);
                screenFilterOptions.setValue("contrastEnabled", value);
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
                    screenFilterOptions.setValue("onionSkinOpacity", value)
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
                    screenFilterOptions.setValue("contrastLevel", value)
                  }
                />
                <RangeInput
                  label={`Steps: ${screenFilterOptions.onionSkinSteps}`}
                  min={0}
                  max={5}
                  step={1}
                  value={screenFilterOptions.onionSkinSteps ?? 0}
                  onChange={(value) =>
                    screenFilterOptions.setValue("onionSkinSteps", value)
                  }
                />
                <div>
                  <input
                    type="color"
                    value={screenFilterOptions.onionSkinPrevColor}
                    onChange={(ev) =>
                      screenFilterOptions.setValue(
                        "onionSkinPrevColor",
                        ev.target.value,
                      )
                    }
                  />
                  <input
                    type="color"
                    value={screenFilterOptions.onionSkinNextColor}
                    onChange={(ev) =>
                      screenFilterOptions.setValue(
                        "onionSkinNextColor",
                        ev.target.value,
                      )
                    }
                  />
                </div>
              </>
            )}

            <div>
              <h3>Keybinds:</h3>
              <ul style={{ whiteSpace: "nowrap" }}>
                <li>J = Previous frame</li>
                <li>L = Next frame</li>
                <li>K = Toggle playback</li>
              </ul>
            </div>

            <p>
              <IconLink
                href={TWITTER_URL}
                target="_blank"
                rel="noopener noreferer"
              >
                <TwitterIcon />
              </IconLink>
              <IconLink
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferer"
              >
                <GithubIcon />
              </IconLink>
            </p>
          </DropDown>
        )}
      </div>
    </Panel>
  );
}
