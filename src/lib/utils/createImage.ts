export function createImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = document.createElement("img");
    image.onload = () => {
      resolve(image);
    };
    image.onerror = () => {
      reject(new Error("Something went wrong loading the image"));
    };
    image.src = src;
  });
}
