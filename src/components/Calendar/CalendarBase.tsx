import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';
import {ArrowToggle, Button} from '@gravity-ui/uikit';

import {block} from '../../utils/cn';
import type {AccessibilityProps, DomProps, FocusEvents, StyleProps} from '../types';

import type {RangeCalendarState} from './hooks/types';
import {useCalendarCellProps} from './hooks/useCalendarCellProps';
import {useCalendarGridProps} from './hooks/useCalendarGridProps';
import {useCalendarProps} from './hooks/useCalendarProps';
import type {CalendarState} from './hooks/useCalendarState';
import {calendarLayouts, getDaysInPeriod, getWeekDays} from './utils';

import './Calendar.scss';

const b = block('calendar');

export type CalendarSize = 'm' | 'l' | 'xl';

export interface CalendarInstance {
    focus: () => void;
}

export interface CalendarBaseProps extends DomProps, StyleProps, FocusEvents, AccessibilityProps {
    state: CalendarState | RangeCalendarState;
    /**
     * The size of the element.
     * @default m
     */
    size?: CalendarSize;
}
export const CalendarBase = React.forwardRef<CalendarInstance, CalendarBaseProps>(function Calendar(
    props: CalendarBaseProps,
    ref,
) {
    const {state} = props;
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
                    {state.availableModes.indexOf(state.mode) + 1 ===
                    state.availableModes.length ? (
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
    state: CalendarState | RangeCalendarState;
}
function CalendarGrid({state}: CalendarGridProps) {
    const [prevState, setPrevState] = React.useState(() => ({...state, isFocused: false}));

    const modeChanged = state.mode !== prevState.mode;
    const startDateChanged = !state.startDate.isSame(prevState.startDate, 'days');

    let animation;
    if (modeChanged) {
        if (calendarLayouts.indexOf(prevState.mode) > calendarLayouts.indexOf(state.mode)) {
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
    state: CalendarState | RangeCalendarState;
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
    state: CalendarState | RangeCalendarState;
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
    state: CalendarState | RangeCalendarState;
}
function CalendarGridCells({state}: CalendarGridProps) {
    const rowsInPeriod = state.mode === 'days' ? 6 : 4;
    const columnsInRow = state.mode === 'days' ? 7 : 3 + (state.mode === 'quarters' ? 1 : 0);
    const days = getDaysInPeriod(state.startDate, state.endDate, state.mode);
    return (
        <div className={b('grid-rowgroup', {mode: state.mode})} role="rowgroup">
            {[...new Array(rowsInPeriod).keys()].map((rowIndex) => (
                <div key={rowIndex} className={b('grid-row')} role="row">
                    {state.mode === 'quarters' ? (
                        <span role="rowheader" className={b('grid-rowgroup-header')}>
                            {days[rowIndex * columnsInRow].format('YYYY')}
                        </span>
                    ) : null}
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
    state: CalendarState | RangeCalendarState;
}
function CalendarCell({date, state}: CalendarCellProps) {
    const {
        cellProps,
        buttonProps,
        formattedDate,
        isDisabled,
        isSelected,
        isRangeSelection,
        isSelectionStart,
        isSelectionEnd,
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
                    'range-selection': isRangeSelection,
                    'selection-start': isSelectionStart,
                    'selection-end': isSelectionEnd,
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
