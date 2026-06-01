import {
  useState,
  useCallback,
  type Dispatch,
  type SetStateAction,
} from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T)
): [T, Dispatch<SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        try {
          return JSON.parse(item) as T;
        } catch (err) {
          console.error(`Error parsing key "${key}" from localStorage:`, err);
          return typeof initialValue === 'function'
            ? (initialValue as () => T)()
            : initialValue;
        }
      }

      return typeof initialValue === 'function'
        ? (initialValue as () => T)()
        : initialValue;
    } catch (error) {
      console.error(`Error reading key "${key}" from localStorage:`, error);
      return typeof initialValue === 'function'
        ? (initialValue as () => T)()
        : initialValue;
    }
  });

  const setValue: Dispatch<SetStateAction<T>> = useCallback(
    (value) => {
      try {
        setStoredValue((prevValue) => {
          const valueToStore =
            value instanceof Function ? value(prevValue) : value;

          try {
            localStorage.setItem(key, JSON.stringify(valueToStore));
          } catch (error) {
            console.error(`Error writing key "${key}" to localStorage:`, error);
          }

          return valueToStore;
        });
      } catch (error) {
        console.error(`Error in setValue wrapper for key "${key}":`, error);
      }
    },
    [key]
  );

  return [storedValue, setValue];
}
