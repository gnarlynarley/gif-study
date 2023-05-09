import * as React from "react";
import { TimelineBar, TimelineCanvas, DropZone, Toast } from "$lib/components";
import { cx } from "$lib/utils/joinClassNames";
import usePwaUpdate from "$lib/hooks/usePwaUpdate";
import { TimelineControlBar } from "./lib/components/TimelineControlBar";
import useToast from "./lib/hooks/useToast";
import useTimeline, { useTimelinePlayback } from "./lib/hooks/useTimeline";
import LoadingIndicator from "./lib/components/LoadingIndicator";
import $ from "./App.module.scss";

const Toasts: React.FC = React.memo(() => {
  const toasts = useToast((s) => s.toasts);

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
  const timelinePlayback = useTimelinePlayback();
  const setTimelineFile = useTimeline((s) => s.setFile);

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
          <TimelineControlBar timelinePlayback={timelinePlayback} />
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
