declare module "gifenc" {
  type Palette = number[][];
  export function GIFEncoder(): {
    writeFrame(
      data: Uint8Array<ArrayBufferLike>,
      width: number,
      height: number,
      { palette: Palette, delay: number, transparent: boolean },
    ): void;
    finish(): void;
    bytes(): Uint8Array;
  };
  export type Format = "rgb655" | "rgba4444";
  export function quantize(
    data: ImageDataArray,
    colorSpace: number,
    options?: { format?: Format; oneBitAlpha?: boolean },
  ): Palette;
  export function applyPalette(
    data: ImageDataArray,
    pallete: Palette,
    format?: Format,
  ): ImageDataArray;
}
