import { GifData } from "~src/lib/models";
import { convertGif } from "~src/lib/buzzfeed-gif";

export default async function createGifDatafromBlob(blob: Blob): Promise<GifData> {
  const gif = await convertGif(blob);

  return gif;
}
