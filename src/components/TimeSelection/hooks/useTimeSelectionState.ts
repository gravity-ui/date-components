import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';
import {useControlledState} from '@gravity-ui/uikit';

import {constrainValue, createPlaceholderValue} from '../../utils/dates';
import {useDefaultTimeZone} from '../../utils/useDefaultTimeZone';
import type {TimeSelectionProps, TimeSelectionView} from '../types';
import {applyUnitValue, getColumnItems, getColumns, getSelectedItemId} from '../utils';
import type {TimeSelectionColumn, TimeSelectionItem} from '../utils';

const DEFAULT_VIEWS: TimeSelectionView[] = ['hours', 'minutes'];

interface TimeSelectionColumnState {
    column: TimeSelectionColumn;
    items: TimeSelectionItem[];
    selectedId: string | undefined;
}

interface TimeSelectionState {
    columns: TimeSelectionColumnState[];
    disabled: boolean;
    readOnly: boolean;
    /** Returns false when the option cannot be picked */
    selectItem: (column: TimeSelectionColumn, item: TimeSelectionItem) => boolean;
    /** The moment of the value, to tell when it changes */
    valueKey: number | undefined;
}

type TimeSelectionStateOptions = Pick<
    TimeSelectionProps,
    | 'ampm'
    | 'defaultValue'
    | 'disabled'
    | 'isTimeUnavailable'
    | 'maxValue'
    | 'minValue'
    | 'onUpdate'
    | 'placeholderValue'
    | 'readOnly'
    | 'timeSteps'
    | 'timeZone'
    | 'value'
    | 'views'
>;

export function useTimeSelectionState(props: TimeSelectionStateOptions): TimeSelectionState {
    const {
        ampm = false,
        disabled = false,
        isTimeUnavailable,
        maxValue: maxValueProp,
        minValue: minValueProp,
        placeholderValue,
        readOnly = false,
        timeSteps,
        views = DEFAULT_VIEWS,
    } = props;

    const [value, setValue] = useControlledState<DateTime | null>(
        props.value,
        props.defaultValue ?? null,
        props.onUpdate as (value: DateTime | null) => void,
    );

    const inputTimeZone = useDefaultTimeZone(props.value || props.defaultValue || placeholderValue);
    const timeZone = props.timeZone || inputTimeZone;

    const columnsKey = getColumns(views, ampm).join(',');
    const {hours, milliseconds, minutes, seconds} = timeSteps ?? {};

    // The only memo here: it keeps the items of the columns the same objects between renders,
    // so the List does not re-render every row (a thousand of them for milliseconds). Its inputs
    // are compared as primitives because `views` and `timeSteps` are usually passed inline
    const {base, columns, displayValue, maxValue, minValue} = React.useMemo(() => {
        const steps = {hours, milliseconds, minutes, seconds};
        const currentValue = value ? value.timeZone(timeZone) : null;
        const range = {
            maxValue: maxValueProp?.timeZone(timeZone),
            minValue: minValueProp?.timeZone(timeZone),
        };
        // The placeholder is kept within the range like any picked value is: otherwise every
        // option would be counted from a moment that cannot be picked
        const currentBase =
            currentValue ??
            constrainValue(
                createPlaceholderValue({placeholderValue, timeZone}).timeZone(timeZone),
                range.minValue,
                range.maxValue,
            ).timeZone(timeZone);
        const columnKeys = columnsKey.split(',').filter(Boolean) as TimeSelectionColumn[];

        return {
            ...range,
            base: currentBase,
            columns: columnKeys.map((column): TimeSelectionColumnState => {
                const items = getColumnItems({
                    ...range,
                    ampm,
                    base: currentBase,
                    column,
                    disabled,
                    isTimeUnavailable,
                    step: column === 'meridiem' ? undefined : steps[column],
                });
                return {
                    column,
                    items,
                    selectedId: getSelectedItemId(currentValue, column, ampm, items),
                };
            }),
            displayValue: currentValue,
        };
    }, [
        ampm,
        columnsKey,
        disabled,
        hours,
        isTimeUnavailable,
        maxValueProp,
        milliseconds,
        minValueProp,
        minutes,
        placeholderValue,
        seconds,
        timeZone,
        value,
    ]);

    const selectItem = (column: TimeSelectionColumn, item: TimeSelectionItem) => {
        if (disabled || readOnly || item.disabled) {
            return false;
        }
        const next = applyUnitValue(base, column, ampm, item.value, minValue, maxValue);
        if (!displayValue || !next.isSame(displayValue)) {
            setValue(next.timeZone(inputTimeZone));
        }
        return true;
    };

    return {columns, disabled, readOnly, selectItem, valueKey: displayValue?.valueOf()};
}
