const CHANNEL_THRESHOLD = 10; // 0-255, per-channel diff before a pixel counts as "different"
const DIFF_PIXEL_THRESHOLD = 0.02; // fraction of pixels allowed to differ before "not similar"
const IGNORE_TRANSPARENT_RGB = true; // skip RGB compare when both pixels are fully transparent

export default function imageDataEquals(a: ImageData, b: ImageData): boolean {
  if (a.width !== b.width || a.height !== b.height) return false;

  const dataA = a.data;
  const dataB = b.data;
  const totalPixels = a.width * a.height;
  const maxDiffPixels = Math.floor(totalPixels * DIFF_PIXEL_THRESHOLD);
  let diffCount = 0;

  for (let i = 0; i < dataA.length; i += 4) {
    const aA = dataA[i + 3];
    const aB = dataB[i + 3];

    if (IGNORE_TRANSPARENT_RGB && aA === 0 && aB === 0) continue;

    const rDiff = Math.abs(dataA[i] - dataB[i]);
    const gDiff = Math.abs(dataA[i + 1] - dataB[i + 1]);
    const bDiff = Math.abs(dataA[i + 2] - dataB[i + 2]);
    const alphaDiff = Math.abs(aA - aB);

    if (
      rDiff > CHANNEL_THRESHOLD ||
      gDiff > CHANNEL_THRESHOLD ||
      bDiff > CHANNEL_THRESHOLD ||
      alphaDiff > CHANNEL_THRESHOLD
    ) {
      diffCount++;
      if (diffCount > maxDiffPixels) return false;
    }
  }

  return true;
}
