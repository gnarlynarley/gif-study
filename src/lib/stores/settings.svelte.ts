import type { Settings } from "$lib/types.svelte";
import { writable } from "svelte/store";

export const settings = writable<Settings>({
  keybinds: {
    togglePlaying: "f",
    brush: "b",
    eraser: "e",
    nextFrame: "d",
    prevFrame: "a",
    increaseBrushSize: "w",
    decreaseBrushSize: "s",
    panning: "space",
  },
});
