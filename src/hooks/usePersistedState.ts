import { useSyncExternalStore, useCallback, useRef } from "react";

/**
 * Hook that persists state to localStorage using useSyncExternalStore
 * @param key - The localStorage key to use
 * @param defaultValue - The default value if no value exists in localStorage
 * @returns A tuple of [value, setValue] similar to useState
 */
export function usePersistedState<T>(
  key: string,
  defaultValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  // Cache the last snapshot to prevent infinite loops
  // Store both the serialized string and the parsed value
  const snapshotCacheRef = useRef<{
    serialized: string | null;
    value: T;
  } | null>(null);

  // Subscribe function that listens to storage events
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (typeof window === "undefined") {
        // No-op unsubscribe for SSR
        return () => {
          // SSR: no cleanup needed
        };
      }

      // Listen to native 'storage' event (fires for cross-tab updates)
      window.addEventListener("storage", onStoreChange);

      // Listen to custom event for same-tab updates
      // Native 'storage' event only fires for changes from other tabs/windows
      const customEventName = `persisted-state-change-${key}`;
      window.addEventListener(customEventName, onStoreChange);

      // Return unsubscribe function
      return () => {
        window.removeEventListener("storage", onStoreChange);
        window.removeEventListener(customEventName, onStoreChange);
      };
    },
    [key],
  );

  // Get snapshot from localStorage with caching to prevent infinite loops
  const getSnapshot = useCallback((): T => {
    if (typeof window === "undefined" || !key) {
      return defaultValue;
    }

    try {
      const item = localStorage.getItem(key);

      // Check if the serialized value has changed
      if (snapshotCacheRef.current?.serialized === item) {
        // Return cached value if serialized string hasn't changed
        return snapshotCacheRef.current.value;
      }

      // Parse new value
      let parsedValue: T;
      if (item !== null) {
        parsedValue = JSON.parse(item) as T;
      } else {
        parsedValue = defaultValue;
      }

      // Update cache
      snapshotCacheRef.current = {
        serialized: item,
        value: parsedValue,
      };

      return parsedValue;
    } catch {
      // If parsing fails, return defaultValue and cache it
      const defaultSerialized = JSON.stringify(defaultValue);
      snapshotCacheRef.current = {
        serialized: defaultSerialized,
        value: defaultValue,
      };
      return defaultValue;
    }
  }, [key, defaultValue]);

  // Get server snapshot (for SSR compatibility)
  const getServerSnapshot = useCallback((): T => {
    return defaultValue;
  }, [defaultValue]);

  // Use useSyncExternalStore to subscribe to storage changes
  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Set value handler that updates localStorage and dispatches custom event
  const setValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      if (typeof window === "undefined" || !key) {
        return;
      }

      // Get current value to compute next value
      const currentValue = getSnapshot();
      const next =
        typeof newValue === "function"
          ? (newValue as (prev: T) => T)(currentValue)
          : newValue;

      try {
        if (next === null || next === undefined) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, JSON.stringify(next));
        }

        // Dispatch custom event for same-tab updates
        // Native 'storage' event only fires for cross-tab changes
        const customEventName = `persisted-state-change-${key}`;
        window.dispatchEvent(new Event(customEventName));
      } catch {
        // Silently fail - localStorage update failed
      }
    },
    [key, getSnapshot],
  );

  return [value, setValue];
}
