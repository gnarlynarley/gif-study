import { GifReader } from "omggif";
import ndarray from "ndarray";

function handleGif(data: Uint8Array) {
  return new Promise<ndarray.NdArray<Uint8Array>>((resolve, reject) => {
    var reader;
    try {
      reader = new GifReader(data);
    } catch (err) {
      reject(err);
      return;
    }
    if (reader.numFrames() > 0) {
      var nshape = [reader.numFrames(), reader.height, reader.width, 4];
      var ndata = new Uint8Array(nshape[0] * nshape[1] * nshape[2] * nshape[3]);
      var result = ndarray(ndata, nshape);
      try {
        for (var i = 0; i < reader.numFrames(); ++i) {
          reader.decodeAndBlitFrameRGBA(
            i,
            ndata.subarray(
              result.index(i, 0, 0, 0),
              result.index(i + 1, 0, 0, 0)
            )
          );
        }
      } catch (err) {
        reject(err);
        return;
      }
      resolve(result.transpose(0, 2, 1));
    } else {
      var nshape = [reader.height, reader.width, 4];
      var ndata = new Uint8Array(nshape[0] * nshape[1] * nshape[2]);
      var result = ndarray(ndata, nshape);
      try {
        reader.decodeAndBlitFrameRGBA(0, ndata);
      } catch (err) {
        reject(err);
        return;
      }
      resolve(result.transpose(1, 0));
    }
  });
}

function fetchData(url: string): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("GET", url, true);
    request.responseType = "arraybuffer";
    if (request.overrideMimeType) {
      request.overrideMimeType("application/binary");
    }
    request.onerror = (err) => {
      reject(err);
    };
    request.onload = () => {
      if (request.readyState !== 4) {
        return;
      }
      var data = new Uint8Array(request.response);
      resolve(data);
      return;
    };
    request.send();
  });
}

function assert<T>(value: T | undefined | null): asserts value is T {
  if (value == null) throw new Error("Value is nullish");
}

export async function parseGif(src: string) {
  const data = await fetchData(src);
  const frameData = await handleGif(data); // shape: [numFrames, width, height, 4]
  const frames: HTMLImageElement[] = [];

  const [numFrames, width, height] = frameData.shape;
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  assert(context);
  canvas.width = width;
  canvas.height = height;
  const imageData = context.getImageData(0, 0, width, height);
  const framePixels = width * height;
  const pixelBuffer = framePixels * 4;

  for (let i = 0; i < numFrames; i += 1) {
    const offset = pixelBuffer * i;

    let drawn = true;
    const part = frameData.data.slice(offset, offset + pixelBuffer);

    part.forEach((value, i) => {
      imageData.data[i] = value;
    });
    if (drawn) {
      context.putImageData(imageData, 0, 0);
      const frame = document.createElement("img");
      frame.src = canvas.toDataURL();
      frames.push(frame);
    }
  }

  return frames;
}
