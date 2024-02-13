import React from 'react';

export function useControlledState<T, C = T>(
    value: Exclude<T, undefined>,
    defaultValue: Exclude<T, undefined> | undefined,
    onChange?: (v: C, ...args: any[]) => void,
): [T, (value: C) => void];
export function useControlledState<T, C = T>(
    value: Exclude<T, undefined> | undefined,
    defaultValue: Exclude<T, undefined>,
    onChange?: (v: C, ...args: any[]) => void,
): [T, (value: C) => void];
export function useControlledState<T, C extends T = T>(
    value: T,
    defaultValue: T,
    onUpdate?: (value: C, ...args: any[]) => void,
) {
    const [innerValue, setInnerValue] = React.useState(defaultValue);

    const [wasControlled] = React.useState(value !== undefined);
    const isControlled = value !== undefined;
    if (wasControlled !== isControlled) {
        console.warn(
            `WARN: A component changed from ${wasControlled ? 'controlled' : 'uncontrolled'} to ${
                isControlled ? 'controlled' : 'uncontrolled'
            }.`,
        );
    }

    const currentValueRef = React.useRef(isControlled ? value : defaultValue);
    React.useEffect(() => {
        currentValueRef.current = value;
    }, [value]);

    const setState = React.useCallback(
        (newValue: C, ...args: any[]) => {
            if (!Object.is(currentValueRef.current, newValue)) {
                onUpdate?.(newValue, ...args);
            }
            if (!isControlled) {
                currentValueRef.current = newValue;
                setInnerValue(newValue);
            }
        },
        [isControlled, onUpdate],
    );

    return [isControlled ? value : innerValue, setState] as const;
}
