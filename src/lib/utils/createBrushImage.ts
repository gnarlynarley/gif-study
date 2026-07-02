import createCanvas from './createCanvas';

export default function createBrushImage(size: number) {
  const [canvas, context] = createCanvas(size, size);

  context.beginPath();
  context.arc(size * 0.5, size * 0.5, size * 0.5, 0, Math.PI * 2);
  context.fill();

  const base64 = canvas.toDataURL();

  return base64;
}
