'use client';

import {TextInput} from '@gravity-ui/uikit';

import {block} from '../../utils/cn';
import {HiddenInput} from '../HiddenInput/HiddenInput';

import {useDateFieldProps} from './hooks/useDateFieldProps';
import type {DateFieldProps} from './hooks/useDateFieldProps';
import {useDateFieldState} from './hooks/useDateFieldState';

import './DateField.scss';

const b = block('date-field');

export function DateField({className, ...props}: DateFieldProps) {
    const state = useDateFieldState(props);

    const {groupProps, inputProps} = useDateFieldProps(state, props);

    return (
        <div {...groupProps} className={b(null, className)} style={props.style}>
            <TextInput {...inputProps} />
            <HiddenInput
                name={props.name}
                value={state.value}
                toStringValue={(value) => value?.toISOString() ?? ''}
                onReset={(value) => {
                    state.setValue(value);
                }}
                disabled={state.disabled}
                form={props.form}
            />
        </div>
    );
}
