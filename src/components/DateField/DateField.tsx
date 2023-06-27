import type {DateTime} from '@gravity-ui/date-utils';
import {TextInput} from '@gravity-ui/uikit';

import {block} from '../../utils/cn';
import type {AccessibilityProps} from '../types';

import {useDateFieldProps} from './hooks/useDateFieldProps';
import {useDateFieldState} from './hooks/useDateFieldState';
import type {InputBaseProps} from './types';

import './DateField.scss';

const b = block('date-field');

export interface DateFieldProps extends InputBaseProps, AccessibilityProps {
    /** The current value (controlled). */
    value?: DateTime | null;
    /** The default value (uncontrolled). */
    defaultValue?: DateTime;
    /** Handler that is called when the value changes. */
    onUpdate?: (value: DateTime | null) => void;
    placeholderValue?: DateTime;
    /** The minimum allowed date that a user may select. */
    minValue?: DateTime;
    /** The maximum allowed date that a user may select. */
    maxValue?: DateTime;
    /**
     * Whether the field is disabled.
     * @default false
     */
    disabled?: boolean;
    /**
     * Whether the calendar value is immutable.
     * @default false
     */
    readOnly?: boolean;
    /** Format of the date when rendered in the input. [Available formats](https://day.js.org/docs/en/display/format) */
    format?: string;
    timeZone?: string;
    /** Class name applied to the root element. */
    className?: string;
}

export function DateField({className, ...props}: DateFieldProps) {
    const state = useDateFieldState(props);

    const {inputProps} = useDateFieldProps(state, props);

    return <TextInput className={b(null, className)} {...inputProps} />;
}
