/**
 * src/hooks/useDebounce.ts
 * Debounce utilities for bodim.lk to prevent excessive URL/state updates.
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Debounces a value. Useful for delaying state updates until a user stops typing/sliding.
 * * @example
 * const debouncedSearchTerm = useDebounce(searchTerm, 400);
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Set a timer to update the debounced value after the specified delay
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Clean up the timeout if the value changes before the delay passes
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Debounces a callback function.
 * * @example
 * const handleSliderChange = useDebouncedCallback((val) => updateUrl(val), 400);
 */
export function useDebouncedCallback<T extends (...args: Parameters<T>) => ReturnType<T>>(
    callback: T,
    delay: number
): (...args: Parameters<T>) => void {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    return useCallback(
        (...args: Parameters<T>) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                callbackRef.current(...args);
            }, delay);
        },
        [delay]
    );
}