import type {DateTime} from '@gravity-ui/date-utils';

import type {InputBase, Validation, ValueBase} from './inputs';

export interface DateFieldBase<T = DateTime> extends ValueBase<T | null>, InputBase, Validation {
    /** The minimum allowed date that a user may select. */
    minValue?: DateTime;
    /** The maximum allowed date that a user may select. */
    maxValue?: DateTime;
    /** Callback that is called for each date of the calendar. If it returns true, then the date is unavailable. */
    isDateUnavailable?: (date: DateTime) => boolean;
    /** Format of the date when rendered in the input. [Available formats](https://day.js.org/docs/en/display/format) */
    format?: string;
    /** A placeholder date that controls the default values of each segment when the user first interacts with them. Defaults to today's date at midnight. */
    placeholderValue?: DateTime;
    /**
     * Which timezone use to show values. Example: 'default', 'system', 'Europe/Amsterdam'.
     * @default The timezone of the `value` or `defaultValue` or `placeholderValue`, 'default' otherwise.
     */
    timeZone?: string;
}

export interface PopupTriggerProps<Args extends unknown[] = []> {
    /** Whether the popup is open (controlled). */
    open?: boolean;
    /** Whether the popup is open by default (uncontrolled). */
    defaultOpen?: boolean;
    /** Handler that is called when the popup's open state changes. */
    onOpenChange?: (open: boolean, ...args: Args) => void;
}
