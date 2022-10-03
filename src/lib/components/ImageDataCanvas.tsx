import React from "react";

type Props = {
  className?: string;
  data: ImageData;
  width?: number;
  height?: number;
};

export function ImageDataCanvas({ data, className, width, height }: Props) {
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
  }, [data, width, height]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      width={width ?? data.width}
      height={height ?? data.height}
    />
  );
}
