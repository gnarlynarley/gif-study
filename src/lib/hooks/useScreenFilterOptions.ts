import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ScreenFilterOptions } from "../ScreenFilter";

type UseScreenFilterValue = ScreenFilterOptions & {
  setValue<T extends keyof ScreenFilterOptions>(
    key: T,
    value: ScreenFilterOptions[T],
  ): void;
};

const useScreenFilterOptions = create(
  persist<UseScreenFilterValue>(
    (set) => ({
      contrastEnabled: false,
      contrastLevel: 0.3,
      onionSkinEnabled: false,
      onionSkinPrevColor: "#0000ff",
      onionSkinNextColor: "#ff6a00",
      onionSkinOpacity: 0.3,
      onionSkinSteps: 1,
      setValue(key, value) {
        set({
          [key]: value,
        });
      },
    }),
    {
      name: "screen-filter-options",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

export default useScreenFilterOptions;
