import { useState, useEffect } from 'react';

/**
 * A hook that provides a debounced version of a value.
 * Useful for search inputs to prevent excessive API calls or filtering.
 * 
 * @param value The value to debounce
 * @param delay The delay in milliseconds (default: 300ms)
 * @returns The debounced value
 */
function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set a timeout to update the debounced value after the delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout if the value changes again before the delay
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
