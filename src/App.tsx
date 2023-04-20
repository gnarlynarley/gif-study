import * as React from "react";
import { TimelineBar, TimelineCanvas, DropZone, Toast } from "$lib/components";
import TimelinePlayback from "~src/lib/TimelinePlayback";
import { cx } from "$lib/utils/joinClassNames";
import usePwaUpdate from "$lib/hooks/usePwaUpdate";
import $ from "./App.module.scss";
import { TimelineControlBar } from "./lib/components/TimelineControlBar";
import useToast from "./lib/hooks/useToast";
import useTimeline from "./lib/hooks/useTimeline";
import LoadingIndicator from "./lib/components/LoadingIndicator";

const Toasts: React.FC = React.memo(() => {
  const { toasts } = useToast();
  return (
    <div className={$.toasts}>
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
});

export default function App() {
  usePwaUpdate();
  const timelinePending = useTimeline((s) => s.pending);
  const setTimelineFile = useTimeline((s) => s.setFile);
  const timeline = useTimeline((s) => s.timeline);

  const [timelinePlayback, setTimelinePlayback] =
    React.useState<TimelinePlayback | null>(null);

  React.useEffect(() => {
    if (timeline) {
      const instance = new TimelinePlayback(timeline);
      instance.play();
      setTimelinePlayback(instance);

      return () => {
        instance.destroy();
      };
    } else {
      setTimelinePlayback(null);
    }
  }, [timeline]);

  return (
    <DropZone
      accept="image/gif"
      disabled={timelinePending}
      onFileDrop={setTimelineFile}
    >
      {timelinePending && (
        <span className={$.loading}>
          <span>Loading gif</span>
          <LoadingIndicator />
        </span>
      )}
      <div className={cx($.container)}>
        <div className={$.controlBar}>
          <TimelineControlBar
            timelinePlayback={timelinePlayback}
            disableGifFileInput={timelinePending}
            setGifFile={(file) => file && setTimelineFile(file)}
          />
        </div>
        {timelinePlayback && (
          <div className={cx($.canvas)}>
            <TimelineCanvas timelinePlayback={timelinePlayback} />
          </div>
        )}

        {timelinePlayback && (
          <div className={$.timeline}>
            <TimelineBar timelinePlayback={timelinePlayback} />
          </div>
        )}

        <Toasts />
      </div>
    </DropZone>
  );
}
