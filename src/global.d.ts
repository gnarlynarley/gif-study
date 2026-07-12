declare module "gifenc" {
  type Palette = {};
  export function GIFEncoder(): {
    writeFrame(
      data: ImageDataArray,
      width: number,
      height: number,
      { palette: Palette, delay: number, transparent: boolean },
    ): void;
    finish(): void;
    bytes(): Uint8Array<number>;
  };
  export function quantize(data: ImageDataArray, colorSpace: number): Palette;
  export function applyPalette(
    data: ImageDataArray,
    pallete: Palette,
  ): ImageDataArray;
}
