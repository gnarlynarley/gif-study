import { ScreenFilterOptions } from "../ScreenFilter";
import { createPersistedStore } from "../utils/store";
import useStore from "./useStore";

const store = createPersistedStore<ScreenFilterOptions>("screenFilterOptions", {
  contrastEnabled: false,
  contrastLevel: 0.3,
  onionSkinEnabled: false,
  onionSkinPrevColor: "#0000ff",
  onionSkinNextColor: "#ff6a00",
  onionSkinOpacity: 0.3,
  onionSkinSteps: 1,
});

const useScreenFilterOptions = () => {
  const [settings, setSetting] = useStore(store);

  return {
    ...settings,
    setValue<T extends keyof ScreenFilterOptions>(
      key: T,
      value: ScreenFilterOptions[T],
    ) {
      setSetting((prev) => ({ ...prev, [key]: value }));
    },
  };
};

export default useScreenFilterOptions;
