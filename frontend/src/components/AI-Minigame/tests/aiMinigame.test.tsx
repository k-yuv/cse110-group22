import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import AiMinigame from '../aiMinigameView';
import { ROUTES } from '../../../routes';
import { getAiImages, type AiImage } from '../../../services/aiImage';
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

// jsdom has no <canvas>; see internal-docs/Konva-Testing.md. The page also
// writes its question, progress and image description as hidden HTML, which
// is what these tests read.
vi.mock('react-konva', () => ({
  Stage: () => null,
  Layer: () => null,
  Rect: () => null,
  Text: () => null,
  Group: () => null,
  Image: () => null,
  Line: () => null,
}));

// The right answer for each default image in services/aiImage.ts, in order
// (true = AI). The page never receives these, so the tests list them here.
const CORRECT_ANSWERS = [true, false, true, false, true];
const WRONG_ANSWERS = CORRECT_ANSWERS.map((isAi) => !isAi);

let IMAGES: AiImage[];

// Shows the current URL so tests can check where a button went.
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
  for (const isAi of answers) {
    await user.click(screen.getByRole('button', { name: isAi ? AI_LABEL : NOT_AI_LABEL }));
  }
}

describe('AI minigame', () => {
  beforeEach(async () => {
    localStorage.clear();
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

      // Images 1, 3 and 5 are AI, so answering AI to everything gets 3 right.
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
});
