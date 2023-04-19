import { TimelinePlayback } from "~src/lib/TimelinePlayback";
import { create, StateCreator } from "zustand";
import {
  persist,
  type PersistStorage,
  type StorageValue,
} from "zustand/middleware";
import localforage from "localforage";

import { Timeline } from "../models";
import createGifDatafromBlob from "../timeline/createGifDatafromBlob";
import createTimelineFromGifData from "../timeline/createTimelineFromGifData";

interface UseTimelineValue {
  timeline: Timeline | null;
  pending: boolean;
  setFile(file: Blob): Promise<void>;
}
type MiddleWareType = [["zustand/persist", Pick<UseTimelineValue, "timeline">]];

function createLocalforageStorage<T = any>(): PersistStorage<T> {
  return {
    async getItem(name) {
      const state = await localforage.getItem<StorageValue<T>>(name);
      if (!state) return null;
      return state;
    },
    async removeItem(name) {
      await localforage.removeItem(name);
    },
    async setItem(name, value) {
      await localforage.setItem(name, value);
    },
  };
}

const useTimeline = create<UseTimelineValue, MiddleWareType>(
  persist(
    (set, get) => {
      return {
        timeline: null,
        timelinePlayback: null,
        pending: false,
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
      version: 1,
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
