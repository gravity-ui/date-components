import type {DateTime} from '@gravity-ui/date-utils';

import {constrainValue} from '../utils/dates';

import type {TimeSelectionView} from './types';

/** The AM/PM column is internal: it is not a view */
export type TimeSelectionColumn = TimeSelectionView | 'meridiem';

export interface TimeSelectionItem {
    disabled: boolean;
    id: string;
    label: string;
    /** Hours 0–23 (0–11 on the 12-hour clock), other units from 0, 0 for AM and 1 for PM */
    value: number;
}

const VIEWS_ORDER: TimeSelectionView[] = ['hours', 'minutes', 'seconds', 'milliseconds'];
const UNIT_COUNT: Record<TimeSelectionView, number> = {
    hours: 24,
    milliseconds: 1000,
    minutes: 60,
    seconds: 60,
};
const UNIT_OF_VIEW = {hours: 'hour', minutes: 'minute', seconds: 'second'} as const;

export function getColumns(views: TimeSelectionView[], ampm: boolean): TimeSelectionColumn[] {
    const columns: TimeSelectionColumn[] = VIEWS_ORDER.filter((view) => views.includes(view));
    if (ampm) {
        columns.push('meridiem');
    }
    return columns;
}

function normalizeStep(step: number | undefined) {
    return typeof step === 'number' && Number.isFinite(step) && step >= 1 ? Math.floor(step) : 1;
}

function getUnitValues(column: TimeSelectionColumn, ampm: boolean, step: number | undefined) {
    if (column === 'meridiem') {
        return [0, 1];
    }
    const count = column === 'hours' && ampm ? 12 : UNIT_COUNT[column];
    const normalizedStep = normalizeStep(step);
    const values: number[] = [];
    for (let value = 0; value < count; value += normalizedStep) {
        values.push(value);
    }
    return values;
}

function getItemLabel(column: TimeSelectionColumn, ampm: boolean, value: number) {
    if (column === 'meridiem') {
        return value === 0 ? 'AM' : 'PM';
    }
    const shown = column === 'hours' && ampm && value === 0 ? 12 : value;
    return String(shown).padStart(column === 'milliseconds' ? 3 : 2, '0');
}

function getUnitValue(date: DateTime, column: TimeSelectionColumn, ampm: boolean) {
    switch (column) {
        case 'hours':
            return ampm ? date.hour() % 12 : date.hour();
        case 'minutes':
            return date.minute();
        case 'seconds':
            return date.second();
        case 'milliseconds':
            return date.millisecond();
        default:
            return date.hour() < 12 ? 0 : 1;
    }
}

function setUnitValue(date: DateTime, column: TimeSelectionColumn, ampm: boolean, value: number) {
    switch (column) {
        case 'hours':
            return date.set('hours', ampm ? value + (date.hour() < 12 ? 0 : 12) : value);
        case 'minutes':
            return date.set('minutes', value);
        case 'seconds':
            return date.set('seconds', value);
        case 'milliseconds':
            return date.set('milliseconds', value);
        default:
            return date.set('hours', (date.hour() % 12) + value * 12);
    }
}

/** An option is out of range only when its whole interval is: the hour, the minute, the half of the day */
function isIntervalOutOfRange(
    candidate: DateTime,
    column: TimeSelectionColumn,
    minValue: DateTime | undefined,
    maxValue: DateTime | undefined,
) {
    if (!minValue && !maxValue) {
        return false;
    }
    let start = candidate;
    let end = candidate;
    if (column === 'meridiem') {
        const firstHour = candidate.hour() < 12 ? 0 : 12;
        start = candidate.set('hours', firstHour).startOf('hour');
        end = candidate.set('hours', firstHour + 11).endOf('hour');
    } else if (column !== 'milliseconds') {
        start = candidate.startOf(UNIT_OF_VIEW[column]);
        end = candidate.endOf(UNIT_OF_VIEW[column]);
    }
    return Boolean((minValue && end.isBefore(minValue)) || (maxValue && start.isAfter(maxValue)));
}

interface ColumnItemsOptions {
    ampm: boolean;
    /** The value the options are applied to: the current value or the placeholder */
    base: DateTime;
    column: TimeSelectionColumn;
    disabled?: boolean;
    isTimeUnavailable?: (value: DateTime, view: TimeSelectionView) => boolean;
    maxValue?: DateTime;
    minValue?: DateTime;
    /** Leaves the unavailable options out instead of showing them as disabled */
    skipDisabled?: boolean;
    step?: number;
}

export function getColumnItems({
    ampm,
    base,
    column,
    disabled,
    isTimeUnavailable,
    maxValue,
    minValue,
    skipDisabled,
    step,
}: ColumnItemsOptions): TimeSelectionItem[] {
    const items: TimeSelectionItem[] = [];
    for (const value of getUnitValues(column, ampm, step)) {
        let unavailable = false;
        // A disabled component shows every option as disabled; which of them are unavailable
        // matters only when those are to be left out
        if (!disabled || skipDisabled) {
            const candidate = setUnitValue(base, column, ampm, value);
            // A half of the day changes the hour, so its option answers for the hour it gives
            const view = column === 'meridiem' ? 'hours' : column;
            unavailable =
                isIntervalOutOfRange(candidate, column, minValue, maxValue) ||
                Boolean(isTimeUnavailable?.(candidate, view));
        }
        if (unavailable && skipDisabled) {
            continue;
        }
        const label = getItemLabel(column, ampm, value);
        items.push({disabled: Boolean(disabled) || unavailable, id: label, label, value});
    }
    return items;
}

/** Nothing is selected when the value does not fit the step of the column */
export function getSelectedItemId(
    value: DateTime | null,
    column: TimeSelectionColumn,
    ampm: boolean,
    items: TimeSelectionItem[],
) {
    if (!value) {
        return undefined;
    }
    const unitValue = getUnitValue(value, column, ampm);
    return items.find((item) => item.value === unitValue)?.id;
}

export function applyUnitValue(
    base: DateTime,
    column: TimeSelectionColumn,
    ampm: boolean,
    value: number,
    minValue: DateTime | undefined,
    maxValue: DateTime | undefined,
) {
    const next = constrainValue(setUnitValue(base, column, ampm, value), minValue, maxValue);
    return next.timeZone(base.timeZone());
}

function isOutOfRange(
    date: DateTime,
    minValue: DateTime | undefined,
    maxValue: DateTime | undefined,
) {
    return Boolean((minValue && date.isBefore(minValue)) || (maxValue && maxValue.isBefore(date)));
}

/**
 * The first pick, while there is no value. The units that are not picked come from the
 * placeholder. Only when that lands out of the range they come from its bound: first without the
 * units below the picked one, then with them
 */
export function applyFirstUnitValue(
    placeholder: DateTime,
    base: DateTime,
    column: TimeSelectionColumn,
    ampm: boolean,
    value: number,
    minValue: DateTime | undefined,
    maxValue: DateTime | undefined,
) {
    const fromPlaceholder = setUnitValue(placeholder, column, ampm, value);
    if (!isOutOfRange(fromPlaceholder, minValue, maxValue)) {
        return fromPlaceholder;
    }
    if (column !== 'meridiem' && column !== 'milliseconds') {
        const rounded = setUnitValue(base, column, ampm, value).startOf(UNIT_OF_VIEW[column]);
        if (!isOutOfRange(rounded, minValue, maxValue)) {
            return rounded;
        }
    }
    return applyUnitValue(base, column, ampm, value, minValue, maxValue);
}
