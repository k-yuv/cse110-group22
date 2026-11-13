import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, renderHook } from '@testing-library/react';
import { useBackConfirmationModel } from '../backConfirmationModel';

describe('useBackConfirmationModel', () => {
  it('starts closed', () => {
    const { result } = renderHook(() => useBackConfirmationModel({ onLeave: vi.fn() }));

    expect(result.current.confirmation.isOpen).toBe(false);
  });

  it('back opens the confirmation instead of leaving', () => {
    const onLeave = vi.fn();
    const { result } = renderHook(() => useBackConfirmationModel({ onLeave }));

    act(() => result.current.onBack());

    expect(result.current.confirmation.isOpen).toBe(true);
    expect(onLeave).not.toHaveBeenCalled();
  });

  it('Go Back closes it and leaves', () => {
    const onLeave = vi.fn();
    const { result } = renderHook(() => useBackConfirmationModel({ onLeave }));

    act(() => result.current.onBack());
    act(() => result.current.confirmation.onGoBack());

    expect(result.current.confirmation.isOpen).toBe(false);
    expect(onLeave).toHaveBeenCalledOnce();
  });

  it('Stay closes it without leaving', () => {
    const onLeave = vi.fn();
    const { result } = renderHook(() => useBackConfirmationModel({ onLeave }));

    act(() => result.current.onBack());
    act(() => result.current.confirmation.onStay());

    expect(result.current.confirmation.isOpen).toBe(false);
    expect(onLeave).not.toHaveBeenCalled();
  });

  it('leaves straight away when there is no progress to lose', () => {
    const onLeave = vi.fn();
    const { result } = renderHook(() => useBackConfirmationModel({ onLeave, hasProgressToLose: false }));

    act(() => result.current.onBack());

    expect(result.current.confirmation.isOpen).toBe(false);
    expect(onLeave).toHaveBeenCalledOnce();
  });

  it('Escape is the same as Stay', () => {
    const onLeave = vi.fn();
    const { result } = renderHook(() => useBackConfirmationModel({ onLeave }));

    act(() => result.current.onBack());
    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });

    expect(result.current.confirmation.isOpen).toBe(false);
    expect(onLeave).not.toHaveBeenCalled();
  });

  it('ignores other keys', () => {
    const { result } = renderHook(() => useBackConfirmationModel({ onLeave: vi.fn() }));

    act(() => result.current.onBack());
    act(() => {
      fireEvent.keyDown(document, { key: 'w' });
    });

    expect(result.current.confirmation.isOpen).toBe(true);
  });

  it('stops listening for Escape once closed or unmounted', () => {
    const removeListener = vi.spyOn(document, 'removeEventListener');
    const { result, unmount } = renderHook(() => useBackConfirmationModel({ onLeave: vi.fn() }));

    act(() => result.current.onBack());
    act(() => result.current.confirmation.onStay());
    expect(removeListener).toHaveBeenCalledWith('keydown', expect.any(Function));

    removeListener.mockClear();
    act(() => result.current.onBack());
    unmount();
    expect(removeListener).toHaveBeenCalledWith('keydown', expect.any(Function));

    removeListener.mockRestore();
  });
});
