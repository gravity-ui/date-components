import React from 'react';

interface HiddenInputProps<T> {
    value: T;
    onReset?: (value: T) => void;
    toStringValue?: (value: T) => string;
    name?: string;
    disabled?: boolean;
    form?: string;
}
export function HiddenInput<T>({
    name,
    value,
    onReset,
    form,
    disabled,
    toStringValue,
}: HiddenInputProps<T>) {
    const ref = useFormResetHandler<T>({initialValue: value, onReset});

    if (!name) {
        return null;
    }

    const v = toStringValue ? toStringValue(value) : `${value ?? ''}`;
    return <input ref={ref} type="hidden" name={name} value={v} disabled={disabled} form={form} />;
}

function useFormResetHandler<T>({
    initialValue,
    onReset,
}: {
    initialValue: T;
    onReset?: (value: T) => void;
}) {
    const [formElement, setFormElement] = React.useState<HTMLFormElement | null>(null);

    const resetValue = React.useRef(initialValue);

    React.useEffect(() => {
        if (!formElement || !onReset) {
            return undefined;
        }

        const handleReset = () => {
            onReset(resetValue.current);
        };

        formElement.addEventListener('reset', handleReset);
        return () => {
            formElement.removeEventListener('reset', handleReset);
        };
    }, [formElement, onReset]);

    const ref = React.useCallback(
        (node: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null) => {
            setFormElement(node?.form ?? null);
        },
        [],
    );

    return ref;
}
