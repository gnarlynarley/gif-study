import type { ParsedGif } from '$lib/models';
import parseGif from '$lib/utils/parseGif';

class Gif {
  parsed = $state<ParsedGif | null>(null);

  setFile = async (file: File) => {
    const buffer = await file.arrayBuffer();
    this.parsed = parseGif(buffer);
  };

  clear = () => {
    this.parsed = null;
  };
}

export const gif = new Gif();

window.addEventListener('beforeunload', (e) => {
  if (!gif.parsed) return;
  e.preventDefault();
});
