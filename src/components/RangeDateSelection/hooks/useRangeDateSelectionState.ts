import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';
import {useControlledState} from '@gravity-ui/uikit';

import type {RangeValue, ValueBase} from '../../types';
import {SECOND, YEAR} from '../../utils/constants';
import {constrainValue, createPlaceholderValue} from '../../utils/dates';
import {useDefaultTimeZone} from '../../utils/useDefaultTimeZone';
import {alignDateTime} from '../utils/date';

function getViewportIntervalFromDates(
    start: DateTime,
    end: DateTime,
    numberOfIntervals = 4,
    placeInViewport = 0.5,
) {
    const diff = end.diff(start);
    return {
        start: start.subtract(diff * (numberOfIntervals - 1) * placeInViewport),
        end: end.add(diff * (numberOfIntervals - 1) * (1 - placeInViewport)),
    };
}

export interface RangeDateSelectionState {
    viewportInterval: RangeValue<DateTime>;
    value: RangeValue<DateTime>;
    setValue: (value: RangeValue<DateTime>) => void;
    timeZone: string;
    setDraggingValue: (value: RangeValue<DateTime> | null) => void;
    canResize: boolean;
    startDragging: () => void;
    move: (delta: number, options?: {visualMinDuration?: number}) => void;
    scale: (scale: number, options?: {visualMinDuration?: number; fixedPoint?: number}) => void;
    moveStart: (delta: number, options?: {visualMinDuration?: number}) => void;
    moveEnd: (delta: number, options?: {visualMinDuration?: number}) => void;
    endDragging: () => void;
    align: number;
    isDragging: boolean;
}

export interface RangeDateSelectionOptions extends ValueBase<RangeValue<DateTime>> {
    /** The minimum allowed date that a user may select. */
    minValue?: DateTime;
    /** The maximum allowed date that a user may select. */
    maxValue?: DateTime;
    /** Minimum duration of the selection in milliseconds. Defaults to 1 second. */
    minDuration?: number;
    /** Maximum duration of the selection in milliseconds. Defaults to 15 years. */
    maxDuration?: number;
    /** Alignment of the selection in milliseconds. Defaults to 1 second. */
    align?: number;
    /** A placeholder date that controls the default values of each segment when the user first interacts with them. Defaults to today's date at midnight. */
    placeholderValue?: DateTime;
    /**
     * Which timezone use to show values. Example: 'default', 'system', 'Europe/Amsterdam'.
     * @default The timezone of the `value` or `defaultValue` or `placeholderValue`, 'default' otherwise.
     */
    timeZone?: string;
    /**
     * The number of selection intervals that fit into the underlying ruler.
     *
     * @default 4
     */
    numberOfIntervals?: number;
    /**
     * Place of the selection on the underlying ruler.
     * Value must be between 0 and 1, where 0 is the start of the ruler and 1 is the end.
     *
     * @default 0.5 - center of the ruler
     */
    placeOnRuler?: number;
}

