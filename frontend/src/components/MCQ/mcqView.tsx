import { Stage, Layer, Group, Rect, Text } from 'react-konva';
import { useMcqModel } from './mcqModel';

// Display only: gets everything it needs from useMcqModel. No useState,
// useEffect, or service calls belong here; add them to the model instead.
// Everything is drawn with Konva on one fixed-size canvas, so the component
// can be dropped anywhere on a page.

const WIDTH = 360;
const HEIGHT = 300;
const PADDING = 12;
const INNER_WIDTH = WIDTH - PADDING * 2;

const CHOICE_TOP = 92;
const CHOICE_HEIGHT = 36;
const CHOICE_GAP = 8;
const FOOTER_TOP = CHOICE_TOP + 4 * (CHOICE_HEIGHT + CHOICE_GAP);

const LETTERS = ['A', 'B', 'C', 'D'];

const COLORS = {
  border: '#cccccc',
  text: '#222222',
  muted: '#666666',
  choice: { fill: '#f5f5f5', stroke: '#cccccc' },
  checking: { fill: '#e8eefc', stroke: '#5b7bd5' },
  correct: { fill: '#d4edda', stroke: '#28a745' },
  wrong: { fill: '#f8d7da', stroke: '#dc3545' },
};

interface MCQProps {
  chapter: number;
  number: number;
}

// The key gives each question its own fresh state, so switching `chapter` or
// `number` reloads the question and clears any previous answer.
export default function MCQ({ chapter, number }: MCQProps) {
  return <McqCard key={`${chapter}-${number}`} chapter={chapter} number={number} />;
}

function McqCard({ chapter, number }: MCQProps) {
  const { question, loading, error, selected, correct, onChoose, onReset } = useMcqModel(chapter, number);

  function choiceColors(index: number) {
    if (index !== selected) return COLORS.choice;
    if (correct === null) return COLORS.checking;
    return correct ? COLORS.correct : COLORS.wrong;
  }

  return (
    <Stage width={WIDTH} height={HEIGHT}>
      <Layer>
        <Rect
          width={WIDTH}
          height={HEIGHT}
          fill="white"
          stroke={COLORS.border}
          cornerRadius={8}
        />

        <Text
          x={PADDING}
          y={PADDING}
          text={`Chapter ${chapter} · Question ${number}`}
          fontSize={12}
          fill={COLORS.muted}
        />

        {loading && (
          <Text x={PADDING} y={40} text="Loading question..." fontSize={14} fill={COLORS.muted} />
        )}

        {question && (
          <>
            <Text
              x={PADDING}
              y={32}
              width={INNER_WIDTH}
              height={52}
              text={question.content}
              fontSize={16}
              fill={COLORS.text}
              ellipsis
            />

            {question.choices.map((choice, index) => {
              const colors = choiceColors(index);
              // onClick is the mouse, onTap is touch screens.
              const choose = () => onChoose(index);
              return (
                <Group
                  key={index}
                  x={PADDING}
                  y={CHOICE_TOP + index * (CHOICE_HEIGHT + CHOICE_GAP)}
                  onClick={choose}
                  onTap={choose}
                >
                  <Rect
                    name={`choice-${index}`}
                    width={INNER_WIDTH}
                    height={CHOICE_HEIGHT}
                    fill={colors.fill}
                    stroke={colors.stroke}
                    strokeWidth={index === selected ? 2 : 1}
                    cornerRadius={6}
                  />
                  <Text
                    x={10}
                    width={INNER_WIDTH - 20}
                    height={CHOICE_HEIGHT}
                    text={`${LETTERS[index]}. ${choice}`}
                    fontSize={14}
                    fill={COLORS.text}
                    verticalAlign="middle"
                    wrap="none"
                    ellipsis
                  />
                </Group>
              );
            })}
          </>
        )}

        {correct !== null && (
          <>
            <Text
              x={PADDING}
              y={FOOTER_TOP}
              height={28}
              text={correct ? 'Correct!' : 'Incorrect, try again'}
              fontSize={14}
              fontStyle="bold"
              fill={correct ? COLORS.correct.stroke : COLORS.wrong.stroke}
              verticalAlign="middle"
            />

            <Group x={WIDTH - PADDING - 80} y={FOOTER_TOP} onClick={onReset} onTap={onReset}>
              <Rect width={80} height={28} fill="white" stroke={COLORS.border} cornerRadius={6} />
              <Text
                width={80}
                height={28}
                text="Reset"
                fontSize={14}
                fill={COLORS.text}
                align="center"
                verticalAlign="middle"
              />
            </Group>
          </>
        )}

        {error && (
          <Text x={PADDING} y={FOOTER_TOP} height={28} text={error} fontSize={14} fill={COLORS.wrong.stroke} verticalAlign="middle" />
        )}
      </Layer>
    </Stage>
  );
}
