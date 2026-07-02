import type { ParsedGif } from '$lib/types';
import parseGif from '$lib/utils/parseGif';
import { get, writable } from 'svelte/store';

export const gif = writable<ParsedGif | null>(null);

export async function loadGifFromFile(file: File) {
  const buffer = await file.arrayBuffer();
  gif.set(parseGif(file.name, buffer));
}

export function unloadGif() {
  gif.set(null);
}

window.addEventListener('beforeunload', (e) => {
  if (!get(gif)) return;
  e.preventDefault();
});
