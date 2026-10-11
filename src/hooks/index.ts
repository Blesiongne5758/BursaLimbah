/**
 * BursaLimbah.com - Custom Hooks
 * Reusable hooks for the application
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useStore, useFeatureGate } from '../store';
import { MOCK_LISTINGS, MOCK_TRANSACTIONS } from '../data';
import type { Listing, WasteCategory, MembershipTier } from '../types';

/**
 * Hook untuk debouncing input
 * Berguna untuk search input agar tidak trigger filter setiap keystroke
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook untuk filtered listings dengan memoization
 * Performa optimal untuk filtering besar
 */
export function useFilteredListings(
  searchQuery: string,
  selectedCategory: WasteCategory | 'ALL',
  sortBy: 'newest' | 'price_low' | 'price_high'
) {
  const debouncedSearch = useDebounce(searchQuery, 300);

  const filteredListings = useMemo(() => {
    let results = MOCK_LISTINGS;

    // Filter by category
    if (selectedCategory !== 'ALL') {
      results = results.filter(l => l.category === selectedCategory);
    }

    // Filter by search query
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      results = results.filter(l =>
        l.title.toLowerCase().includes(query) ||
        l.city.toLowerCase().includes(query) ||
        l.description.toLowerCase().includes(query)
      );
    }

    // Sort
    const sorted = [...results];
    if (sortBy === 'price_low') {
      sorted.sort((a, b) => (a.pricePerKg || 0) - (b.pricePerKg || 0));
    } else if (sortBy === 'price_high') {
      sorted.sort((a, b) => (b.pricePerKg || 0) - (a.pricePerKg || 0));
    }

    return sorted;
  }, [debouncedSearch, selectedCategory, sortBy]);

  return { filteredListings, total: filteredListings.length };
}

/**
 * Hook untuk local storage persistence
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}

/**
 * Hook untuk intersection observer (lazy loading)
 */
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options?: IntersectionObserverInit
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [ref, options]);

  return isIntersecting;
}

/**
 * Hook untuk media query
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

/**
 * Hook untuk clipboard copy
 */
export function useCopyToClipboard(): [boolean, (text: string) => Promise<void>] {
  const [copied, setCopied] = useState(false);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return [copied, copy];
}

/**
 * Hook untuk countdown timer
 */
export function useCountdown(targetDate: Date | string) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0,
  });

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const difference = target - now;

      if (difference <= 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

/**
 * Hook untuk previous value tracking
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

/**
 * Hook untuk click outside detection
 */
export function useClickOutside(
  ref: React.RefObject<HTMLElement>,
  handler: () => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

/**
 * Hook untuk keyboard shortcuts
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  modifiers: { ctrl?: boolean; shift?: boolean; alt?: boolean } = {}
) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() === key.toLowerCase() &&
        (!modifiers.ctrl || event.ctrlKey || event.metaKey) &&
        (!modifiers.shift || event.shiftKey) &&
        (!modifiers.alt || event.altKey)
      ) {
        event.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback, modifiers]);
}

/**
 * Hook untuk analytics tracking (simulasi)
 */
export function useAnalytics() {
  const track = useCallback((event: string, data?: Record<string, unknown>) => {
    if (typeof window !== 'undefined') {
      console.log('[Analytics]', event, data);
      // In production: send to GA4/Segment/etc
    }
  }, []);

  const page = useCallback((name: string, properties?: Record<string, unknown>) => {
    if (typeof window !== 'undefined') {
      console.log('[Analytics Page]', name, properties);
    }
  }, []);

  return { track, page };
}

/**
 * Re-export useFeatureGate for convenience
 */
export { useFeatureGate };
