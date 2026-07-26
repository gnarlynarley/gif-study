import { GIFEncoder, quantize, type Format } from "gifenc";
import toArrayBuffer from "../toArrayBuffer";

const GIF_DELAY_UNIT_MS = 10;
const MINIMUM_GIF_DELAY_CENTISECONDS = 2;
const MAX_PALETTE_COLORS = 256;
const FORMAT: Format = "rgba4444";
const USE_SERPENTINE_DITHER = true;
const LUT_BITS_PER_CHANNEL = 5;
const LUT_LEVELS = 1 << LUT_BITS_PER_CHANNEL;
const LUT_SHIFT = 8 - LUT_BITS_PER_CHANNEL;
const TRANSPARENCY_ALPHA_THRESHOLD = 128;
const NO_TRANSPARENT_INDEX = -1;

export type ConvertToGifRequest = {
  width: number;
  height: number;
  delays: number[];
  frameBuffers: (ArrayBuffer | SharedArrayBuffer)[];
};

export type ConvertToGifResponse =
  | { type: "success"; bytes: ArrayBuffer }
  | { type: "error"; message: string }
  | { type: "progress"; progress: number };

function buildGlobalPalette(frameRgbaList: Uint8ClampedArray[]) {
  const totalPixels = frameRgbaList.reduce(
    (sum, rgba) => sum + rgba.length / 4,
    0,
  );
  const sampled = new Uint8ClampedArray(totalPixels * 4);

  let writeOffset = 0;
  for (const rgba of frameRgbaList) {
    sampled.set(rgba, writeOffset);
    writeOffset += rgba.length;
  }

  return quantize(sampled, MAX_PALETTE_COLORS, {
    format: FORMAT,
    oneBitAlpha: true,
  });
}

function findTransparentPaletteIndex(palette: number[][]): number {
  for (let i = 0; i < palette.length; i++) {
    const alpha = palette[i][3] ?? 255;
    if (alpha === 0) return i;
  }
  return NO_TRANSPARENT_INDEX;
}

function findNearestOpaquePaletteIndexBruteForce(
  r: number,
  g: number,
  b: number,
  palette: number[][],
  transparentIndex: number,
): number {
  let bestIndex = 0;
  let bestDistance = Infinity;

  for (let i = 0; i < palette.length; i++) {
    if (i === transparentIndex) continue;

    const [pr, pg, pb] = palette[i];
    const dr = r - pr;
    const dg = g - pg;
    const db = b - pb;
    const distance = dr * dr + dg * dg + db * db;

    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = i;
    }
  }

  return bestIndex;
}

function buildNearestColorLut(
  palette: number[][],
  transparentIndex: number,
): Uint8Array {
  const lut = new Uint8Array(LUT_LEVELS * LUT_LEVELS * LUT_LEVELS);

  for (let ri = 0; ri < LUT_LEVELS; ri++) {
    const r = (ri << LUT_SHIFT) | (1 << (LUT_SHIFT - 1));
    for (let gi = 0; gi < LUT_LEVELS; gi++) {
      const g = (gi << LUT_SHIFT) | (1 << (LUT_SHIFT - 1));
      for (let bi = 0; bi < LUT_LEVELS; bi++) {
        const b = (bi << LUT_SHIFT) | (1 << (LUT_SHIFT - 1));
        const lutIndex =
          (ri << (LUT_BITS_PER_CHANNEL * 2)) |
          (gi << LUT_BITS_PER_CHANNEL) |
          bi;
        lut[lutIndex] = findNearestOpaquePaletteIndexBruteForce(
          r,
          g,
          b,
          palette,
          transparentIndex,
        );
      }
    }
  }

  return lut;
}

function lookupNearestPaletteIndex(
  r: number,
  g: number,
  b: number,
  lut: Uint8Array,
): number {
  const ri = r >> LUT_SHIFT;
  const gi = g >> LUT_SHIFT;
  const bi = b >> LUT_SHIFT;
  const lutIndex =
    (ri << (LUT_BITS_PER_CHANNEL * 2)) | (gi << LUT_BITS_PER_CHANNEL) | bi;
  return lut[lutIndex];
}

