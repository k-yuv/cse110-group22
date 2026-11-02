import type { CSSProperties } from 'react';
import { Group, Image, Layer, Line, Rect, Stage, Text } from 'react-konva';
import { useAiMinigameModel } from './aiMinigameModel';
import {
  AI_LABEL,
  ANSWER_LAYOUT,
  BACK_BUTTON_LAYOUT,
  BACK_TO_DESK_LABEL,
  BUBBLE_LAYOUT,
  COLORS,
  FRAME_LAYOUT,
  JOURNAL_LABEL,
  JOURNAL_LAYOUT,
  NOT_AI_LABEL,
  PAGE_TITLE,
  PROGRESS_LABEL,
  PROGRESS_LAYOUT,
  QUESTION_TEXT,
} from './aiMinigameContent';

const FONT = 'Arial, sans-serif';

const CURRENT_IMAGE = 1;
const TOTAL_IMAGES = 5;

const visuallyHidden: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
};

function scribblePoints(x1: number, x2: number, y: number, wave: number) {
  const steps = 6;
  const points: number[] = [];
  for (let i = 0; i <= steps; i += 1) {
    points.push(x1 + ((x2 - x1) * i) / steps, y + (i % 2 === 0 ? -wave : wave));
  }
  return points;
}

function Journal({ x, y, width }: { x: number; y: number; width: number }) {
  const height = width * 0.77;
  const border = width * 0.04;
  const noteSize = width * 0.21;
  const wave = width * 0.012;
  const lineWidth = width * 0.006;

  return (
    <Group x={x} y={y} rotation={JOURNAL_LAYOUT.rotation}>
      <Rect
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        fill={COLORS.journalCover}
        cornerRadius={border}
      />
      <Rect
        x={-width / 2 + border}
        y={-height / 2 + border}
        width={width - border * 2}
        height={height - border * 2}
        fill={COLORS.journalPages}
      />
      <Line
        points={[0, -height / 2 + border + width * 0.1, 0, height / 2 - border]}
        stroke={COLORS.journalSpine}
        strokeWidth={lineWidth}
      />
      {[-0.17, -0.09].map((row) => (
        <Line
          key={row}
          points={scribblePoints(-width * 0.38, -width * 0.1, width * row, wave)}
          stroke={COLORS.journalScribble}
          strokeWidth={lineWidth}
          tension={0.5}
          lineCap="round"
        />
      ))}

      <Group x={width * 0.34} y={-width * 0.28} rotation={10}>
        <Rect
          x={-noteSize / 2}
          y={-noteSize / 2}
          width={noteSize}
          height={noteSize}
          fill={COLORS.journalNote}
        />
        <Text
          text={JOURNAL_LABEL}
          x={-noteSize / 2}
          y={-noteSize / 2}
          width={noteSize}
          height={noteSize}
          align="center"
          verticalAlign="middle"
          fontFamily={FONT}
          fontStyle="bold"
          fontSize={width * 0.045}
          fill={COLORS.journalNoteText}
        />
      </Group>
    </Group>
  );
}

