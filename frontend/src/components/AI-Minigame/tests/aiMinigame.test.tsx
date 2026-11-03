import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import AiMinigame from '../aiMinigameView';
import { ROUTES } from '../../../routes';
import { checkAiAnswers, getAiImages, type AiImage, type AiResult } from '../../../services/aiImage';
import { getProgress } from '../../../services/progress';
import {
  AI_LABEL,
  BACK_TO_DESK_LABEL,
  NOT_AI_LABEL,
  PLAY_AGAIN_LABEL,
  PROGRESS_LABEL,
  QUESTION_TEXT,
  RETURN_TO_DESK_LABEL,
  resultText,
} from '../aiMinigameContent';

vi.mock('react-konva', () => ({
  Stage: () => null,
  Layer: () => null,
  Rect: () => null,
  Text: () => null,
  Group: () => null,
  Image: () => null,
  Line: () => null,
}));

vi.mock('../../../services/aiImage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../services/aiImage')>();
  return { ...actual, checkAiAnswers: vi.fn(actual.checkAiAnswers) };
});

let holdImageLoads = false;
let pendingImages: FakeImage[] = [];

class FakeImage {
  onload: (() => void) | null = null;
  width = 400;
  height = 400;

  set src(_value: string) {
    if (holdImageLoads) pendingImages.push(this);
    else queueMicrotask(() => this.onload?.());
  }
}

function loadPendingImages() {
  act(() => {
    pendingImages.forEach((image) => image.onload?.());
    pendingImages = [];
  });
}

const CORRECT_ANSWERS = [true, false, true, false, true];
const WRONG_ANSWERS = CORRECT_ANSWERS.map((isAi) => !isAi);

let IMAGES: AiImage[];

function CurrentPath() {
  return <p data-testid="path">{useLocation().pathname}</p>;
}

function renderGame() {
  const user = userEvent.setup();
  render(
    <MemoryRouter initialEntries={[ROUTES.aiImage]}>
      <Routes>
        <Route path={ROUTES.aiImage} element={<AiMinigame />} />
        <Route path={ROUTES.desk} element={<p>Desk</p>} />
      </Routes>
      <CurrentPath />
    </MemoryRouter>
  );
  return user;
}

function progressText(imageNumber: number) {
  return `${PROGRESS_LABEL} ${imageNumber}/${IMAGES.length}`;
}

async function expectImage(imageNumber: number) {
  const image = IMAGES[imageNumber - 1];
  expect(await screen.findByRole('img', { name: image.alt })).toBeInTheDocument();
  expect(screen.getByText(progressText(imageNumber))).toBeInTheDocument();
}

async function answerAll(user: ReturnType<typeof userEvent.setup>, answers: boolean[]) {
  for (const [index, isAi] of answers.entries()) {
    await expectImage(index + 1);
    await user.click(screen.getByRole('button', { name: isAi ? AI_LABEL : NOT_AI_LABEL }));
  }
}

function answerButtons() {
  return [
    screen.getByRole('button', { name: AI_LABEL }),
    screen.getByRole('button', { name: NOT_AI_LABEL }),
  ];
}

