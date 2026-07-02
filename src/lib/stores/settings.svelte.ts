import type { Settings } from '$lib/types';
import { writable } from 'svelte/store';

export const settings = writable<Settings>({
  keybinds: {
    togglePlaying: 'space',
    brush: 'b',
    eraser: 'e',
    nextFrame: 'a',
    prevFrame: 'd',
  },
});