export default function AiMinigame() {
  const { width, height, sizeUnit, place, currentImage, imageElement, onBackToDesk } = useAiMinigameModel();

  const frame = place(FRAME_LAYOUT.frame);
  const imageArea = place(FRAME_LAYOUT.image);
  const imageScale = imageElement
    ? Math.min(imageArea.width / imageElement.width, imageArea.height / imageElement.height)
    : 0;
  const imageWidth = imageElement ? imageElement.width * imageScale : 0;
  const imageHeight = imageElement ? imageElement.height * imageScale : 0;

  const progressText = `${CURRENT_IMAGE}/${TOTAL_IMAGES}`;
  const progress = place(PROGRESS_LAYOUT.box);
  const bubble = place(BUBBLE_LAYOUT.box);
  const bubbleStroke = BUBBLE_LAYOUT.strokeWidth * sizeUnit;
  const back = place(BACK_BUTTON_LAYOUT);

  const backButtonStyle: CSSProperties = {
    position: 'absolute',
    left: back.x,
    top: back.y,
    width: back.width,
    height: back.height,
    borderRadius: '50%',
    border: 'none',
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: COLORS.backButton,
    cursor: 'pointer',
    zIndex: 1,
  };
  const arrowSize = back.width * 0.4;

  function answerButtonStyle(layout: typeof ANSWER_LAYOUT.ai, background: string): CSSProperties {
    const box = place(layout);
    return {
      position: 'absolute',
      left: box.x,
      top: box.y,
      width: box.width,
      height: box.height,
      border: 'none',
      borderRadius: ANSWER_LAYOUT.cornerRadius * sizeUnit,
      background,
      color: COLORS.answerText,
      fontFamily: FONT,
      fontSize: ANSWER_LAYOUT.fontSize * sizeUnit,
      fontWeight: 'bold',
      cursor: 'pointer',
      zIndex: 1,
    };
  }

  return (
    <main style={{ position: 'fixed', inset: 0, background: COLORS.desk }}>
      <h1 style={visuallyHidden}>{PAGE_TITLE}</h1>
      <p style={visuallyHidden}>{QUESTION_TEXT}</p>
      <p style={visuallyHidden}>
        {PROGRESS_LABEL} {progressText}
      </p>
      {currentImage && (
        <p style={visuallyHidden} role="img" aria-label={currentImage.alt} />
      )}

      <Stage width={width} height={height}>
        <Layer>
          <Rect width={width} height={height} fill={COLORS.desk} />

          <Journal
            x={JOURNAL_LAYOUT.x * width}
            y={JOURNAL_LAYOUT.y * height}
            width={JOURNAL_LAYOUT.width * sizeUnit}
          />

          <Group x={progress.x} y={progress.y}>
            <Rect width={progress.width} height={progress.height} fill={COLORS.progressBox} />
            <Text
              text={`${PROGRESS_LABEL}\n${progressText}`}
              width={progress.width}
              height={progress.height}
              align="center"
              verticalAlign="middle"
              lineHeight={1.2}
              fontFamily={FONT}
              fontSize={PROGRESS_LAYOUT.fontSize * sizeUnit}
              fill={COLORS.progressText}
            />
          </Group>

          <Rect x={frame.x} y={frame.y} width={frame.width} height={frame.height} fill={COLORS.frame} />
          {imageElement && (
            <Image
              image={imageElement}
              x={imageArea.x + (imageArea.width - imageWidth) / 2}
              y={imageArea.y + (imageArea.height - imageHeight) / 2}
              width={imageWidth}
              height={imageHeight}
            />
          )}

          <Group x={bubble.x} y={bubble.y}>
            <Rect
              width={bubble.width}
              height={bubble.height}
              fill={COLORS.bubble}
              stroke={COLORS.bubbleOutline}
              strokeWidth={bubbleStroke}
              cornerRadius={BUBBLE_LAYOUT.cornerRadius * sizeUnit}
            />
            <Text
              text={QUESTION_TEXT}
              x={bubbleStroke * 2}
              width={bubble.width - bubbleStroke * 4}
              height={bubble.height}
              align="center"
              verticalAlign="middle"
              lineHeight={1.2}
              fontFamily={FONT}
              fontSize={BUBBLE_LAYOUT.fontSize * sizeUnit}
              fill={COLORS.bubbleText}
            />
          </Group>
        </Layer>
      </Stage>

      {/* TODO: record the answer and move to the next image in the logic step. */}
      <button type="button" style={answerButtonStyle(ANSWER_LAYOUT.ai, COLORS.aiButton)}>
        {AI_LABEL}
      </button>
      <button type="button" style={answerButtonStyle(ANSWER_LAYOUT.notAi, COLORS.notAiButton)}>
        {NOT_AI_LABEL}
      </button>

      <button type="button" aria-label={BACK_TO_DESK_LABEL} onClick={onBackToDesk} style={backButtonStyle}>
        <svg
          width={arrowSize}
          height={arrowSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke={COLORS.backButtonArrow}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="20" y1="12" x2="4" y2="12" />
          <polyline points="10,6 4,12 10,18" />
        </svg>
      </button>
    </main>
  );
}
