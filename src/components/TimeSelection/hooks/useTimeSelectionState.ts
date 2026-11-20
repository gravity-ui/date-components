import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';
import {useControlledState} from '@gravity-ui/uikit';

import {createPlaceholderValue} from '../../utils/dates';
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
    disabled: boolean;
    readOnly: boolean;
    columns: TimeSelectionColumnState[];
    /** Picks the option. Returns false when the option cannot be picked */
    selectItem: (column: TimeSelectionColumn, item: TimeSelectionItem) => boolean;
}

type TimeSelectionStateOptions = Pick<
    TimeSelectionProps,
    | 'value'
    | 'defaultValue'
    | 'onUpdate'
    | 'placeholderValue'
    | 'views'
    | 'ampm'
    | 'timeSteps'
    | 'minValue'
    | 'maxValue'
    | 'isTimeUnavailable'
    | 'timeZone'
    | 'disabled'
    | 'readOnly'
>;

export function useTimeSelectionState(props: TimeSelectionStateOptions): TimeSelectionState {
    const {
        views = DEFAULT_VIEWS,
        ampm = false,
        timeSteps,
        isTimeUnavailable,
        disabled = false,
        readOnly = false,
    } = props;

    const [value, setValue] = useControlledState<DateTime | null>(
        props.value,
        props.defaultValue ?? null,
        props.onUpdate as (value: DateTime | null) => void,
    );

    const inputTimeZone = useDefaultTimeZone(
        props.value || props.defaultValue || props.placeholderValue,
    );
    const timeZone = props.timeZone || inputTimeZone;

    const minValue = React.useMemo(
        () => (props.minValue ? props.minValue.timeZone(timeZone) : undefined),
        [timeZone, props.minValue],
    );
    const maxValue = React.useMemo(
        () => (props.maxValue ? props.maxValue.timeZone(timeZone) : undefined),
        [timeZone, props.maxValue],
    );

    const displayValue = React.useMemo(
        () => (value ? value.timeZone(timeZone) : null),
        [value, timeZone],
    );
    const placeholderValue = React.useMemo(
        () =>
            createPlaceholderValue({placeholderValue: props.placeholderValue, timeZone}).timeZone(
                timeZone,
            ),
        [props.placeholderValue, timeZone],
    );
    // What an option is applied to: the value, or the placeholder while there is none
    const base = displayValue ?? placeholderValue;

    const columnsKey = getColumns(views, ampm).join(',');
    const hoursStep = timeSteps?.hours;
    const minutesStep = timeSteps?.minutes;
    const secondsStep = timeSteps?.seconds;
    const millisecondsStep = timeSteps?.milliseconds;

    const columns = React.useMemo(() => {
        const steps = {
            hours: hoursStep,
            minutes: minutesStep,
            seconds: secondsStep,
            milliseconds: millisecondsStep,
        };
        // ''.split(',') is [''], not an empty list
        const columnKeys = (columnsKey ? columnsKey.split(',') : []) as TimeSelectionColumn[];
        return columnKeys.map((column): TimeSelectionColumnState => {
            const items = getColumnItems({
                column,
                base,
                ampm,
                step: column === 'meridiem' ? undefined : steps[column],
                minValue,
                maxValue,
                isTimeUnavailable,
                disabled,
            });
            return {
                column,
                items,
                selectedId: getSelectedItemId(displayValue, column, ampm, items),
            };
        });
    }, [
        columnsKey,
        hoursStep,
        minutesStep,
        secondsStep,
        millisecondsStep,
        ampm,
        base,
        displayValue,
        minValue,
        maxValue,
        isTimeUnavailable,
        disabled,
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

    return {disabled, readOnly, columns, selectItem};
}