export function useRangeDateSelectionState(
    props: RangeDateSelectionOptions,
): RangeDateSelectionState {
    const inputTimeZone = useDefaultTimeZone(
        props.value?.start || props.defaultValue?.start || props.placeholderValue,
    );
    const timeZone = props.timeZone || inputTimeZone;

    const placeholderValue = createPlaceholderValue({
        placeholderValue: props.placeholderValue,
        timeZone,
    });

    const [isDragging, setIsDragging] = React.useState(false);
    const [currentValue, setCurrentValue] = React.useState<RangeValue<DateTime> | null>(null);

    const [value, setValue] = useControlledState(
        props.value,
        props.defaultValue ?? {
            start: placeholderValue.startOf('day').timeZone(inputTimeZone),
            end: placeholderValue.endOf('day').timeZone(inputTimeZone),
        },
        props.onUpdate,
    );

    const setInterval = (newValue: RangeValue<DateTime>) => {
        setCurrentValue(null);
        setValue({
            start: alignDateTime(newValue.start, props.align).timeZone(inputTimeZone),
            end: alignDateTime(newValue.end, props.align).timeZone(inputTimeZone),
        });
    };

    const displayValue = {
        start: value.start.timeZone(timeZone),
        end: value.end.timeZone(timeZone),
    };
    const interval = isDragging ? displayValue : currentValue ?? displayValue;

    const viewportInterval = getViewportIntervalFromDates(
        interval.start,
        interval.end,
        props.numberOfIntervals,
        props.placeOnRuler,
    );

    const minValue = props.minValue?.isAfter(viewportInterval.start)
        ? props.minValue
        : viewportInterval.start;
    const maxValue = props.maxValue?.isBefore(viewportInterval.end)
        ? props.maxValue
        : viewportInterval.end;

    const align = props.align ?? SECOND;
    const minDuration = Math.max(props.minDuration ?? SECOND, align);
    const maxDuration = Math.max(
        Math.min(props.maxDuration ?? 15 * YEAR, maxValue.diff(minValue)),
        minDuration,
    );

    const canResize = minDuration < maxDuration;

    const draggingState = React.useRef<RangeValue<DateTime> | null>(null);
    const setDraggingValue = (v: RangeValue<DateTime> | null) => {
        draggingState.current = v;
        setCurrentValue(v);
    };
    const startDragging = () => {
        setIsDragging(true);
        setDraggingValue(displayValue);
    };

    const endDragging = () => {
        setIsDragging(false);
        if (draggingState.current) {
            setInterval(draggingState.current);
        }
    };

    const moveInterval = (delta: number) => {
        if (!draggingState.current) {
            return;
        }
        const {start, end} = draggingState.current;
        let newStart = start.add(delta, 'millisecond');
        let newEnd = end.add(delta, 'millisecond');
        const diff = newEnd.diff(newStart);
        if (newStart.valueOf() < minValue.valueOf()) {
            newStart = minValue;
            newEnd = constrainValue(newStart.add(diff, 'millisecond'), newStart, maxValue);
        } else if (newEnd.valueOf() > maxValue.valueOf()) {
            newEnd = maxValue;
            newStart = constrainValue(newEnd.subtract(diff, 'millisecond'), minValue, newEnd);
        }
        setDraggingValue({start: newStart, end: newEnd});
    };

    const moveStart = (
        delta: number,
        {visualMinDuration = minDuration}: {visualMinDuration?: number} = {},
    ) => {
        if (!draggingState.current) {
            return;
        }
        const {start, end} = draggingState.current;
        let newStart = start.add(delta, 'millisecond');
        const deltaMin = Math.max(visualMinDuration, minDuration);
        const deltaMax = Math.min(maxDuration, end.diff(minValue));
        newStart = constrainValue(
            newStart,
            end.subtract(deltaMax, 'millisecond'),
            end.subtract(deltaMin, 'millisecond'),
        );
        setDraggingValue({start: newStart, end});
    };

    const moveEnd = (
        delta: number,
        {visualMinDuration = minDuration}: {visualMinDuration?: number} = {},
    ) => {
        if (!draggingState.current) {
            return;
        }
        const {start, end} = draggingState.current;
        let newEnd = end.add(delta, 'millisecond');
        const deltaMin = Math.max(visualMinDuration, minDuration);
        const deltaMax = Math.min(maxDuration, maxValue.diff(start));

        newEnd = constrainValue(
            end.add(delta, 'millisecond'),
            start.add(deltaMin, 'millisecond'),
            start.add(deltaMax, 'millisecond'),
        );

        setDraggingValue({start, end: newEnd});
    };

    const zoomInterval = (
        scale: number,
        {
            visualMinDuration = minDuration,
            fixedPoint = 0.5,
        }: {visualMinDuration?: number; fixedPoint?: number} = {},
    ) => {
        if (!draggingState.current) {
            return;
        }
        const {start, end} = draggingState.current;
        const len = end.diff(start);
        let newDiff = len * scale;
        newDiff = align * Math.round(newDiff / align);
        newDiff = Math.min(
            Math.max(newDiff, Math.max(visualMinDuration, minDuration)),
            maxDuration,
        );
        let newStart = start.subtract(fixedPoint * (newDiff - len));
        let newEnd = newStart.add(newDiff, 'millisecond');
        const diff = newEnd.diff(newStart);
        if (newStart.valueOf() < minValue.valueOf()) {
            newStart = minValue;
            newEnd = constrainValue(newStart.add(diff, 'millisecond'), newStart, maxValue);
        } else if (newEnd.valueOf() > maxValue.valueOf()) {
            newEnd = maxValue;
            newStart = constrainValue(newEnd.subtract(diff, 'millisecond'), minValue, newEnd);
        }

        setDraggingValue({start: newStart, end: newEnd});
    };

    return {
        viewportInterval,
        value: currentValue ?? displayValue,
        setValue: setInterval,
        setDraggingValue,
        canResize,
        startDragging,
        move: moveInterval,
        scale: zoomInterval,
        moveStart,
        moveEnd,
        endDragging,
        timeZone,
        align,
        isDragging,
    };
}
