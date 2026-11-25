import { useRef } from 'react';
import { Group, Layer, Line, Rect, Stage } from 'react-konva';
import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useDeskCleanupModel } from './deskCleanupModel';
import { needsScrubbing, type ToolId } from './deskCleanupRules';
import {
  ACTIVITY_NAME,
  CONTINUE_LABEL,
  HINT_TEXT,
  MESSAGE_SECONDS,
  MESSES,
  POINTER_TIP_SIZE,
  PUT_BACK_SIZE,
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
import Celebration from './parts/Celebration';
import SettingsButton from '../SettingsButton/SettingsButton';
import HintButton from '../HintButton/HintButton';
import BackButton from '../Back-Button/backButtonView';
import BackConfirmation from '../Back-Confirmation/backConfirmationView';

type Point = { x: number; y: number };

// The same look as News Article's buttons (and the letter's "Put away").
const BUTTON_STYLE = {
  padding: '14px 48px',
  border: 'none',
  borderRadius: 10,
  background: COLORS.journalButton,
  color: COLORS.journalText,
  fontFamily: FONT,
  fontSize: 22,
  cursor: 'pointer',
};
type Box = { x: number; y: number; width: number; height: number };

// A mess's image file, or its Konva drawing, filling its box.
function MessArt({ mess, box }: { mess: DeskMess; box: Box }) {
  if (typeof mess.image === 'string') return <URLImage src={mess.image} {...box} />;

  const Drawing = mess.image;
  return (
    <Group x={box.x} y={box.y}>
      <Drawing width={box.width} height={box.height} />
    </Group>
  );
}

// The desk cleaning minigame: the player picks up tools from the bar at the
// bottom and uses each one on the messes it cleans. Display only: which tool
// is held and how dirty each mess is come from useDeskCleanupModel.
export default function DeskCleanup() {
  const {
    width,
    height,
    placements,
    heldTool,
    dirtiness,
    isClean,
    message,
    error,
    onToolClick,
    onMessClick,
    onScrub,
    onContinue,
    onBack,
    backConfirmation,
  } = useDeskCleanupModel();

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

  // The held tool sits centered on the pointer, unless it has a corner
  // pointer: then its top left corner (the arrow's tip) is on the pointer.
  const heldArt = held && fitTool(held);
  const heldOffset =
    heldArt && held.cornerPointer ? { x: -heldArt.x, y: -heldArt.y } : { x: -toolSize / 2, y: -toolSize / 2 };
  // An arrow pointing up and left, with its tip at 0, 0.
  const tip = POINTER_TIP_SIZE * toolSize;
  const arrowPoints = [0, 0, tip, tip * 0.45, tip * 0.45, tip];
  const putBackSize = PUT_BACK_SIZE * toolSize;

  return (
    <main style={{ position: 'fixed', inset: 0, background: COLORS.desk }}>
      {error && <p role="alert">{error}</p>}

      {/* On top of the canvas, but clicks pass through it. Gone once the
          desk is clean, since there's nothing left to do. */}
      {!isClean && (
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
      )}

      <Stage width={width} height={height} onPointerMove={handlePointerMove}>
        <Layer>
          {/* Messes. A stain's dirtiness is how visible it is. Stains are
              scrubbed, and everything else is cleaned with one click. Each
              is drawn centered on its spot, so it turns around its middle. */}
          {MESSES.map((mess) => {
            const { x, y, rotation } = placements[mess.id];
            const box = place({ ...mess, x, y });
            const centered = { ...box, x: -box.width / 2, y: -box.height / 2 };
            return (
              <FadeGroup key={mess.id} opacity={dirtiness[mess.id]}>
                <Group x={x * width} y={y * height} rotation={rotation}>
                  {needsScrubbing(mess) ? (
                    <Group onPointerMove={(event) => handleStainMove(event, mess, box.width)}>
                      <MessArt mess={mess} box={centered} />
                    </Group>
                  ) : (
                    <Group onClick={() => onMessClick(mess)} onTap={() => onMessClick(mess)}>
                      <MessArt mess={mess} box={centered} />
                    </Group>
                  )}
                </Group>
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

              {/* While a corner pointer tool is held, an invisible square
                  around its slot's top left corner also puts it back, so
                  lining the tool up over its slot and clicking works. */}
              {heldTool === tool.id && tool.cornerPointer && (
                <Rect
                  x={fitTool(tool).x - putBackSize / 2}
                  y={fitTool(tool).y - putBackSize / 2}
                  width={putBackSize}
                  height={putBackSize}
                  fill="transparent"
                />
              )}
            </Group>
          ))}

          {/* The held tool, drawn last so it's on top. It ignores clicks, so
              they reach whatever is under the pointer. */}
          <Group ref={heldToolRef} visible={held !== undefined} listening={false}>
            {heldArt && (
              <Group {...heldOffset}>
                <URLImage {...heldArt} />
                {held.cornerPointer && (
                  <Line
                    x={heldArt.x}
                    y={heldArt.y}
                    points={arrowPoints}
                    closed
                    fill={COLORS.pointerTip}
                    stroke={COLORS.pointerTipOutline}
                    strokeWidth={tip * 0.12}
                    lineJoin="round"
                  />
                )}
              </Group>
            )}
          </Group>
        </Layer>

        {/* Plays once, as soon as the last mess is cleaned. */}
        {isClean && <Celebration width={width} height={height} />}
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
              // 50% bigger than normal text.
              fontSize: 24,
              animation: `desk-cleanup-fade ${MESSAGE_SECONDS}s forwards`,
            }}
          >
            {message}
          </p>
        )}
        <button type="button" onClick={onContinue} style={BUTTON_STYLE}>
          {CONTINUE_LABEL}
        </button>
      </div>

      {/* Down the top left, like News Article: settings, the hint, then Back. */}
      <SettingsButton />
      <HintButton hint={HINT_TEXT} />
      <BackButton onClick={onBack} style={{ left: 22, top: 162 }} />
      <BackConfirmation activityName={ACTIVITY_NAME} {...backConfirmation} />
    </main>
  );
}
