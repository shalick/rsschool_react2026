import { useState, useCallback, type Dispatch, type SetStateAction } from 'react';

function getInitialValue<T>(
  key: string,
  initialValue: T | (() => T)
): T {
  if (typeof window === 'undefined') {
    return typeof initialValue === 'function'
      ? (initialValue as () => T)()
      : initialValue;
  }

  try {
    const item = window.localStorage.getItem(key);
    if (item) {
      try {
        return JSON.parse(item) as T;
      } catch (err) {
        console.error(`Error parsing key "${key}" from localStorage:`, err);
      }
    }
  } catch (error) {
    console.error(`Error reading key "${key}" from localStorage:`, error);
  }

  return typeof initialValue === 'function'
    ? (initialValue as () => T)()
    : initialValue;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T)
): [T, Dispatch<SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() =>
    getInitialValue(key, initialValue)
  );

  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (value) => {
      setStoredValue((prevValue) => {
        const valueToStore =
          value instanceof Function ? value(prevValue) : value;

        if (typeof window !== 'undefined') {
          try {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          } catch (error) {
            console.error(`Error writing key "${key}" to localStorage:`, error);
          }
        }

        return valueToStore;
      });
    },
    [key]
  );

  return [storedValue, setValue];
}
