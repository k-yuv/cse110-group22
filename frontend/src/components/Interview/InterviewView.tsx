import { Layer, Rect, Stage, Text } from 'react-konva';
import { COLORS } from '../../theme';
import { URLImage } from '../URLImage/URLImage';
import cat from '../../assets/whistleblower_cat.png';
import SettingsButton from '../SettingsButton/SettingsButton';
import TitleButton from '../TitleScreen/titleButton';
import { useInterviewModel } from './interviewScreenModel';

const WIDTH = 1280;
const HEIGHT = 832;
const DESK_Y = 522;

function SpeechBubble({ text, y }: { text: string; y: number }) {
  return (
    <>
      <Rect
        x={600}
        y={y}
        width={500}
        height={100}
        fill="#b0a295"
        stroke="#4C2100"
        strokeWidth={8}
        cornerRadius={40}
      />
      <Text
        x={600}
        y={y}
        width={500}
        height={100}
        text={text}
        align="center"
        verticalAlign="middle"
        fontSize={32}
        fontFamily="Coiny"
        fill="#4C2100"
      />
    </>
  );
}

export default function Interview() {
  const {
    questions,
    question,
    choice,
    complete,
    windowWidth,
    windowHeight,
    error,
    onSelectQuestion,
    onSelectChoice,
    onAddToJournal,
    onFinishInterview,
  } = useInterviewModel();
  const scale = Math.min(windowWidth / WIDTH, windowHeight / HEIGHT);
  const left = (windowWidth - WIDTH * scale) / 2;
  const top = (windowHeight - HEIGHT * scale) / 2;

  return (
    <main style={{ position: 'fixed', inset: 0, background: COLORS.wall, overflow: 'hidden' }}>
      <SettingsButton />
      {error && <p role="alert">{error}</p>}
      <section
        style={{
          position: 'absolute',
          left,
          top,
          width: WIDTH,
          height: HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <Stage width={WIDTH} height={HEIGHT}>
          <Layer>
            <Rect width={WIDTH} height={DESK_Y} fill={COLORS.wall} />
            <Rect y={DESK_Y} width={WIDTH} height={HEIGHT - DESK_Y} fill={COLORS.desk} />
            <URLImage src={cat} x={200} y={100} width={480} height={648} />

            {!complete && !question && (
              <>
                <SpeechBubble text="Select a question to ask" y={80} />
                {questions.map((item, index) => (
                  <TitleButton
                    key={item.id}
                    text={item.label}
                    x={600}
                    y={210 + index * 90}
                    width={500}
                    height={70}
                    fontSize={30}
                    onClick={() => onSelectQuestion(item.id)}
                  />
                ))}
              </>
            )}

            {question && (
              <>
                <SpeechBubble text={question.answer} y={80} />
                {!choice && question.choices.map((item, index) => (
                  <TitleButton
                    key={item.id}
                    text={item.label}
                    x={600}
                    y={210 + index * 90}
                    width={500}
                    height={70}
                    fontSize={30}
                    onClick={() => onSelectChoice(item.id)}
                  />
                ))}
                {choice && (
                  <>
                    <SpeechBubble text={choice.answer} y={210} />
                    <TitleButton
                      text="Add to Journal"
                      x={600}
                      y={340}
                      width={500}
                      height={70}
                      fontSize={30}
                      onClick={onAddToJournal}
                    />
                  </>
                )}
                {!choice && question.choices.length === 0 && (
                  <TitleButton
                    text="Add to Journal"
                    x={600}
                    y={210}
                    width={500}
                    height={70}
                    fontSize={30}
                    onClick={onAddToJournal}
                  />
                )}
              </>
            )}

            {complete && (
              <TitleButton
                text="Finish Interview"
                x={600}
                y={210}
                width={500}
                height={80}
                fontSize={34}
                onClick={onFinishInterview}
              />
            )}
          </Layer>
        </Stage>
      </section>
    </main>
  );
}
