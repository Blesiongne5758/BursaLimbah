/**
 * Performance Optimization Hooks
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';

/**
 * Hook for infinite scrolling
 */
export function useInfiniteScroll(callback: () => void, hasMore: boolean) {
  const [ref, inView] = useInView({
    threshold: 0,
    triggerOnce: false,
  });

  useEffect(() => {
    if (inView && hasMore) {
      callback();
    }
  }, [inView, hasMore, callback]);

  return ref;
}

/**
 * Hook for virtual scrolling
 */
export function useVirtualScroll(itemCount: number, itemHeight: number) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil((containerRef.current?.clientHeight || 0) / itemHeight) + 1,
    itemCount
  );

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  }, []);

  return {
    containerRef,
    startIndex,
    endIndex,
    handleScroll,
    totalHeight: itemCount * itemHeight,
    offset: startIndex * itemHeight,
  };
}

/**
 * Hook for image lazy loading
 */
export function useLazyImage(src: string) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [ref, inView] = useInView({
    threshold: 0,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      setImageSrc(src);
    }
  }, [inView, src]);

  return { ref, imageSrc };
}

/**
 * Hook for debounced callback
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) {
  const timeoutRef = useRef<any>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * Hook for throttled callback
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) {
  const lastCallRef = useRef<number>(0);
  const timeoutRef = useRef<any>();

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallRef.current;

      if (timeSinceLastCall >= delay) {
        callback(...args);
        lastCallRef.current = now;
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          callback(...args);
          lastCallRef.current = Date.now();
        }, delay - timeSinceLastCall);
      }
    },
    [callback, delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
}

/**
 * Hook for measuring render performance
 */
export function useRenderPerformance(componentName: string) {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef<number>(0);

  renderCountRef.current += 1;
  const now = performance.now();
  const renderTime = now - lastRenderTimeRef.current;
  lastRenderTimeRef.current = now;

  if (import.meta.env.DEV) {
    console.log(`[Performance] ${componentName} rendered ${renderCountRef.current} times (${renderTime.toFixed(2)}ms)`);
  }

  return {
    renderCount: renderCountRef.current,
    renderTime,
  };
}

/**
 * Hook for prefetching data
 */
export function usePrefetch<T>(fetcher: () => Promise<T>, enabled: boolean = true) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const prefetchedRef = useRef(false);

  useEffect(() => {
    if (enabled && !prefetchedRef.current) {
      setLoading(true);
      fetcher()
        .then((result) => {
          setData(result);
          prefetchedRef.current = true;
        })
        .catch((err) => {
          console.error('Prefetch error:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [enabled, fetcher]);

  return { data, loading, prefetched: prefetchedRef.current };
}

/**
 * Hook for caching data in memory
 */
export function useCache<T>(key: string, fetcher: () => Promise<T>, ttl: number = 5 * 60 * 1000) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);

  const cacheKey = `cache_${key}`;

  useEffect(() => {
    const cached = sessionStorage.getItem(cacheKey);
    const cachedTime = sessionStorage.getItem(`${cacheKey}_time`);

    if (cached && cachedTime) {
      const age = Date.now() - parseInt(cachedTime);
      if (age < ttl) {
        setData(JSON.parse(cached));
        return;
      }
    }

    setLoading(true);
    fetcher()
      .then((result) => {
        setData(result);
        sessionStorage.setItem(cacheKey, JSON.stringify(result));
        sessionStorage.setItem(`${cacheKey}_time`, Date.now().toString());
      })
      .catch((err) => {
        console.error('Cache fetch error:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [key, fetcher, ttl, cacheKey]);

  const clearCache = useCallback(() => {
    sessionStorage.removeItem(cacheKey);
    sessionStorage.removeItem(`${cacheKey}_time`);
    setData(null);
  }, [cacheKey]);

  return { data, loading, clearCache };
}
