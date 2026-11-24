import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useHoverModel } from '../hoverModel';

describe('useHoverModel', () => {
  it('starts neither hovered nor focused', () => {
    const { result } = renderHook(() => useHoverModel());

    expect(result.current.hovered).toBe(false);
    expect(result.current.focused).toBe(false);
  });

  it('tracks the mouse entering and leaving', () => {
    const { result } = renderHook(() => useHoverModel());

    act(() => result.current.handlers.onMouseEnter());
    expect(result.current.hovered).toBe(true);

    act(() => result.current.handlers.onMouseLeave());
    expect(result.current.hovered).toBe(false);
  });

  it('tracks focus separately from hover', () => {
    const { result } = renderHook(() => useHoverModel());

    act(() => result.current.handlers.onFocus());
    expect(result.current.focused).toBe(true);
    expect(result.current.hovered).toBe(false);

    act(() => result.current.handlers.onBlur());
    expect(result.current.focused).toBe(false);
  });
});
