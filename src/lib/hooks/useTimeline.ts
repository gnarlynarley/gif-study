import { create } from "zustand";
import {
  persist,
  type PersistStorage,
  type StorageValue,
} from "zustand/middleware";
import localforage from "localforage";
import type { Timeline } from "../models";
import createGifDatafromBlob from "../timeline/createGifDatafromBlob";
import createTimelineFromGifData from "../timeline/createTimelineFromGifData";
import debounce from "../utils/debounce";
import React from "react";
import TimelinePlayback from "../TimelinePlayback";

interface UseTimelineValue {
  timeline: Timeline | null;
  pending: boolean;
  setFile(file: Blob | null): Promise<void>;
  setTimelineValue: <T extends keyof Timeline>(
    key: T,
    value: Timeline[T],
  ) => void;
}
type PersistedTimelineValue = Pick<UseTimelineValue, "timeline">;
type MiddleWareType = [["zustand/persist", PersistedTimelineValue]];

function createLocalforageStorage<T = any>(): PersistStorage<T> {
  return {
    getItem: async (name) => {
      const state = await localforage.getItem<StorageValue<T>>(name);
      if (!state) return null;
      return state;
    },
    removeItem: async (name) => {
      await localforage.removeItem(name);
    },
    setItem: debounce(async (name, value) => {
      await localforage.setItem(name, value);
    }, 500),
  };
}

export const useTimelinePlayback = () => {
  const timeline = useTimeline((s) => s.timeline);
  const setTimelineValue = useTimeline((s) => s.setTimelineValue);
  const [timelinePlayback, setTimelinePlayback] =
    React.useState<TimelinePlayback | null>(null);

  React.useEffect(() => {
    if (timeline) {
      const instance = new TimelinePlayback(timeline);
      instance.play();
      setTimelinePlayback(instance);
      instance.events.trimStartChanged.on((trimStart) => {
        setTimelineValue("trimStart", trimStart);
      });
      instance.events.trimEndChanged.on((trimEnd) => {
        setTimelineValue("trimEnd", trimEnd);
      });

      return () => {
        instance.destroy();
      };
    } else {
      setTimelinePlayback(null);
    }
  }, [timeline?.id]);

  return timelinePlayback;
};

const useTimeline = create<UseTimelineValue, MiddleWareType>(
  persist(
    (set, get) => {
      return {
        timeline: null,
        pending: false,
        setTimelineValue(key, value) {
          const timeline = get().timeline;
          if (timeline) {
            set({
              timeline: {
                ...timeline,
                [key]: value,
              },
            });
          }
        },
        async setFile(file: Blob | null) {
          try {
            if (file) {
              set({ pending: true });
              const gifData = await createGifDatafromBlob(file);
              const timeline = createTimelineFromGifData(gifData);
              set({ timeline });
            } else {
              set({ timeline: null });
            }
          } finally {
            set({ pending: false });
          }
        },
      };
    },
    {
      name: "timeline",
      version: 2,
      storage: createLocalforageStorage(),
      partialize(state) {
        return {
          timeline: state.timeline,
        };
      },
    },
  ),
);

export default useTimeline;
