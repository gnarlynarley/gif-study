import pixelmatch from "pixelmatch";

const THRESHOLD = 0.1;
const DIFFERENCE = 0.001;

export function isPixelDataMatch(a: ImageData, b: ImageData) {
  if (a.data.length !== b.data.length) return false;
  const output = new ImageData(a.width, a.height);
  const pixelDiff = pixelmatch(
    a.data,
    b.data,
    output.data,
    output.width,
    output.height,
    { threshold: THRESHOLD },
  );
  const diff = pixelDiff / (output.width * output.height);

  return diff < DIFFERENCE;
}

export default isPixelDataMatch;
