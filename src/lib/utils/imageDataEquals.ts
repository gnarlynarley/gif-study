export default function imageDataEquals(
  a: ImageData,
  b: ImageData,
  {
    channelTolerance = 3,
    maxDiffPixelsRatio = 0,
  }: { channelTolerance?: number; maxDiffPixelsRatio?: number } = {},
): boolean {
  if (a.width !== b.width || a.height !== b.height) return false;

  const aData = a.data;
  const bData = b.data;
  const totalPixels = a.width * a.height;
  const maxDiffPixels = Math.floor(totalPixels * maxDiffPixelsRatio);
  let diffPixels = 0;

  for (let i = 0; i < aData.length; i += 4) {
    const dr = Math.abs(aData[i] - bData[i]);
    const dg = Math.abs(aData[i + 1] - bData[i + 1]);
    const db = Math.abs(aData[i + 2] - bData[i + 2]);
    const da = Math.abs(aData[i + 3] - bData[i + 3]);

    if (
      dr > channelTolerance ||
      dg > channelTolerance ||
      db > channelTolerance ||
      da > channelTolerance
    ) {
      diffPixels++;
      if (diffPixels > maxDiffPixels) return false;
    }
  }

  return true;
}
