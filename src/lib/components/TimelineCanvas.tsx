import React from "react";
import MovableCanvasRenderer, { Tools } from "../MovableCanvasRenderer";
import TimelinePlayback from "../TimelinePlayback";
import { IconButton } from "./IconButton";
import {
  BrushIcon,
  EraserIcon,
  PanIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "./Icons";
import $ from "./TimelineCanvas.module.scss";
import useScreenFilterOptions from "../hooks/useScreenFilterOptions";
import Panel from "./Panel";
import { cx } from "../utils/joinClassNames";
import useKeyboard from "../hooks/useKeyboard";

type Props = {
  timelinePlayback: TimelinePlayback;
};

const ZOOM_AMOUNT = 0.2;

export function TimelineCanvas({ timelinePlayback }: Props) {
  const screenFilterOptions = useScreenFilterOptions();
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const movableCanvasRendererRef = React.useRef<MovableCanvasRenderer | null>(
    null,
  );

  const [tool, _setTool] = React.useState(Tools.Pan);
  const setTool = (nextTool: Tools) => {
    movableCanvasRendererRef.current?.setTool(nextTool);
  };

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const instance = new MovableCanvasRenderer({
      timelinePlayback,
      screenFilterOptions,
      canvas,
    });
    instance.events.toolChanged.on(_setTool);
    _setTool(instance.tool);

    movableCanvasRendererRef.current = instance;

    return () => instance.destroy();
  }, [timelinePlayback]);

  React.useEffect(() => {
    movableCanvasRendererRef.current?.setOnionSkinOptions(screenFilterOptions);
  }, [screenFilterOptions]);

  const setZoom = (add: number) => {
    movableCanvasRendererRef.current?.addZoom(add);
  };

  useKeyboard("b", () => setTool(Tools.Brush));
  useKeyboard("e", () => setTool(Tools.Eraser));

  return (
    <div
      className={cx(
        $.container,
        tool === Tools.Brush && $.isBrushTool,
        tool === Tools.Pan && $.isPanTool,
        tool === Tools.Eraser && $.isEraserTool,
      )}
    >
      <div className={$.tools}>
        <Panel>
          <div className={$.toolsInner}>
            <IconButton onClick={() => setZoom(ZOOM_AMOUNT)} label="Zoom in">
              <ZoomInIcon />
            </IconButton>
            <IconButton
              onClick={() => setZoom(ZOOM_AMOUNT * -1)}
              label="Zoom out"
            >
              <ZoomOutIcon />
            </IconButton>
            <IconButton
              primary={tool === Tools.Pan}
              onClick={() => setTool(Tools.Pan)}
              label="Pan tool"
            >
              <PanIcon />
            </IconButton>
            <IconButton
              primary={tool === Tools.Brush}
              onClick={() => setTool(Tools.Brush)}
              label="Brush tool"
            >
              <BrushIcon />
            </IconButton>
            <IconButton
              primary={tool === Tools.Eraser}
              onClick={() => setTool(Tools.Eraser)}
              label="Brush tool"
            >
              <EraserIcon />
            </IconButton>
          </div>
        </Panel>
      </div>
      <canvas ref={canvasRef} className={$.canvas} />
    </div>
  );
}