function ditherFrameToIndices(
  rgba: Uint8ClampedArray,
  palette: number[][],
  lut: Uint8Array,
  transparentIndex: number,
  width: number,
  height: number,
): Uint8Array {
  const errors = new Float32Array(rgba.length);
  for (let i = 0; i < rgba.length; i++) errors[i] = rgba[i];

  const indices = new Uint8Array(width * height);

  for (let y = 0; y < height; y++) {
    const isReversedRow = USE_SERPENTINE_DITHER && y % 2 === 1;
    const xStart = isReversedRow ? width - 1 : 0;
    const xEnd = isReversedRow ? -1 : width;
    const xStep = isReversedRow ? -1 : 1;

    for (let x = xStart; x !== xEnd; x += xStep) {
      const pixelIndex = y * width + x;
      const channelIndex = pixelIndex * 4;

      const clampedA = Math.min(255, Math.max(0, errors[channelIndex + 3]));

      if (
        transparentIndex !== NO_TRANSPARENT_INDEX &&
        clampedA < TRANSPARENCY_ALPHA_THRESHOLD
      ) {
        indices[pixelIndex] = transparentIndex;
        continue;
      }

      const clampedR = Math.min(255, Math.max(0, errors[channelIndex]));
      const clampedG = Math.min(255, Math.max(0, errors[channelIndex + 1]));
      const clampedB = Math.min(255, Math.max(0, errors[channelIndex + 2]));

      const paletteIndex = lookupNearestPaletteIndex(
        clampedR,
        clampedG,
        clampedB,
        lut,
      );
      indices[pixelIndex] = paletteIndex;

      const [pr, pg, pb] = palette[paletteIndex];
      const errorR = clampedR - pr;
      const errorG = clampedG - pg;
      const errorB = clampedB - pb;

      const forwardX = isReversedRow ? x - 1 : x + 1;
      const neighbors = isReversedRow
        ? [
            [forwardX, y, 7 / 16],
            [x + 1, y + 1, 3 / 16],
            [x, y + 1, 5 / 16],
            [x - 1, y + 1, 1 / 16],
          ]
        : [
            [forwardX, y, 7 / 16],
            [x - 1, y + 1, 3 / 16],
            [x, y + 1, 5 / 16],
            [x + 1, y + 1, 1 / 16],
          ];

      for (const [nx, ny, weight] of neighbors) {
        if (nx < 0 || nx >= width || ny < 0 || ny >= height) continue;
        const neighborChannelIndex = (ny * width + nx) * 4;
        errors[neighborChannelIndex] += errorR * weight;
        errors[neighborChannelIndex + 1] += errorG * weight;
        errors[neighborChannelIndex + 2] += errorB * weight;
      }
    }
  }

  return indices;
}

function convertToGif(request: ConvertToGifRequest) {
  const { width, height, delays, frameBuffers } = request;

  const frameRgbaList = frameBuffers.map(
    (buffer) => new Uint8ClampedArray(buffer),
  );
  const palette = buildGlobalPalette(frameRgbaList);
  const transparentIndex = findTransparentPaletteIndex(palette);
  const lut = buildNearestColorLut(palette, transparentIndex);
  const encoder = GIFEncoder();
  const hasTransparency = transparentIndex !== NO_TRANSPARENT_INDEX;
  const size = frameBuffers.length;
  let count = 0;

  frameRgbaList.forEach((rgba, i) => {
    const indexedPixels = ditherFrameToIndices(
      rgba,
      palette,
      lut,
      transparentIndex,
      width,
      height,
    );
    encoder.writeFrame(indexedPixels, width, height, {
      palette,
      delay: delays[i],
      ...(hasTransparency
        ? { transparent: true, transparentIndex }
        : { transparent: false }),
    });
    count++;

    const response: ConvertToGifResponse = {
      type: "progress",
      progress: count / size,
    };
    self.postMessage(response);
  });

  encoder.finish();
  const bytes = encoder.bytes();

  return toArrayBuffer(bytes);
}

self.onmessage = (event: MessageEvent<ConvertToGifRequest>) => {
  try {
    const bytes = convertToGif(event.data);
    const response: ConvertToGifResponse = { type: "success", bytes };
    self.postMessage(response);
  } catch (error) {
    const response: ConvertToGifResponse = {
      type: "error",
      message: error instanceof Error ? error.message : String(error),
    };
    self.postMessage(response);
  }
};
