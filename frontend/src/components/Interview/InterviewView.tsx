import { Group, Layer, Line, Rect, Stage, Text } from 'react-konva';
import { useEffect, useRef } from 'react';
import type Konva from 'konva';
import { COLORS } from '../../theme';
import { URLImage } from '../URLImage/URLImage';
import cat from '../../assets/ceo_cat.png';
import SettingsButton from '../SettingsButton/SettingsButton';
import TitleButton from '../TitleScreen/titleButton';
import { useInterviewModel } from './interviewScreenModel';
import Journal from '../Journal/journalView';
import BackButton from '../Back-Button/backButtonView';
import BackConfirmation from '../Back-Confirmation/backConfirmationView';

const WIDTH = 1280;
const HEIGHT = 832;
const DESK_Y = 622;
const ACTIVITY_NAME = 'the interview';

function PromptBox({ text, y }: { text: string; y: number }) {
  return (
    <>
      <Rect
        x={700}
        y={y}
        width={500}
        height={120}
        fill="#b0a295"
        stroke="#4C2100"
        strokeWidth={8}
        cornerRadius={40}
      />
      <Text
        x={700}
        y={y + 10}
        width={480}
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

function SpeechBubble({ text, y }: { text: string; y: number }) {
  const groupRef = useRef<Konva.Group>(null);

  useEffect(() => {
    groupRef.current?.to({
      opacity: 1,
      y: 0,
      duration: 0.3,
    });
  }, []);

  return (
    <Group ref={groupRef} y={-20} opacity={0}>
      <Line
        points={[710, y + 55, 675, y + 78, 710, y + 88]}
        closed
        fill="#F7FCFD"
        lineJoin="round"
        stroke="#d1cce7"
        strokeWidth={4}
      />
      <Rect
        x={700}
        y={y}
        width={500}
        height={100}
        fill="#F7FCFD"
        stroke="#d1cce7"
        strokeWidth={4}
        cornerRadius={40}
      />
      <Text
        x={720}
        y={y}
        width={460}
        height={100}
        text={text}
        align="center"
        verticalAlign="middle"
        fontSize={32}
        fontFamily="Coiny"
        fill="#4C2100"
      />
    </Group>
  );
}

function AdvicePopup() {
  const popupRef = useRef<Konva.Group>(null);

  useEffect(() => {
    popupRef.current?.to({
      opacity: 1,
      y: 0,
      duration: 0.25,
    });
  }, []);

  return (
    <Group ref={popupRef} y={15} opacity={0}>
      <Rect
        x={700}
        y={430}
        width={500}
        height={80}
        fill="#fff2a8"
        stroke="#d39b35"
        strokeWidth={4}
        cornerRadius={24}
      />
      <Text
        x={720}
        y={430}
        width={460}
        height={80}
        text="Choose your follow-up wisely! You can only ask one."
        align="center"
        verticalAlign="middle"
        fontSize={24}
        fontFamily="Coiny"
        fill="#4C2100"
      />
    </Group>
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
    onBack,
    backConfirmation,
  } = useInterviewModel();
  const catRef = useRef<Konva.Group>(null);
  const questionId = question?.id;
  const choiceId = choice?.id;
  const scale = Math.min(windowWidth / WIDTH, windowHeight / HEIGHT);
  const left = (windowWidth - WIDTH * scale) / 2;
  const top = (windowHeight - HEIGHT * scale) / 2;
  const deskTop = top + DESK_Y * scale;

  useEffect(() => {
    if ((!questionId && !choiceId) || !catRef.current) return;

    const bounceUp = catRef.current.to({
      y: 90,
      duration: 0.12,
      onFinish: () => {
        catRef.current?.to({ y: 100, duration: 0.12 });
      },
    });

    return () => bounceUp.destroy();
  }, [choiceId, questionId]);

  return (
    <main
      style={{
        position: 'fixed',
        inset: 0,
        background: `linear-gradient(${COLORS.wall} ${deskTop}px, ${COLORS.desk} ${deskTop}px)`,
        overflow: 'hidden',
      }}
    >
      <Journal placement="corner" />
      <BackButton onClick={onBack} style={{ left: 22, top: 90 }} />
      <BackConfirmation activityName={ACTIVITY_NAME} {...backConfirmation} />
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
            <Group ref={catRef} x={200} y={100}>
              <URLImage src={cat} x={0} y={0} width={480} height={648} />
            </Group>

            {!complete && !question && (
              <>
                <PromptBox text="Let's interview the CEO of Big Drug Inc! Select a question to ask." y={80} />
                {questions.map((item, index) => (
                  <TitleButton
                    key={item.id}
                    text={item.label}
                    x={700}
                    y={220 + index * 96}
                    width={500}
                    height={80}
                    fontSize={24}
                    onClick={() => onSelectQuestion(item.id)}
                  />
                ))}
              </>
            )}

            {question && (
              <>
                <SpeechBubble text={question.answer} y={80} />
                {question.id === 'q1' && !choice && <AdvicePopup />}
                {!choice && question.choices.map((item, index) => (
                  <TitleButton
                    key={item.id}
                    text={item.label}
                    x={700}
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
                      x={700}
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
                    x={700}
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
                x={700}
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
