import type {DateTime} from '@gravity-ui/date-utils';
import type {ListSize} from '@gravity-ui/uikit';

import type {AccessibilityProps, DomProps, FocusEvents, StyleProps} from '../types';

export type TimeSelectionView = 'hours' | 'minutes' | 'seconds' | 'milliseconds';

export interface TimeSelectionProps extends DomProps, StyleProps, AccessibilityProps, FocusEvents {
    /**
     * Whether to use the 12-hour clock with the AM/PM column.
     * @default false
     */
    ampm?: boolean;
    /** The column that takes DOM focus when the component mounts (uncontrolled). */
    defaultFocusView?: TimeSelectionView;
    /** The default value (uncontrolled). */
    defaultValue?: DateTime | null;
    /** Whether the component is disabled. */
    disabled?: boolean;
    /**
     * The column to move DOM focus into: on mount and whenever the property changes.
     * The user can still move focus elsewhere; `onFocusViewUpdate` reports it.
     */
    focusedView?: TimeSelectionView;
    /**
     * Callback that is called for each option of a column with the current value where the unit
     * of the option is put in, before it is kept within `minValue` and `maxValue`.
     * If it returns true, then the option is unavailable. An AM/PM option is checked as the hour
     * it gives, with the `hours` view.
     */
    isTimeUnavailable?: (value: DateTime, view: TimeSelectionView) => boolean;
    /** The maximum allowed date and time that a user may select. */
    maxValue?: DateTime;
    /** The minimum allowed date and time that a user may select. */
    minValue?: DateTime;
    /** Handler that is called when focus moves to another column. */
    onFocusViewUpdate?: (view: TimeSelectionView) => void;
    /** Handler that is called when the value changes. */
    onUpdate?: (value: DateTime) => void;
    /**
     * The date and the units that are not picked yet while the value is empty, kept within
     * `minValue` and `maxValue`. Defaults to today's date at midnight.
     */
    placeholderValue?: DateTime;
    /** Whether the value is immutable. */
    readOnly?: boolean;
    /**
     * The size of the rows, the size of the uikit `List`.
     * @default 'm'
     */
    size?: ListSize;
    /** Steps between the options of a column. Defaults to 1 for every unit. */
    timeSteps?: Partial<Record<TimeSelectionView, number>>;
    /**
     * Which timezone use to show values. Example: 'default', 'system', 'Europe/Amsterdam'.
     * @default The timezone of the `value` or `defaultValue` or `placeholderValue`, 'default' otherwise.
     */
    timeZone?: string;
    /** The current value (controlled). */
    value?: DateTime | null;
    /**
     * Units to show columns for. The order of the columns is always hours, minutes, seconds,
     * milliseconds.
     * @default ['hours', 'minutes']
     */
    views?: TimeSelectionView[];
}
