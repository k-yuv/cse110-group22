import { useRef } from 'react';
import { Group, Layer, Rect, Stage } from 'react-konva';
import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useDeskCleanupModel } from './deskCleanupModel';
import { needsScrubbing, type ToolId } from './deskCleanupRules';
import {
  CONTINUE_LABEL,
  MESSAGE_SECONDS,
  MESSES,
  SILHOUETTE_OPACITY,
  TODO_TEXT,
  TOOLS,
  TOOL_BAR,
  TOOL_SIZE,
  type DeskMess,
  type DeskPlacement,
  type DeskTool,
} from './deskCleanupContent';
import { COLORS, FONT } from '../../theme';
import { URLImage } from '../URLImage/URLImage';
import HoverSpotlight from '../Desk/parts/HoverSpotlight';
import FadeGroup from './parts/FadeGroup';
import Silhouette from './parts/Silhouette';

type Point = { x: number; y: number };

// The desk cleaning minigame: the player picks up tools from the bar at the
// bottom and uses each one on the messes it cleans. Display only: which tool
// is held and how dirty each mess is come from useDeskCleanupModel.
export default function DeskCleanup() {
  const { width, height, heldTool, dirtiness, message, error, onToolClick, onMessClick, onScrub, onContinue } =
    useDeskCleanupModel();

  // The tool that follows the mouse while it's held, and where the pointer was
  // last time it moved. Both change on every mouse move, so they're kept out
  // of React state and don't re-render the screen (like the highlighter).
  const heldToolRef = useRef<Konva.Group>(null);
  const lastPointerRef = useRef<Point | null>(null);

  // Konva runs a mess's handlers before the Stage's, so a stain measures the
  // distance from the last position before this one replaces it.
  function handlePointerMove(event: KonvaEventObject<PointerEvent>) {
    const stage = event.target.getStage();
    const pointer = stage?.getPointerPosition();
    if (!stage || !pointer) return;

    heldToolRef.current?.position(pointer);
    lastPointerRef.current = pointer;
    // Runs after HoverSpotlight sets its cursor, so the held tool stays the
    // only cursor on screen.
    if (heldTool) stage.container().style.cursor = 'none';
  }

  // Moving over a stain with the button held down scrubs it, by however far
  // the pointer moved. The model checks that the sponge is held.
  function handleStainMove(event: KonvaEventObject<PointerEvent>, mess: DeskMess, messWidth: number) {
    const pointer = event.target.getStage()?.getPointerPosition();
    const last = lastPointerRef.current;
    const buttonHeld = (event.evt.buttons & 1) === 1;
    if (!pointer || !last || !buttonHeld) return;

    onScrub(mess, Math.hypot(pointer.x - last.x, pointer.y - last.y), messWidth);
  }

  // Putting a tool back brings the normal cursor back.
  function handleToolClick(event: KonvaEventObject<Event>, tool: ToolId) {
    const container = event.target.getStage()?.container();
    if (heldTool === tool && container) container.style.cursor = 'pointer';
    onToolClick(tool);
  }

  // Window fractions to pixels, keeping each image's shape.
  function place({ x, y, size, aspect }: DeskPlacement) {
    const w = size * height;
    const h = w * aspect;
    return { x: x * width - w / 2, y: y * height - h / 2, width: w, height: h };
  }

  // A tool's image, fitted inside a square without stretching it.
  const toolSize = TOOL_SIZE * height;
  function fitTool(tool: DeskTool) {
    const w = toolSize / Math.max(1, tool.aspect);
    const h = w * tool.aspect;
    return { src: tool.image, x: (toolSize - w) / 2, y: (toolSize - h) / 2, width: w, height: h };
  }

  // The tool bar, with one equal slot per tool.
  const bar = {
    x: (TOOL_BAR.x - TOOL_BAR.width / 2) * width,
    y: TOOL_BAR.y * height,
    width: TOOL_BAR.width * width,
    height: TOOL_BAR.height * height,
  };
  const slotWidth = bar.width / TOOLS.length;
  const held = TOOLS.find((tool) => tool.id === heldTool);

  return (
    <main style={{ position: 'fixed', inset: 0, background: COLORS.desk }}>
      {error && <p role="alert">{error}</p>}

      {/* On top of the canvas, but clicks pass through it. */}
      <h1
        style={{
          position: 'absolute',
          top: '2%',
          width: '100%',
          margin: 0,
          textAlign: 'center',
          fontFamily: FONT,
          color: COLORS.folder,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        {TODO_TEXT}
      </h1>

      <Stage width={width} height={height} onPointerMove={handlePointerMove}>
        <Layer>
          {/* Messes. A stain's dirtiness is how visible it is. Stains are
              scrubbed, and everything else is cleaned with one click. */}
          {MESSES.map((mess) => {
            const box = place(mess);
            return (
              <FadeGroup key={mess.id} opacity={dirtiness[mess.id]}>
                {needsScrubbing(mess) ? (
                  <Group onPointerMove={(event) => handleStainMove(event, mess, box.width)}>
                    <URLImage src={mess.image} {...box} />
                  </Group>
                ) : (
                  <Group onClick={() => onMessClick(mess)} onTap={() => onMessClick(mess)}>
                    <URLImage src={mess.image} {...box} />
                  </Group>
                )}
              </FadeGroup>
            );
          })}

          {/* Tool bar. A held tool's slot shows its silhouette, and clicking
              any slot picks that tool up or puts the held one back. */}
          <Rect {...bar} cornerRadius={bar.height * 0.3} fill={COLORS.folder} />
          {TOOLS.map((tool, index) => (
            <Group
              key={tool.id}
              x={bar.x + slotWidth * (index + 0.5) - toolSize / 2}
              y={bar.y + (bar.height - toolSize) / 2}
              onClick={(event) => handleToolClick(event, tool.id)}
              onTap={(event) => handleToolClick(event, tool.id)}
            >
              <HoverSpotlight width={toolSize} height={toolSize}>
                {heldTool === tool.id ? (
                  <Silhouette {...fitTool(tool)} opacity={SILHOUETTE_OPACITY} />
                ) : (
                  <URLImage {...fitTool(tool)} />
                )}
              </HoverSpotlight>
            </Group>
          ))}

          {/* The held tool, drawn last so it's on top and centered on the
              pointer. It ignores clicks, so they reach whatever is under it. */}
          <Group ref={heldToolRef} visible={held !== undefined} listening={false}>
            {held && (
              <Group x={-toolSize / 2} y={-toolSize / 2}>
                <URLImage {...fitTool(held)} />
              </Group>
            )}
          </Group>
        </Layer>
      </Stage>

      {/* Continue and the message are plain HTML, so tests can see them. The
          message stays for most of its time, then fades out before the model
          removes it. */}
      <style>{'@keyframes desk-cleanup-fade { 0%, 70% { opacity: 1; } 100% { opacity: 0; } }'}</style>
      <div style={{ position: 'absolute', right: 16, bottom: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
        {message && (
          <p
            role="status"
            style={{
              margin: 0,
              color: COLORS.folder,
              animation: `desk-cleanup-fade ${MESSAGE_SECONDS}s forwards`,
            }}
          >
            {message}
          </p>
        )}
        <button type="button" onClick={onContinue}>
          {CONTINUE_LABEL}
        </button>
      </div>
    </main>
  );
}
