import React from 'react';

import {Calendar as CalendarIcon} from '@gravity-ui/icons';
import {Button, Icon, Popup, useOnFocusOutside} from '@gravity-ui/uikit';

import {Calendar} from '../Calendar';
import {DateField} from '../DateField';

import type {DatePickerProps} from './DatePicker';
import type {DatePickerState} from './hooks/useDatePickerState';
import {i18n} from './i18n';
import {b, getButtonSize} from './utils';

interface DesktopCalendarProps {
    anchorRef: React.RefObject<HTMLElement>;
    props: DatePickerProps;
    state: DatePickerState;
}
export function DesktopCalendar({anchorRef, props, state}: DesktopCalendarProps) {
    const {onFocus, onBlur} = useOnFocusOutside({
        onFocusOutside: () => {
            state.setOpen(false);
        },
        enabled: state.isOpen,
    });

    if (!state.hasDate) {
        return null;
    }

    return (
        <Popup
            open={state.isOpen}
            anchorRef={anchorRef}
            onClose={() => {
                state.setOpen(false);
            }}
            restoreFocus
        >
            <div onFocus={onFocus} onBlur={onBlur} className={b('popup-content')} tabIndex={-1}>
                <Calendar
                    // eslint-disable-next-line jsx-a11y/no-autofocus
                    autoFocus
                    size={props.size === 's' ? 'm' : props.size}
                    disabled={props.disabled}
                    readOnly={props.readOnly}
                    onUpdate={(d) => {
                        state.setDateValue(d);
                    }}
                    defaultFocusedValue={state.dateValue ?? undefined}
                    value={state.dateValue}
                    minValue={props.minValue}
                    maxValue={props.maxValue}
                    timeZone={props.timeZone}
                />
                {state.hasTime && (
                    <div className={b('time-field-wrapper')}>
                        <DateField
                            className={b('time-field')}
                            size={props.size}
                            readOnly={props.readOnly}
                            value={state.timeValue}
                            onUpdate={state.setTimeValue}
                            placeholderValue={props.placeholderValue}
                            minValue={props.minValue}
                            maxValue={props.maxValue}
                            timeZone={props.timeZone}
                            format={state.timeFormat}
                        />
                    </div>
                )}
            </div>
        </Popup>
    );
}

interface DesktopCalendarButtonProps {
    props: DatePickerProps;
    state: DatePickerState;
}
export function DesktopCalendarButton({props, state}: DesktopCalendarButtonProps) {
    const wasOpenBeforeClickRef = React.useRef(false);
    if (!state.hasDate) {
        return null;
    }

    return (
        <Button
            view="flat"
            size={getButtonSize(props.size)}
            disabled={props.disabled}
            extraProps={{
                'aria-label': i18n('Calendar'),
                'aria-haspopup': 'dialog',
                'aria-expanded': state.isOpen,
            }}
            onFocus={() => {
                wasOpenBeforeClickRef.current = state.isOpen;
            }}
            onClick={() => {
                if (!wasOpenBeforeClickRef.current) {
                    state.setOpen(true);
                }
                wasOpenBeforeClickRef.current = false;
            }}
        >
            <Icon data={CalendarIcon} />
        </Button>
    );
}
