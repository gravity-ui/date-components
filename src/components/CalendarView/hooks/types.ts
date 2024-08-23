import type {DateTime} from '@gravity-ui/date-utils';

import type {InputBase, RangeValue} from '../../types';

export type CalendarLayout = 'days' | 'months' | 'quarters' | 'years';

export interface CalendarStateOptionsBase extends InputBase {
    /** The minimum allowed date that a user may select. */
    minValue?: DateTime;
    /** The maximum allowed date that a user may select. */
    maxValue?: DateTime;
    /** Callback that is called for each date of the calendar. If it returns true, then the date is unavailable. */
    isDateUnavailable?: (date: DateTime) => boolean;
    /** Callback that is called for each date of the calendar. If it returns true, then the date is weekend. */
    isWeekend?: (date: DateTime) => boolean;
    /**
     * Which timezone use to show values. Example: 'default', 'system', 'Europe/Amsterdam'.
     * @default The timezone of the `value` or `defaultValue` or `focusedValue` or `defaultFocusedValue`, 'default' otherwise.
     */
    timeZone?: string;
    /**
     * Whether to automatically focus the calendar when it mounts.
     * @default false
     */
    autoFocus?: boolean;
    /** Controls the currently focused date within the calendar. */
    focusedValue?: DateTime | null;
    /** The date that is focused when the calendar first mounts (uncontrolled). */
    defaultFocusedValue?: DateTime;
    /** Handler that is called when the focused date changes. */
    onFocusUpdate?: (date: DateTime) => void;
    /** Controls what to show in calendar (days, months or years) */
    mode?: CalendarLayout;
    /** Initial mode to show in calendar (days, months or years) */
    defaultMode?: CalendarLayout;
    /** Handler that is called when the mode changes */
    onUpdateMode?: (mode: CalendarLayout) => void;
    /** Controls which modes to use */
    modes?: Partial<Record<CalendarLayout, boolean>>;
}

interface CalendarStateBase {
    /** Whether the calendar is disabled. */
    readonly disabled?: boolean;
    /** Whether the calendar is in a read only state. */
    readonly readOnly?: boolean;
    /** Which timezone use to show values. */
    readonly timeZone: string;
    /** The minimum allowed date that a user may select. */
    readonly minValue?: DateTime;
    /** The maximum allowed date that a user may select. */
    readonly maxValue?: DateTime;
    /** The currently focused date. */
    readonly focusedDate: DateTime;
    /** Sets the focused date. */
    setFocusedDate: (date: DateTime) => void;
    /** Selects the currently focused date. */
    selectFocusedDate: () => void;
    /** Selects the given date. */
    selectDate: (date: DateTime, force?: boolean) => void;
    /** Moves focus to the next calendar date. */
    focusNextCell: () => void;
    /** Moves focus to the previous calendar date. */
    focusPreviousCell: () => void;
    /** Moves focus to the next row of dates, e.g. the next week. */
    focusNextRow: () => void;
    /** Moves focus to the previous row of dates, e.g. the previous work. */
    focusPreviousRow: () => void;
    /**
     * Moves focus to the next page of dates, e.g. the next month.
     * If the `larger` option is `true`, the focus is moved by the next larger unit.
     * For example, if days are displayed, then focus moves to the next year.
     */
    focusNextPage: (larger?: boolean) => void;
    /**
     * Moves focus to the previous page of dates, e.g. the previous month.
     * If the `larger` option is `true`, the focus is moved by the next larger unit.
     * For example, if days are displayed, then focus moves to the previous year.
     */
    focusPreviousPage: (larger?: boolean) => void;
    /** Moves focus to the start of the current section of dates, e.g. the start of the current month. */
    focusSectionStart: () => void;
    /** Moves focus to the end of the current section of dates, e.g. the end of the current month month. */
    focusSectionEnd: () => void;
    /** Switches to more detailed layout. */
    zoomIn: () => void;
    /** Switches to less detailed layout. */
    zoomOut: () => void;
    /** Whether focus is currently within the calendar. */
    readonly isFocused: boolean;
    /** Sets whether focus is currently within the calendar. */
    setFocused: (isFocused: boolean) => void;
    /** Returns whether the given date is invalid according to the `minValue` and `maxValue` props. */
    isInvalid: (date: DateTime) => boolean;
    /** Returns whether the previous page is allowed to be selected according to the `minValue` prop. */
    isPreviousPageInvalid: () => boolean;
    /** Returns whether the next page is allowed to be selected according to the `maxValue` prop. */
    isNextPageInvalid: () => boolean;
    /** Returns whether the given date is currently selected. */
    isSelected: (date: DateTime) => boolean;
    /** Returns whether the given date is unavailable according to the `isDateUnavailable` prop. */
    isCellUnavailable: (date: DateTime) => boolean;
    /** Returns whether the given date is currently focused. */
    isCellFocused: (date: DateTime) => boolean;
    /** Returns whether the given date is disabled according to the `minValue, `maxValue`, and `isDisabled` props. */
    isCellDisabled: (date: DateTime) => boolean;
    /** Returns whether the given date is weekend */
    isWeekend: (date: DateTime) => boolean;
    /** Returns whether the given date is in current period */
    isCurrent: (date: DateTime) => boolean;
    /** Current calendar layout */
    readonly mode: CalendarLayout;
    /** Sets calendar layout */
    setMode: (mode: CalendarLayout) => void;
    readonly availableModes: CalendarLayout[];
    readonly startDate: DateTime;
    readonly endDate: DateTime;
}

export interface CalendarState extends CalendarStateBase {
    /** The currently selected date. */
    readonly value: DateTime | null;
    /** Sets the currently selected date. */
    setValue: (value: DateTime) => void;
}

export interface RangeCalendarState extends CalendarStateBase {
    /** The currently selected range. */
    readonly value: RangeValue<DateTime> | null;
    /** Sets the currently selected range. */
    setValue: (value: RangeValue<DateTime>) => void;
    /** The current anchor date that the user clicked on to begin range selection. */
    readonly anchorDate: DateTime | undefined;
    /** Sets the anchor date that the user clicked on to begin range selection. */
    setAnchorDate: (date: DateTime | undefined) => void;
    /** The currently highlighted date range. */
    readonly highlightedRange: RangeValue<DateTime> | undefined;
    /** Highlights the given date during selection, e.g. by hovering. */
    highlightDate: (date: DateTime) => void;
}
