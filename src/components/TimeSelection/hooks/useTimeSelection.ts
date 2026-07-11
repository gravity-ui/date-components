import React from 'react';

import {dateTime} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';

import type {TimeSelectionView, TimeSelectionWheel} from '../TimeSelection.types';

interface UseTimeSelectionProps {
    defaultValue?: DateTime;
    value?: DateTime;
    readOnly?: boolean;
    disabled?: boolean;
    timeZone?: string;
    ampm?: boolean;
    views: TimeSelectionView[];
    focusedView?: TimeSelectionView;
    onUpdate?: (value: DateTime) => void;
    onFocusViewUpdate?: (value: TimeSelectionView) => void;
}

const getInitialValue = (
    defaultValue?: DateTime,
    controlledValue?: DateTime,
    timeZone?: string,
): DateTime => {
    const initial = defaultValue || controlledValue || dateTime();
    return timeZone ? initial.timeZone(timeZone, true) : initial;
};

export const useTimeSelection = ({
    defaultValue,
    value: controlledValue,
    readOnly,
    disabled,
    timeZone,
    ampm,
    views,
    focusedView: controlledFocusedView,
    onUpdate,
    onFocusViewUpdate,
}: UseTimeSelectionProps) => {
    const [internalValue, setInternalValue] = React.useState<DateTime>(() =>
        getInitialValue(defaultValue, controlledValue, timeZone),
    );

    const [activeWheel, setActiveWheel] = React.useState<TimeSelectionWheel>(
        controlledFocusedView || views[0] || 'hours',
    );

    const currentValue = controlledValue !== undefined ? controlledValue : internalValue;

    const order: TimeSelectionWheel[] = ampm ? [...views, 'ampm'] : views;

    const updateValue = React.useCallback(
        (prev: DateTime, key: TimeSelectionWheel, val: string): DateTime => {
            let updated = prev;

            switch (key) {
                case 'hours':
                    updated = updated.set('hour', Number(val));
                    break;
                case 'minutes':
                    updated = updated.set('minute', Number(val));
                    break;
                case 'seconds':
                    updated = updated.set('second', Number(val));
                    break;
                case 'ampm': {
                    const isPM = val === 'PM';
                    const hour = updated.hour();
                    if (isPM && hour < 12) {
                        updated = updated.set('hour', hour + 12);
                    } else if (!isPM && hour >= 12) {
                        updated = updated.set('hour', hour - 12);
                    }
                    break;
                }
            }

            if (timeZone) {
                updated = updated.timeZone(timeZone, true);
            }

            return updated;
        },
        [timeZone],
    );

    const handleChange = React.useCallback(
        (key: TimeSelectionWheel, val: string) => {
            if (readOnly || disabled) return;

            if (controlledValue === undefined) {
                setInternalValue((prev) => {
                    const updated = updateValue(prev, key, val);
                    onUpdate?.(updated);
                    return updated;
                });
            } else {
                const updated = updateValue(currentValue, key, val);
                onUpdate?.(updated);
            }
        },
        [readOnly, disabled, controlledValue, currentValue, updateValue, onUpdate],
    );

    const handleActivate = React.useCallback(
        (key: TimeSelectionWheel) => {
            if (controlledFocusedView === undefined) {
                setActiveWheel(key);
            }
            if (key !== 'ampm') {
                onFocusViewUpdate?.(key);
            }
        },
        [controlledFocusedView, onFocusViewUpdate],
    );

    const getCurrentValue = React.useCallback(
        (key: TimeSelectionWheel): string => {
            if (key === 'hours') {
                const hour = currentValue.hour();
                return String(ampm ? hour % 12 || 12 : hour).padStart(2, '0');
            } else if (key === 'minutes') {
                return String(currentValue.minute()).padStart(2, '0');
            } else if (key === 'seconds') {
                return String(currentValue.second()).padStart(2, '0');
            } else if (key === 'ampm') {
                return currentValue.hour() >= 12 ? 'PM' : 'AM';
            }
            return '00';
        },
        [currentValue, ampm],
    );

    const handleKeyDown = React.useCallback(
        (e: KeyboardEvent) => {
            if (readOnly || disabled) return;

            const idx = order.indexOf(activeWheel);

            if (e.key === 'ArrowRight') {
                e.preventDefault();
                const nextWheel = order[(idx + 1) % order.length];
                handleActivate(nextWheel);
            } else if (e.key === 'ArrowLeft') {
                e.preventDefault();
                const prevWheel = order[(idx - 1 + order.length) % order.length];
                handleActivate(prevWheel);
            }
        },
        [activeWheel, order, readOnly, disabled, handleActivate],
    );

    React.useEffect(() => {
        if (controlledValue && controlledValue !== internalValue) {
            setInternalValue(controlledValue);
        }
    }, [controlledValue, internalValue]);

    React.useEffect(() => {
        if (controlledFocusedView !== undefined) {
            setActiveWheel(controlledFocusedView);
        }
    }, [controlledFocusedView]);

    React.useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    return {
        currentValue,
        activeWheel,
        order,
        handleChange,
        handleActivate,
        getCurrentValue,
    };
};
