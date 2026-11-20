import type {DateTime} from '@gravity-ui/date-utils';

import {constrainValue} from '../utils/dates';

import type {TimeSelectionView} from './types';

/** A column of the component; the AM/PM column is internal and is not a view */
export type TimeSelectionColumn = TimeSelectionView | 'meridiem';

export interface TimeSelectionItem {
    id: string;
    label: string;
    /**
     * The unit value of the option: hours 0–23 (0–11 on the 12-hour clock), minutes and
     * seconds 0–59, 0 for AM and 1 for PM
     */
    value: number;
    disabled: boolean;
}

const VIEWS_ORDER: TimeSelectionView[] = ['hours', 'minutes', 'seconds'];
const UNIT_COUNT: Record<TimeSelectionView, number> = {hours: 24, minutes: 60, seconds: 60};
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
    return String(shown).padStart(2, '0');
}

/** The unit value of the date in terms of the options of the column */
function getUnitValue(date: DateTime, column: TimeSelectionColumn, ampm: boolean) {
    switch (column) {
        case 'hours':
            return ampm ? date.hour() % 12 : date.hour();
        case 'minutes':
            return date.minute();
        case 'seconds':
            return date.second();
        default:
            return date.hour() < 12 ? 0 : 1;
    }
}

/** The date with the unit of the column replaced; nothing else changes */
function setUnitValue(date: DateTime, column: TimeSelectionColumn, ampm: boolean, value: number) {
    switch (column) {
        case 'hours':
            return date.set('hours', ampm ? value + (date.hour() < 12 ? 0 : 12) : value);
        case 'minutes':
            return date.set('minutes', value);
        case 'seconds':
            return date.set('seconds', value);
        default:
            return date.set('hours', (date.hour() % 12) + value * 12);
    }
}

/**
 * Whether the whole interval of the option (an hour, a minute, a second, a half of the day)
 * is out of range
 */
function isIntervalOutOfRange(
    candidate: DateTime,
    column: TimeSelectionColumn,
    minValue: DateTime | undefined,
    maxValue: DateTime | undefined,
) {
    if (!minValue && !maxValue) {
        return false;
    }
    let start: DateTime;
    let end: DateTime;
    if (column === 'meridiem') {
        const firstHour = candidate.hour() < 12 ? 0 : 12;
        start = candidate.set('hours', firstHour).startOf('hour');
        end = candidate.set('hours', firstHour + 11).endOf('hour');
    } else {
        start = candidate.startOf(UNIT_OF_VIEW[column]);
        end = candidate.endOf(UNIT_OF_VIEW[column]);
    }
    return Boolean((minValue && end.isBefore(minValue)) || (maxValue && start.isAfter(maxValue)));
}

interface ColumnItemsOptions {
    column: TimeSelectionColumn;
    /** The value the options are applied to: the current value or the placeholder */
    base: DateTime;
    ampm: boolean;
    step?: number;
    minValue?: DateTime;
    maxValue?: DateTime;
    isTimeUnavailable?: (value: DateTime, view: TimeSelectionView) => boolean;
    disabled?: boolean;
}

export function getColumnItems({
    column,
    base,
    ampm,
    step,
    minValue,
    maxValue,
    isTimeUnavailable,
    disabled,
}: ColumnItemsOptions): TimeSelectionItem[] {
    return getUnitValues(column, ampm, step).map((value) => {
        const label = getItemLabel(column, ampm, value);
        let itemDisabled = Boolean(disabled);
        if (!itemDisabled) {
            const candidate = setUnitValue(base, column, ampm, value);
            // A half of the day changes the hour, so its option answers for the hour it gives
            const view = column === 'meridiem' ? 'hours' : column;
            itemDisabled =
                isIntervalOutOfRange(candidate, column, minValue, maxValue) ||
                Boolean(isTimeUnavailable?.(candidate, view));
        }
        return {id: label, label, value, disabled: itemDisabled};
    });
}

/** The id of the option that shows the value; nothing when the value does not fit the step */
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

/** The value after picking the option: only its unit changes, the result is kept within the range */
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
