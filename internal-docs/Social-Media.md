# Social Media

The Social Media chapter is the second main activity in the story. The player watches an influencer's post about Big Drug Inc. catnip, gathers their thoughts about it, picks one, and then finishes to return to the desk. This doc explains what the screen does, where its code lives, and how it's tested.

## What it does

The chapter is the page at `/social-media`, opened from the **Social Media Posts** folder on the desk once Online Articles is done (see [Desk-View.md](Desk-View.md) and [Route-Guard.md](Route-Guard.md)). It is drawn with Konva and shows:

| Part of the screen | What it is |
| --- | --- |
| Laptop | The post: the app, author, preview and video transcript |
| **Gather Thoughts** / **Clear Mind** | Shows or hides the four thought bubbles |
| Thought bubbles | Two "supporting" and two "questioning" reactions to the post |
| **Finish** | Appears once a thought is picked, and returns to the desk |
| Back button | Asks "Are You Sure?" before leaving (see [Back-Confirmation.md](Back-Confirmation.md)) |

### Picking a thought

1. The player presses **Gather Thoughts** to show the four bubbles.
2. Clicking a bubble picks it, and it keeps glowing. Clicking another bubble switches the pick.
3. Clicking the picked bubble again clears the pick.
4. **Clear Mind** hides the bubbles but keeps the pick.

The posts and thoughts are mock data in `socialMediaContent.tsx`.

### Finishing the chapter

Once a thought is picked, a **Finish** button appears in the bottom right. It hides again if the pick is cleared. Pressing it calls `completeActivity('social')`, which saves progress in browser `localStorage` through `services/progress.ts`. On success, the player goes to `/desk`, where the Social Media Posts folder shows **Done!** and Interviews unlocks.

If saving fails, the player stays on the screen and sees **Could not save social media progress**.

Any thought counts for now. Which one is "right" is meant to come from the backend multiple-choice data later.

### Not built yet

- Grading the picked thought.
- Real posts and thoughts from the backend.
- Adding the picked thought to the Journal as evidence.

## Where the code is

```
frontend/src/components/Social-Media/
├── socialMediaContent.tsx    ← text, colors, layout, and the mock posts and thoughts
├── socialMediaModel.tsx      ← useSocialMediaModel: sizing, the picked thought, and finishing
├── socialMediaSelection.ts   ← picking and un-picking a thought
├── socialMediaView.tsx       ← draws the screen, the Finish button and the error
├── parts/                    ← the laptop, post and thought bubbles
└── tests/
```

## Tests

| Test file | What it checks |
| --- | --- |
| `Social-Media/tests/socialMediaModel.test.tsx` | Keeping only the latest pick, un-picking, keeping the pick through Clear Mind, rejecting unknown thoughts, resetting on a new post, scaling to the window; Finish doing nothing without a pick, saving progress and going to the desk after one, and showing an error if saving fails |
| `Social-Media/tests/socialMediaSelection.test.ts` | Picking and un-picking a thought |
| `Social-Media/tests/socialMediaView.test.tsx` | The picked bubble glowing, switching and clearing the pick, and Finish showing only while a thought is picked |
