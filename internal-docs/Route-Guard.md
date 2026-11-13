# Route Guard

Stops players from reaching locked screens by typing their URL (issue #75). The desk already won't open a locked item when it's clicked; the guard applies the same rules to the URL itself.

## What it does

| Route | Opens when | Guard |
| --- | --- | --- |
| `/create-article` | Interviews is done | `<RouteGuard screen="createArticle">` |
| `/social-media` (placeholder) | Online Articles is done | `<RouteGuard screen="social">` |
| `/interview` (placeholder) | Social Media is done | `<RouteGuard screen="interviews">` |
| `/ending/good`, `/ending/bad` | The player just submitted an article | `<RouteGuard screen="ending">` |

Everything else (title, desk, Online Articles, minigames, 404) is open to everyone.

A locked route redirects to `/desk` with `replace`, so the Back button doesn't return to it. While progress is loading the guard renders nothing, so a locked screen never flashes. If progress fails to load, the screen counts as locked.

## Where the code lives

```
components/Route-Guard/
├── routeGuardModel.tsx  ← useRouteGuardModel(screen): returns { status } (loading, unlocked or locked)
└── routeGuardView.tsx   ← RouteGuard: renders nothing, redirects, or shows the screen
```

The unlock rules aren't duplicated: `useRouteGuardModel` calls `isScreenLocked` in `Desk/deskRules.ts`, which is built on the same `getDeskState` the desk uses.

### Endings

Nothing in saved progress records that an article was submitted, so `ArticleWritingPage` in `App.tsx` navigates to the ending with router state `{ articleSubmitted: true }`. A typed URL has no state and gets redirected. `BrowserRouter` stores state in the browser history, so reloading an ending still works.

### Placeholder screens

Social Media and Interviews aren't built yet, so `Social-Media/socialMediaView.tsx` and `Interview/interviewView.tsx` render `Placeholder-Activity`: a title and a **Finish (placeholder)** button that marks the activity done and returns to the desk. That lets you play through the whole unlock order by hand. When the real screen is built, replace the placeholder's body and keep the `<RouteGuard>` wrapper in `App.tsx`. Delete `Placeholder-Activity/` once nothing uses it.

## Adding a new locked screen

Wrap its `<Route>` element in `App.tsx`:

```tsx
<Route
  path={ROUTES.socialMedia}
  element={
    <RouteGuard screen="social">
      <SocialMedia />
    </RouteGuard>
  }
/>
```

If the screen needs a new kind of unlock rule, add it to `deskRules.ts` so the desk and the guard stay in sync.

## Known gap

Players can still skip ahead by editing the `progress` key in localStorage. Fixing that means moving progress to the backend, which needs a login system.

## Tests

- `Route-Guard/tests/routeGuard.test.tsx`: each guarded screen with empty, partial and full progress; nothing shown while loading; locked when loading fails; no redirect if the player already left; endings redirect on a direct visit and open after submitting.
- `Route-Guard/tests/routeGuardApp.test.tsx` (integration): with the real `App`, a new player typing any locked URL lands on `/desk`; finishing Social Media unlocks `/interview`; once the story is done, Create Article opens.
- `Placeholder-Activity/tests/placeholderActivity.test.tsx`: Finish saves progress and returns to the desk, or shows an error if saving fails.
- `Article-Writing/tests/articleWritingFlow.test.tsx` now completes the story activities first, since Create Article is guarded.
