import React from "react";

type Props = {
  data: ImageData;
};

export function ImageDataCanvas({ data }: Props) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const contextRef = React.useRef<CanvasRenderingContext2D | null>(null);

  React.useEffect(() => {
    contextRef.current = canvasRef.current?.getContext("2d") ?? null;
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.putImageData(data, 0, 0);
    }
  }, [data]);

  return <canvas ref={canvasRef} width={data.width} height={data.height} />;
}
