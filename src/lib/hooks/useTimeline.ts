import { type Timeline } from "../models";
import createTimelineFromGifBlob from "../timeline/createTimelineFromGifBlob";
import React from "react";
import TimelinePlayback from "../TimelinePlayback";
import { createStore, createPersistedStore } from "../utils/store";
import useStore from "./useStore";

const timelineStore = createPersistedStore<Timeline | null>("timeline", null);
const pendingStore = createStore<boolean>(false);

interface UseTimelineValue {
  timeline: Timeline | null;
  pending: boolean;
  setFile(file: Blob | null): Promise<void>;
  setTimeline: (timeline: Timeline | null) => void;
}

export const useTimelinePlayback = () => {
  const { timeline, setTimeline } = useTimeline();
  const [timelinePlayback, setTimelinePlayback] =
    React.useState<TimelinePlayback | null>(null);

  React.useEffect(() => {
    if (timeline) {
      const instance = new TimelinePlayback(timeline);
      instance.play();
      setTimelinePlayback(instance);
      instance.events.timelineChanged.on(setTimeline);

      return () => {
        instance.destroy();
      };
    } else {
      setTimelinePlayback(null);
    }
  }, [timeline?.id]);

  return timelinePlayback;
};

const useTimeline = (): UseTimelineValue => {
  const [timeline, setTimeline] = useStore(timelineStore);
  const [pending, setPending] = useStore(pendingStore);
  const setFile = async (file: Blob | null) => {
    try {
      if (file) {
        setPending(true);
        setTimeline(await createTimelineFromGifBlob(file));
      } else {
        setTimeline(null);
      }
    } finally {
      setPending(false);
    }
  };

  return { timeline, pending, setFile, setTimeline };
};

export default useTimeline;
