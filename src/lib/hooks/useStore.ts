import React from "react";
import { Store } from "../utils/store";

export default function useStore<T>(store: Store<T>) {
  const state = React.useSyncExternalStore(store.subscribe, store.getValue);
  const setValue = (updater: T | ((prev: T) => T)) => {
    const value =
      typeof updater === "function"
        ? (updater as any)(store.getValue())
        : updater;
    store.setValue(value);
  };

  return [state, setValue] as const;
}
