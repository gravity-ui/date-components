import type {DateTime} from '@gravity-ui/date-utils';

import type {AvailableSections} from './types';
import {getDurationUnitFromSectionType} from './utils';

const dateFields = [
    'year',
    'quarter',
    'month',
    'day',
    'weekday',
    'hour',
    'minute',
    'second',
    'dayPeriod',
] as const;

type Field = (typeof dateFields)[number];

export class IncompleteDate {
    year: number | null;
    month: number | null;
    day: number | null;
    weekday: number | null;
    dayPeriod: number | null;
    hour: number | null;
    minute: number | null;
    second: number | null;

    constructor(date?: DateTime | null) {
        this.year = date?.year() ?? null;
        this.month = date ? date.month() + 1 : null;
        this.day = date?.date() ?? null;
        this.weekday = date?.day() ?? null;
        this.hour = date?.hour() ?? null;
        this.minute = date?.minute() ?? null;
        this.second = date?.second() ?? null;
        if (date) {
            this.dayPeriod = date.hour() >= 12 ? 1 : 0;
        } else {
            this.dayPeriod = null;
        }
    }

    get quarter() {
        return this.month === null ? null : Math.ceil(this.month / 3);
    }

    set quarter(v: number | null) {
        this.month =
            v === null
                ? null
                : (v - 1) * 3 + (this.month === null ? 1 : ((this.month - 1) % 3) + 13);
    }

    copy() {
        const copy = new IncompleteDate();
        for (const field of dateFields) {
            copy[field] = this[field];
        }
        return copy;
    }

    isComplete(availableUnits: AvailableSections): boolean {
        return dateFields.every((field) => !availableUnits[field] || this[field] !== null);
    }

    validate(date: DateTime, availableUnits: AvailableSections): boolean {
        return dateFields.every((field) => {
            if (!availableUnits[field]) {
                return true;
            }

            if (field === 'dayPeriod') {
                return this.dayPeriod === (date.hour() >= 12 ? 1 : 0);
            }

            if (field === 'month') {
                return date.month() + 1 === this.month;
            }

            return date[getDurationUnitFromSectionType(field)]() === this[field];
        });
    }

    isCleared(availableUnits: AvailableSections): boolean {
        return dateFields.every((field) => !availableUnits[field] || this[field] === null);
    }

    set(field: Field, value: number): IncompleteDate {
        const copy = this.copy();
        copy[field] = value;
        if (field === 'hour') {
            copy.dayPeriod = (copy.hour ?? 0) >= 12 ? 1 : 0;
        }

        return copy;
    }

    clear(field: Field): IncompleteDate {
        const copy = this.copy();
        copy[field] = null;
        return copy;
    }

    toDateTime(
        baseValue: DateTime,
        {setDate, setTime}: {setDate: boolean; setTime: boolean},
    ): DateTime {
        let nextValue = baseValue;
        if (setDate) {
            nextValue = nextValue
                .set({
                    year: this.year ?? baseValue.year(),
                    month: 0, // set January to not overflow day value
                    date: this.day ?? baseValue.date(),
                })
                .set({month: this.month === null ? baseValue.month() : this.month - 1});
            if (this.day === null && this.weekday !== null) {
                nextValue = nextValue.set({day: this.weekday});
            }
        }
        if (setTime) {
            nextValue = nextValue
                .set({
                    hour: this.hour ?? baseValue.hour(),
                    minute: this.minute ?? baseValue.minute(),
                    second: this.second ?? baseValue.second(),
                })
                .timeZone(nextValue.timeZone());
        }

        return nextValue;
    }
}
