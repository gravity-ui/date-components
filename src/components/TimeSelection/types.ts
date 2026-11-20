import type {DateTime} from '@gravity-ui/date-utils';

import type {AccessibilityProps, DomProps, FocusEvents, StyleProps} from '../types';

export type TimeSelectionView = 'hours' | 'minutes' | 'seconds' | 'milliseconds';

export interface TimeSelectionProps extends DomProps, StyleProps, AccessibilityProps, FocusEvents {
    /** The current value (controlled). */
    value?: DateTime | null;
    /** The default value (uncontrolled). */
    defaultValue?: DateTime | null;
    /** Handler that is called when the value changes. */
    onUpdate?: (value: DateTime) => void;
    /**
     * The date and the units that are not picked yet while the value is empty.
     * Defaults to today's date at midnight.
     */
    placeholderValue?: DateTime;
    /**
     * Units to show columns for. The order of the columns is always hours, minutes, seconds,
     * milliseconds.
     * @default ['hours', 'minutes']
     */
    views?: TimeSelectionView[];
    /**
     * Whether to use the 12-hour clock with the AM/PM column.
     * @default false
     */
    ampm?: boolean;
    /** Steps between the options of a column. Defaults to 1 for every unit. */
    timeSteps?: Partial<Record<TimeSelectionView, number>>;
    /** The minimum allowed date and time that a user may select. */
    minValue?: DateTime;
    /** The maximum allowed date and time that a user may select. */
    maxValue?: DateTime;
    /**
     * Callback that is called for each option of a column with the value the option would set.
     * If it returns true, then the option is unavailable. An AM/PM option is checked as the hour
     * it gives, with the `hours` view.
     */
    isTimeUnavailable?: (value: DateTime, view: TimeSelectionView) => boolean;
    /**
     * The column to move DOM focus into: on mount and whenever the property changes.
     * The user can still move focus elsewhere; `onFocusViewUpdate` reports it.
     */
    focusedView?: TimeSelectionView;
    /** The column that takes DOM focus when the component mounts (uncontrolled). */
    defaultFocusView?: TimeSelectionView;
    /** Handler that is called when focus moves to another column. */
    onFocusViewUpdate?: (view: TimeSelectionView) => void;
    /**
     * Which timezone use to show values. Example: 'default', 'system', 'Europe/Amsterdam'.
     * @default The timezone of the `value` or `defaultValue` or `placeholderValue`, 'default' otherwise.
     */
    timeZone?: string;
    /** Whether the component is disabled. */
    disabled?: boolean;
    /** Whether the value is immutable. */
    readOnly?: boolean;
    /**
     * The size of the rows, passed to the uikit `List` as is.
     * @default 'm'
     */
    size?: 's' | 'm' | 'l' | 'xl';
}