describe('AI minigame', () => {
  beforeEach(async () => {
    localStorage.clear();
    holdImageLoads = false;
    pendingImages = [];
    vi.stubGlobal('Image', FakeImage);
    IMAGES = await getAiImages();
  });

  describe('playing', () => {
    it('opens on the first image with the question and progress', async () => {
      renderGame();

      await expectImage(1);
      expect(screen.getByText(QUESTION_TEXT)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: AI_LABEL })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: NOT_AI_LABEL })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: PLAY_AGAIN_LABEL })).not.toBeInTheDocument();
    });

    it('moves to the next image after answering AI', async () => {
      const user = renderGame();
      await expectImage(1);

      await user.click(screen.getByRole('button', { name: AI_LABEL }));

      await expectImage(2);
      expect(screen.queryByRole('img', { name: IMAGES[0].alt })).not.toBeInTheDocument();
    });

    it('moves to the next image after answering Not AI', async () => {
      const user = renderGame();
      await expectImage(1);

      await user.click(screen.getByRole('button', { name: NOT_AI_LABEL }));

      await expectImage(2);
    });

    it('shows every image in order, updating the progress each time', async () => {
      const user = renderGame();

      for (let imageNumber = 1; imageNumber <= IMAGES.length; imageNumber += 1) {
        await expectImage(imageNumber);
        if (imageNumber < IMAGES.length) {
          await user.click(screen.getByRole('button', { name: AI_LABEL }));
        }
      }
    });
  });

  describe('results', () => {
    it('shows a perfect score when every answer is right', async () => {
      const user = renderGame();
      await expectImage(1);

      await answerAll(user, CORRECT_ANSWERS);

      expect(await screen.findByText(resultText(IMAGES.length, IMAGES.length))).toBeInTheDocument();
    });

    it('shows zero when every answer is wrong', async () => {
      const user = renderGame();
      await expectImage(1);

      await answerAll(user, WRONG_ANSWERS);

      expect(await screen.findByText(resultText(0, IMAGES.length))).toBeInTheDocument();
    });

    it('counts a mix of right and wrong answers', async () => {
      const user = renderGame();
      await expectImage(1);

      await answerAll(user, [true, true, true, true, true]);

      expect(await screen.findByText(resultText(3, IMAGES.length))).toBeInTheDocument();
    });

    it('swaps the image and answer buttons for Play again and Return to desk', async () => {
      const user = renderGame();
      await expectImage(1);

      await answerAll(user, CORRECT_ANSWERS);

      expect(await screen.findByRole('button', { name: PLAY_AGAIN_LABEL })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: RETURN_TO_DESK_LABEL })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: AI_LABEL })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: NOT_AI_LABEL })).not.toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
      expect(screen.queryByText(QUESTION_TEXT)).not.toBeInTheDocument();
    });

    it('does not mark the minigame as done on the desk', async () => {
      const user = renderGame();
      await expectImage(1);

      await answerAll(user, CORRECT_ANSWERS);
      await screen.findByRole('button', { name: PLAY_AGAIN_LABEL });

      expect(await getProgress()).toEqual([]);
    });
  });

  describe('play again', () => {
    it('goes back to the first image with the question and answer buttons', async () => {
      const user = renderGame();
      await expectImage(1);
      await answerAll(user, CORRECT_ANSWERS);

      await user.click(await screen.findByRole('button', { name: PLAY_AGAIN_LABEL }));

      await expectImage(1);
      expect(screen.getByText(QUESTION_TEXT)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: AI_LABEL })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: PLAY_AGAIN_LABEL })).not.toBeInTheDocument();
      expect(screen.queryByText(resultText(IMAGES.length, IMAGES.length))).not.toBeInTheDocument();
    });

    it('resets the score so the next game is scored on its own', async () => {
      const user = renderGame();
      await expectImage(1);
      await answerAll(user, CORRECT_ANSWERS);
      expect(await screen.findByText(resultText(IMAGES.length, IMAGES.length))).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: PLAY_AGAIN_LABEL }));
      await expectImage(1);
      await answerAll(user, WRONG_ANSWERS);

      expect(await screen.findByText(resultText(0, IMAGES.length))).toBeInTheDocument();
    });

    it('forgets the answers from the last game', async () => {
      const user = renderGame();
      await expectImage(1);
      await answerAll(user, WRONG_ANSWERS);
      expect(await screen.findByText(resultText(0, IMAGES.length))).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: PLAY_AGAIN_LABEL }));
      await expectImage(1);
      await answerAll(user, CORRECT_ANSWERS);

      expect(await screen.findByText(resultText(IMAGES.length, IMAGES.length))).toBeInTheDocument();
    });
  });

  describe('leaving', () => {
    it('Return to desk goes to the desk', async () => {
      const user = renderGame();
      await expectImage(1);
      await answerAll(user, CORRECT_ANSWERS);

      await user.click(await screen.findByRole('button', { name: RETURN_TO_DESK_LABEL }));

      expect(screen.getByTestId('path').textContent).toBe(ROUTES.desk);
      expect(screen.getByText('Desk')).toBeInTheDocument();
    });

    it('the back arrow goes to the desk in the middle of a game', async () => {
      const user = renderGame();
      await expectImage(1);
      await user.click(screen.getByRole('button', { name: AI_LABEL }));
      await expectImage(2);

      await user.click(screen.getByRole('button', { name: BACK_TO_DESK_LABEL }));

      expect(screen.getByTestId('path').textContent).toBe(ROUTES.desk);
      expect(screen.getByText('Desk')).toBeInTheDocument();
    });

    it('the back arrow also goes to the desk from the results', async () => {
      const user = renderGame();
      await expectImage(1);
      await answerAll(user, CORRECT_ANSWERS);
      await screen.findByRole('button', { name: PLAY_AGAIN_LABEL });

      await user.click(screen.getByRole('button', { name: BACK_TO_DESK_LABEL }));

      expect(screen.getByTestId('path').textContent).toBe(ROUTES.desk);
    });
  });

  describe('locking the answer buttons', () => {
    it('locks AI and Not AI until the first image has loaded', async () => {
      holdImageLoads = true;
      const user = renderGame();

      const [aiButton, notAiButton] = answerButtons();
      expect(aiButton).toBeDisabled();
      expect(notAiButton).toBeDisabled();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();

      await user.click(aiButton);
      await user.click(notAiButton);
      await act(async () => {});
      loadPendingImages();

      await expectImage(1);
      expect(aiButton).toBeEnabled();
      expect(notAiButton).toBeEnabled();
    });

    it('locks AI and Not AI while the next image loads', async () => {
      holdImageLoads = true;
      const user = renderGame();
      await act(async () => {});
      loadPendingImages();
      await expectImage(1);

      await user.click(screen.getByRole('button', { name: AI_LABEL }));

      expect(screen.getByText(progressText(2))).toBeInTheDocument();
      expect(screen.queryByRole('img')).not.toBeInTheDocument();
      answerButtons().forEach((button) => expect(button).toBeDisabled());

      await user.click(screen.getByRole('button', { name: NOT_AI_LABEL }));
      loadPendingImages();

      // The click while loading didn't skip image 2.
      await expectImage(2);
      answerButtons().forEach((button) => expect(button).toBeEnabled());
    });

    it('locks AI and Not AI while the answers are scored, and only scores them once', async () => {
      let finishScoring!: (result: AiResult) => void;
      vi.mocked(checkAiAnswers).mockReturnValueOnce(
        new Promise((resolve) => {
          finishScoring = resolve;
        })
      );
      const user = renderGame();
      await answerAll(user, CORRECT_ANSWERS);

      const [aiButton, notAiButton] = answerButtons();
      expect(aiButton).toBeDisabled();
      expect(notAiButton).toBeDisabled();

      await user.click(aiButton);
      await user.click(notAiButton);
      expect(checkAiAnswers).toHaveBeenCalledTimes(1);

      await act(async () => finishScoring({ correct: 4, total: IMAGES.length }));

      expect(await screen.findByText(resultText(4, IMAGES.length))).toBeInTheDocument();
    });
  });
});
