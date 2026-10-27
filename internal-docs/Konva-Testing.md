# Testing Konva Components

**The short version:** our tests can't draw the canvas, so we don't test it. We only test the normal HTML around it: text, buttons, and what changes when you click them.

## Why the canvas can't be tested

Our tests don't run in a real browser. They run in **jsdom**, a fake browser that lives in memory. It knows about HTML elements like `<h1>`, `<p>`, and `<button>`, so tests can find them and click them. But it can't draw anything, and it doesn't support `<canvas>` at all.

Konva draws everything on a `<canvas>`. If a test tries to render a real Konva component, jsdom can't give it a canvas, and the test crashes.

## What we do instead

At the top of the test file, we replace Konva with fake components that render nothing:

```tsx
vi.mock('react-konva', () => ({
  Stage: () => null,
  Layer: () => null,
  Rect: () => null,
}));
```

`vi.mock` means: "in this test file, when the component imports `react-konva`, give it these fakes instead." Each fake returns `null`, which in React means "render nothing." The canvas just disappears from the test, and everything else renders normally.

Add any other Konva components your component uses (like `Text` or `Circle`) to the list the same way.

## What to test

Test the regular HTML parts of the component:

- **Text is on the screen:** headings, labels, values like `Color: tomato`.
- **Buttons work:** click one, then check that the text changed.

Example from [`konva.test.tsx`](../frontend/src/components/Konva-Test/tests/konva.test.tsx):

```tsx
it('toggles the color when the button is clicked', async () => {
  const user = userEvent.setup();
  render(<KonvaTest />);

  await user.click(screen.getByRole('button', { name: 'Toggle color' }));

  expect(screen.getByText('Color: steelblue')).toBeInTheDocument();
});
```

## What not to test

Don't test anything inside the canvas: shapes, colors, positions, or dragging. The tests can't see it.

**Tip:** if something matters and you want to test it, show it as text too. For example, the test component shows `Color: tomato` next to the canvas, so the test can check the color by reading that text.
