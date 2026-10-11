/**
 * Unit tests for custom hooks
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce, useLocalStorage, useCopyToClipboard, usePrevious } from '../hooks';

describe('Custom Hooks', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Clear localStorage before each test
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('useDebounce', () => {
    it('should return initial value immediately', () => {
      const { result } = renderHook(() => useDebounce('initial', 300));
      expect(result.current).toBe('initial');
    });

    it('should debounce value changes', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: 'initial' } }
      );

      expect(result.current).toBe('initial');

      // Change value
      rerender({ value: 'changed' });

      // Value should not change immediately
      expect(result.current).toBe('initial');

      // Advance time by 300ms
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Now value should be updated
      expect(result.current).toBe('changed');
    });

    it('should reset timer on rapid changes', () => {
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: 'initial' } }
      );

      // Rapid changes
      rerender({ value: 'change1' });
      act(() => {
        vi.advanceTimersByTime(100);
      });

      rerender({ value: 'change2' });
      act(() => {
        vi.advanceTimersByTime(100);
      });

      rerender({ value: 'change3' });
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Value should still be initial
      expect(result.current).toBe('initial');

      // Advance remaining time
      act(() => {
        vi.advanceTimersByTime(300);
      });

      // Now should be final value
      expect(result.current).toBe('change3');
    });

    it('should handle different delay values', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      );

      rerender({ value: 'changed', delay: 500 });

      act(() => {
        vi.advanceTimersByTime(400);
      });
      expect(result.current).toBe('initial');

      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(result.current).toBe('changed');
    });
  });

  describe('useLocalStorage', () => {
    it('should return initial value when localStorage is empty', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
      expect(result.current[0]).toBe('default');
    });

    it('should read from localStorage if value exists', () => {
      window.localStorage.setItem('test-key', JSON.stringify('stored'));
      const { result } = renderHook(() => useLocalStorage('test-key', 'default'));
      expect(result.current[0]).toBe('stored');
    });

    it('should update localStorage when value changes', () => {
      const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

      act(() => {
        result.current[1]('updated');
      });

      expect(result.current[0]).toBe('updated');
      expect(window.localStorage.getItem('test-key')).toBe(JSON.stringify('updated'));
    });

    it('should handle complex objects', () => {
      const initialObj = { name: 'John', age: 30 };
      const { result } = renderHook(() => useLocalStorage('user', initialObj));

      expect(result.current[0]).toEqual(initialObj);

      const newObj = { name: 'Jane', age: 25 };
      act(() => {
        result.current[1](newObj);
      });

      expect(result.current[0]).toEqual(newObj);
      expect(JSON.parse(window.localStorage.getItem('user') || '')).toEqual(newObj);
    });

    it('should handle arrays', () => {
      const initialArr = [1, 2, 3];
      const { result } = renderHook(() => useLocalStorage('arr', initialArr));

      expect(result.current[0]).toEqual(initialArr);

      const newArr = [4, 5, 6];
      act(() => {
        result.current[1](newArr);
      });

      expect(result.current[0]).toEqual(newArr);
    });

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage to throw error
      const originalSetItem = window.localStorage.setItem;
      window.localStorage.setItem = vi.fn(() => {
        throw new Error('localStorage error');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useLocalStorage('error-key', 'default'));

      // Should not throw
      act(() => {
        result.current[1]('new value');
      });

      // Should log error
      expect(consoleSpy).toHaveBeenCalled();

      // Restore
      window.localStorage.setItem = originalSetItem;
      consoleSpy.mockRestore();
    });
  });

  describe('useCopyToClipboard', () => {
    it('should copy text to clipboard', async () => {
      // Mock clipboard API
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      const { result } = renderHook(() => useCopyToClipboard());

      await act(async () => {
        await result.current[1]('test text');
      });

      expect(writeTextMock).toHaveBeenCalledWith('test text');
      expect(result.current[0]).toBe(true);
    });

    it('should reset copied state after timeout', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      const { result } = renderHook(() => useCopyToClipboard());

      await act(async () => {
        await result.current[1]('test');
      });

      expect(result.current[0]).toBe(true);

      // Advance time by 2 seconds
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current[0]).toBe(false);
    });

    it('should handle clipboard errors', async () => {
      const writeTextMock = vi.fn().mockRejectedValue(new Error('Clipboard error'));
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useCopyToClipboard());

      await act(async () => {
        await result.current[1]('test');
      });

      expect(consoleSpy).toHaveBeenCalled();
      expect(result.current[0]).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe('usePrevious', () => {
    it('should return undefined on first render', () => {
      const { result } = renderHook(() => usePrevious('initial'));
      expect(result.current).toBeUndefined();
    });

    it('should return previous value after update', () => {
      const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
        initialProps: { value: 'first' },
      });

      expect(result.current).toBeUndefined();

      rerender({ value: 'second' });
      expect(result.current).toBe('first');

      rerender({ value: 'third' });
      expect(result.current).toBe('second');
    });

    it('should work with numbers', () => {
      const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
        initialProps: { value: 1 },
      });

      expect(result.current).toBeUndefined();

      rerender({ value: 2 });
      expect(result.current).toBe(1);

      rerender({ value: 3 });
      expect(result.current).toBe(2);
    });

    it('should work with objects', () => {
      const obj1 = { id: 1, name: 'John' };
      const obj2 = { id: 2, name: 'Jane' };

      const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
        initialProps: { value: obj1 },
      });

      expect(result.current).toBeUndefined();

      rerender({ value: obj2 });
      expect(result.current).toEqual(obj1);
    });
  });
});
