import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';
import {ArrowToggle, Button} from '@gravity-ui/uikit';

import {block} from '../../utils/cn';

import {useCalendarCellProps} from './hooks/useCalendarCellProps';
import {useCalendarGridProps} from './hooks/useCalendarGridProps';
import {useCalendarProps} from './hooks/useCalendarProps';
import {useCalendarState} from './hooks/useCalendarState';
import type {CalendarState} from './hooks/useCalendarState';
import {getDaysInPeriod, getWeekDays} from './utils';

import './Calendar.scss';

const b = block('calendar');

export type CalendarSize = 'm' | 'l' | 'xl';

export interface CalendarInstance {
    focus: () => void;
}

export interface CalendarProps {
    /** The current value (controlled). */
    value?: DateTime | null;
    /** The default value (uncontrolled). */
    defaultValue?: DateTime;
    /** Handler that is called when the value changes. */
    onUpdate?: (date: DateTime) => void;
    /** The minimum allowed date that a user may select. */
    minValue?: DateTime;
    /** The maximum allowed date that a user may select. */
    maxValue?: DateTime;
    /**
     * Whether the calendar is disabled.
     * @default false
     */
    disabled?: boolean;
    /**
     * Whether the calendar value is immutable.
     * @default false
     */
    readOnly?: boolean;
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
    onFocusUpdate?: (value: DateTime) => void;
    timeZone?: string;
    /** Callback that is called for each date of the calendar. If it returns true, then the date is unavailable. */
    isDateUnavailable?: (date: DateTime) => boolean;
    /**
     * The size of the element.
     * @default m
     */
    size?: CalendarSize;
    /** The element's unique identifier. */
    id?: string;
    /** Defines a string value that labels the current element. */
    'aria-label'?: string;
    /** Identifies the element (or elements) that describes the object. */
    'aria-describedby'?: string;
}
export const Calendar = React.forwardRef<CalendarInstance, CalendarProps>(function Calendar(
    props: CalendarProps,
    ref,
) {
    const state = useCalendarState(props);
    const {calendarProps, modeButtonProps, nextButtonProps, previousButtonProps} = useCalendarProps(
        props,
        state,
    );

    React.useImperativeHandle(ref, () => ({
        focus() {
            state.setFocused(true);
        },
    }));

    return (
        <div {...calendarProps} className={b({size: props.size})}>
            <div className={b('header')}>
                <Button {...modeButtonProps} view="flat" size={props.size}>
                    {state.mode === 'years' ? (
                        <span key="label" className={b('mode-label', b(`years-label`))}>
                            {modeButtonProps.children}
                        </span>
                    ) : (
                        [
                            <span key="label" className={b('mode-label')}>
                                {modeButtonProps.children}
                            </span>,
                            <Button.Icon key="icon">
                                <ArrowToggle direction="bottom" />
                            </Button.Icon>,
                        ]
                    )}
                </Button>
                <div className={b('controls')}>
                    <Button {...previousButtonProps} view="flat" size={props.size}>
                        <Button.Icon>
                            <ArrowToggle direction="left" />
                        </Button.Icon>
                    </Button>
                    <Button {...nextButtonProps} view="flat" size={props.size}>
                        <Button.Icon>
                            <ArrowToggle direction="right" />
                        </Button.Icon>
                    </Button>
                </div>
            </div>
            <CalendarGrid state={state} />
        </div>
    );
});

interface CalendarGridProps {
    state: CalendarState;
}
function CalendarGrid({state}: CalendarGridProps) {
    const [prevState, setPrevState] = React.useState(() => ({...state, isFocused: false}));

    const modeChanged = state.mode !== prevState.mode;
    const startDateChanged = !state.startDate.isSame(prevState.startDate, 'days');

    let animation;
    if (modeChanged) {
        if (
            (state.mode === 'days' && prevState.mode === 'months') ||
            (state.mode === 'months' && prevState.mode === 'years')
        ) {
            animation = 'zoom-out';
        } else {
            animation = 'zoom-in';
        }
    } else if (startDateChanged) {
        if (state.startDate.isBefore(prevState.startDate)) {
            animation = 'forward';
        } else {
            animation = 'backward';
        }
    }

    const {gridProps} = useCalendarGridProps(state);

    return (
        <div className={b('grid')} {...gridProps}>
            {animation && (
                <Content className={b('previous-state')} state={prevState} animation={animation} />
            )}
            <Content
                key="current"
                className={b('current-state')}
                state={state}
                animation={animation}
                onAnimationEnd={() => {
                    setPrevState({...state, isFocused: false});
                }}
            />
        </div>
    );
}

interface ContentProps {
    className?: string;
    animation?: string;
    onAnimationEnd?: () => void;
    state: CalendarState;
}
function Content({className, state, animation, onAnimationEnd}: ContentProps) {
    return (
        <div
            className={b('content', {animation}, className)}
            onAnimationEnd={onAnimationEnd}
            role="presentation"
        >
            {state.mode === 'days' && <Weekdays state={state} />}
            <CalendarGridCells state={state} />
        </div>
    );
}

interface WeekdaysProps {
    state: CalendarState;
}
function Weekdays({state}: WeekdaysProps) {
    const weekdays = getWeekDays();

    return (
        <div className={b('grid-row')} role="row">
            {weekdays.map((date) => {
                return (
                    <div
                        key={date.day()}
                        className={b('weekday', {weekend: state.isWeekend(date)})}
                        role="columnheader"
                        aria-label={date.format('dddd')}
                    >
                        {date.format('dd')}
                    </div>
                );
            })}
        </div>
    );
}

interface CalendarGridProps {
    state: CalendarState;
}
function CalendarGridCells({state}: CalendarGridProps) {
    const rowsInPeriod = state.mode === 'days' ? 6 : 4;
    const columnsInRow = state.mode === 'days' ? 7 : 3;
    const days = getDaysInPeriod(state.startDate, state.endDate, state.mode);
    return (
        <div className={b('grid-rowgroup', {mode: state.mode})} role="rowgroup">
            {[...new Array(rowsInPeriod).keys()].map((rowIndex) => (
                <div key={rowIndex} className={b('grid-row')} role="row">
                    {days
                        .slice(rowIndex * columnsInRow, (rowIndex + 1) * columnsInRow)
                        .map((date) => {
                            return <CalendarCell key={date.unix()} date={date} state={state} />;
                        })}
                </div>
            ))}
        </div>
    );
}

interface CalendarCellProps {
    date: DateTime;
    state: CalendarState;
}
function CalendarCell({date, state}: CalendarCellProps) {
    const {
        cellProps,
        buttonProps,
        formattedDate,
        isDisabled,
        isSelected,
        isOutsideCurrentRange,
        isUnavailable,
        isCurrent,
        isWeekend,
    } = useCalendarCellProps(date, state);

    return (
        <div {...cellProps}>
            <div
                {...buttonProps}
                className={b('button', {
                    disabled: isDisabled,
                    selected: isSelected,
                    'out-of-boundary': isOutsideCurrentRange,
                    unavailable: isUnavailable,
                    current: isCurrent,
                    weekend: isWeekend,
                })}
            >
                {formattedDate}
            </div>
        </div>
    );
}
