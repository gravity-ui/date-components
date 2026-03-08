'use client';

import type {DateTime} from '@gravity-ui/date-utils';
import {TextInput} from '@gravity-ui/uikit';

import {block} from '../../utils/cn';
import {useDateFieldProps} from '../DateField/hooks/useDateFieldProps';
import type {DateFieldProps} from '../DateField/hooks/useDateFieldProps';
import {useRangeDateFieldState} from '../DateField/hooks/useRangeDateFieldState';
import {HiddenInput} from '../HiddenInput/HiddenInput';
import type {RangeValue} from '../types';

import './RangeDateField.scss';

const b = block('range-date-field');

export type RangeDateFieldProps = DateFieldProps<RangeValue<DateTime>> & {
    /**
     * Delimiter separating the start and end parts of the range.
     * @default ' — '
     */
    delimiter?: string;
};

export function RangeDateField({className, ...props}: RangeDateFieldProps) {
    const state = useRangeDateFieldState(props);

    const {groupProps, inputProps} = useDateFieldProps(state, props);

    return (
        <div {...groupProps} className={b(null, className)} style={props.style}>
            <TextInput {...inputProps} />
            <HiddenInput
                name={props.name}
                form={props.form}
                onReset={(v) => {
                    state.setValue(v);
                }}
                value={state.value ?? null}
                toStringValue={(v) => (v ? v.start.toISOString() : '')}
                disabled={state.disabled}
            />
            <HiddenInput
                name={props.name}
                form={props.form}
                value={state.value ?? null}
                toStringValue={(v) => (v ? v.end.toISOString() : '')}
                disabled={state.disabled}
            />
        </div>
    );
}
