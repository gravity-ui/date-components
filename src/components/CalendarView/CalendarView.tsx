'use client';

import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';
import {ArrowToggle, ButtonIcon} from '@gravity-ui/uikit';

import {block} from '../../utils/cn';
import {DEFAULT_SLOT, Provider, useGuardedContext, useRenderProps} from '../../utils/providers';
import type {ContextValue, RenderProps} from '../../utils/providers';
import type {CalendarProps} from '../Calendar';
import type {RangeCalendarProps} from '../RangeCalendar';
import {Button, ButtonContext} from '../common/Button';
import {Text, TextContext} from '../common/Text';
import type {AccessibilityProps, DomProps, FocusEvents, StyleProps} from '../types';
import {formatDateTime} from '../utils/dates';
import {filterDOMProps} from '../utils/filterDOMProps';
import {mergeProps} from '../utils/mergeProps';

import type {CalendarLayout, RangeCalendarState} from './hooks/types';
import {useCalendarCellProps} from './hooks/useCalendarCellProps';
import {useCalendarGridProps} from './hooks/useCalendarGridProps';
import {useCalendarProps} from './hooks/useCalendarProps';
import type {CalendarState} from './hooks/useCalendarState';
import {calendarLayouts, getDaysInPeriod, getWeekDays} from './utils';

import './Calendar.scss';

const b = block('calendar');

export type CalendarSize = 'm' | 'l' | 'xl';

export const CalendarStateContext = React.createContext<CalendarState | RangeCalendarState | null>(
    null,
);
export const CalendarContext =
    React.createContext<ContextValue<CalendarProps | RangeCalendarProps, HTMLDivElement>>(null);

/*
<Calendar>
    <Flex justifyContent="space-between">
        <Button slot="previous" />
        <CalendarModeSwitcher />
        <Button slot="next" />
    </Flex>
    <CalendarGrid>
        <CalendarGridHeader>
            <div role="columnheader" aria-label="week year">#</div>
            <CalendarGridHeaderCells>
                {(date) => <CalendarGridHeaderCell date={date} />}
            </CalendarGridHeaderCells>
        </CalendarGridHeader>
        <CalendarGridBody>
            <CalendarGridRow>
                <CalendarGridRowHeader>{({dates}) => dates[0].format('W')}</CalendarGridRowHeader>
                <CalendarGridRowCells>
                    {(date) => <CalendarGridRowCell day={day} />}
                </CalendarGridRowCells>
            </CalendarGridRow>
        </CalendarGridBody>
    </CalendarGrid>
</Calendar>
*/

const CalendarGridForwardRef = React.forwardRef(CalendarGrid);
export {CalendarGridForwardRef as CalendarGrid};

const CalendarLayoutSwitcherForwardRef = React.forwardRef(CalendarLayoutSwitcher);
export {CalendarLayoutSwitcherForwardRef as CalendarLayoutSwitcher};

const CalendarGridHeaderForwardRef = React.forwardRef(CalendarGridHeader);
export {CalendarGridHeaderForwardRef as CalendarGridHeader};

const CalendarGridHeaderCellForwardRef = React.forwardRef(CalendarGridHeaderCell);
export {CalendarGridHeaderCellForwardRef as CalendarGridHeaderCell};

const CalendarGridCellsForwardRef = React.forwardRef(CalendarGridCells);
export {CalendarGridCellsForwardRef as CalendarGridBody};

const CalendarGridRowForwardRef = React.forwardRef(CalendarGridRow);
export {CalendarGridRowForwardRef as CalendarGridRow};

const CalendarGridRowHeaderForwardRef = React.forwardRef(CalendarGridRowHeader);
export {CalendarGridRowHeaderForwardRef as CalendarGridRowHeader};

const CalendarCellForwardRef = React.forwardRef(CalendarCell);
export {CalendarCellForwardRef as CalendarCell};

export interface CalendarViewProps
    extends DomProps,
        FocusEvents,
        AccessibilityProps,
        RenderProps<any> {
    /**
     * The size of the element.
     * @default m
     */
    size?: CalendarSize;
}
export const CalendarView = React.forwardRef<HTMLDivElement, CalendarViewProps>(function Calendar(
    props: CalendarViewProps,
    ref,
) {
    const state = useGuardedContext(CalendarStateContext);
    const {calendarProps, modeButtonProps, nextButtonProps, previousButtonProps} = useCalendarProps(
        props,
        state,
    );

    const renderProps = useRenderProps({
        ...props,
        values: {
            state,
        },
        defaultClassName: b({size: props.size}),
        defaultChildren: (
            <React.Fragment>
                <header className={b('header')}>
                    <CalendarLayoutSwitcherForwardRef />
                    <div className={b('controls')}>
                        <Button slot="previous" />
                        <Button slot="next" />
                    </div>
                </header>
                <CalendarGridForwardRef />
            </React.Fragment>
        ),
    });

    return (
        <div ref={ref} {...mergeProps(calendarProps, renderProps)}>
            <Provider
                values={[
                    [
                        ButtonContext,
                        {
                            slots: {
                                previous: previousButtonProps,
                                next: nextButtonProps,
                                mode: modeButtonProps,
                                [DEFAULT_SLOT]: {},
                            },
                        },
                    ],
                    [
                        TextContext,
                        {
                            slots: {
                                heading: {
                                    as: 'h2',
                                    'aria-hidden': true,
                                    children: modeButtonProps.children,
                                    variant: 'subheader-2',
                                },
                                [DEFAULT_SLOT]: {},
                            },
                        },
                    ],
                    [CalendarStateContext, state],
                ]}
            >
                <h2 className={b('heading')}>{calendarProps['aria-label']}</h2>
                {renderProps.children}
            </Provider>
        </div>
    );
});

function CalendarLayoutSwitcher(_props: {}, ref: React.ForwardedRef<HTMLButtonElement>) {
    const state = useGuardedContext(CalendarStateContext);
    return (
        <Button ref={ref} slot="mode">
            {state.availableModes.indexOf(state.mode) + 1 === state.availableModes.length ? (
                <Text slot="heading" as="span" color="hint" variant="inherit" />
            ) : (
                <React.Fragment>
                    <Text key="label" slot="heading" as="span" variant="inherit" />
                    <ButtonIcon key="icon">
                        <ArrowToggle direction="bottom" />
                    </ButtonIcon>
                </React.Fragment>
            )}
        </Button>
    );
}

interface CalendarGridProps extends StyleProps {
    disableAnimation?: boolean;
    children?: React.ReactElement | React.ReactElement[] | ((date: DateTime) => React.ReactElement);
}
function CalendarGrid(props: CalendarGridProps, ref: React.ForwardedRef<HTMLDivElement>) {
    const state = useGuardedContext(CalendarStateContext);
    const [prevState, setPrevState] = React.useState(() => ({
        ...state,
        isFocused: false,
    }));

    const {gridProps} = useCalendarGridProps(state);
    const children = props.children ?? ((date) => <CalendarCellForwardRef date={date} />);

    if (props.disableAnimation) {
        return (
            <div
                {...gridProps}
                ref={ref}
                className={b('grid', props.className)}
                style={props.style}
            >
                <Content className={b('current-state')}>{children}</Content>
            </div>
        );
    }

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

    return (
        <div {...gridProps} ref={ref} className={b('grid', props.className)} style={props.style}>
            {animation && (
                <Provider values={[[CalendarStateContext, prevState]]}>
                    <Content className={b('previous-state')} animation={animation}>
                        {children}
                    </Content>
                </Provider>
            )}
            <Content
                key="current"
                className={b('current-state')}
                animation={animation}
                onAnimationEnd={() => {
                    setPrevState({...state, isFocused: false});
                }}
            >
                {children}
            </Content>
        </div>
    );
}

interface ContentProps extends StyleProps {
    children?: React.ReactElement | React.ReactElement[] | ((date: DateTime) => React.ReactElement);
    animation?: string;
    onAnimationEnd?: () => void;
}
function Content({className, animation, onAnimationEnd, children}: ContentProps) {
    return (
        <div
            className={b('content', {animation}, className)}
            onAnimationEnd={onAnimationEnd}
            role="presentation"
        >
            {typeof children === 'function' ? (
                <React.Fragment>
                    <CalendarGridHeaderForwardRef>
                        {(date) => <CalendarGridHeaderCellForwardRef date={date} />}
                    </CalendarGridHeaderForwardRef>
                    <CalendarGridCellsForwardRef>{children}</CalendarGridCellsForwardRef>
                </React.Fragment>
            ) : (
                children
            )}
        </div>
    );
}

interface CalendarGridHeaderProps extends StyleProps {
    children?: React.ReactElement | React.ReactElement[] | ((day: DateTime) => React.ReactElement);
}
function CalendarGridHeader(
    {children, className, style}: CalendarGridHeaderProps,
    ref: React.ForwardedRef<HTMLDivElement>,
) {
    const state = useGuardedContext(CalendarStateContext);
    if (state.mode !== 'days') {
        return null;
    }
    return (
        <div role="row" ref={ref} className={b('grid-row', className)} style={style}>
            {typeof children === 'function' ? (
                <CalendarGridHeaderCells>{children}</CalendarGridHeaderCells>
            ) : (
                children
            )}
        </div>
    );
}

export function CalendarGridHeaderCells({
    children,
}: {
    children: (day: DateTime) => React.ReactElement;
}) {
    const state = useGuardedContext(CalendarStateContext);
    const weekdays = getWeekDays(state);
    return weekdays.map((date) => React.cloneElement(children(date), {key: date.unix()}));
}

interface CalendarGridHeaderCellRenderProps {
    date: DateTime;
}

interface CalendarGridHeaderCellProps extends RenderProps<CalendarGridHeaderCellRenderProps> {
    date: DateTime;
}
function CalendarGridHeaderCell(
    {date, ...props}: CalendarGridHeaderCellProps,
    ref: React.ForwardedRef<HTMLDivElement>,
) {
    const state = useGuardedContext(CalendarStateContext);
    const renderProps = useRenderProps({
        ...props,
        values: {
            date,
        },
        defaultChildren: formatDateTime(date, 'dd', state.timeZone),
        defaultClassName: b('weekday', {weekend: state.isWeekend(date)}),
    });
    return (
        <div
            {...renderProps}
            ref={ref}
            role="columnheader"
            aria-label={formatDateTime(date, 'dddd', state.timeZone)}
        />
    );
}

const calendarGridRowContext = React.createContext<{days: DateTime[]} | null | undefined>(null);
interface CalendarGridCellsProps extends StyleProps {
    children: React.ReactNode | ((date: DateTime) => React.ReactElement);
}
function CalendarGridCells(
    {className, style, children}: CalendarGridCellsProps,
    ref: React.ForwardedRef<HTMLDivElement>,
) {
    const state = useGuardedContext(CalendarStateContext);
    const rowsInPeriod = state.mode === 'days' ? 6 : 4;
    const columnsInRow = state.mode === 'days' ? 7 : 3 + (state.mode === 'quarters' ? 1 : 0);
    const days = getDaysInPeriod(state);
    return (
        <div
            ref={ref}
            className={b('grid-rowgroup', {mode: state.mode}, className)}
            style={style}
            role="rowgroup"
        >
            {[...new Array(rowsInPeriod).keys()].map((rowIndex) => (
                <Provider
                    key={rowIndex}
                    values={[
                        [
                            calendarGridRowContext,
                            {
                                days: days.slice(
                                    rowIndex * columnsInRow,
                                    (rowIndex + 1) * columnsInRow,
                                ),
                            },
                        ],
                    ]}
                >
                    <CalendarGridRowForwardRef>{children}</CalendarGridRowForwardRef>
                </Provider>
            ))}
        </div>
    );
}

interface CalendarGridRowProps {
    children: React.ReactNode | ((date: DateTime) => React.ReactElement);
}
function CalendarGridRow(
    {children}: CalendarGridRowProps,
    ref: React.ForwardedRef<HTMLDivElement>,
) {
    const state = useGuardedContext(CalendarStateContext);
    return (
        <div className={b('grid-row')} role="row" ref={ref}>
            {typeof children === 'function' ? (
                <React.Fragment>
                    <CalendarGridRowHeaderForwardRef>
                        {({days}) => {
                            if (state.mode !== 'quarters') {
                                return null;
                            }
                            return formatDateTime(days[0], 'YYYY', state.timeZone);
                        }}
                    </CalendarGridRowHeaderForwardRef>
                    <CalendarGridRowCells>{children}</CalendarGridRowCells>
                </React.Fragment>
            ) : (
                children
            )}
        </div>
    );
}

interface CalendarGridRowCellsProps {
    children: (date: DateTime) => React.ReactElement;
}

export function CalendarGridRowCells({children}: CalendarGridRowCellsProps) {
    const {days} = useGuardedContext(calendarGridRowContext);
    return days.map((date) => {
        return React.cloneElement(children(date), {key: date.unix()});
    });
}

interface CalendarGridRowHeaderProps extends StyleProps {
    children: (props: {days: DateTime[]}) => React.ReactNode;
}
function CalendarGridRowHeader(
    {children, className, style}: CalendarGridRowHeaderProps,
    ref: React.ForwardedRef<HTMLDivElement>,
) {
    const {days} = useGuardedContext(calendarGridRowContext);
    const content = children({days});
    if (!content) {
        return null;
    }
    return (
        <div
            ref={ref}
            role="rowheader"
            className={b('grid-rowgroup-header', className)}
            style={style}
        >
            {content}
        </div>
    );
}

interface CalendarCellRenderProps {
    date: DateTime;
    mode: CalendarLayout;
    formattedDate: string;
    isDisabled: boolean;
    isSelected: boolean;
    isFocused: boolean;
    isRangeSelection: boolean;
    isSelectionStart: boolean;
    isSelectionEnd: boolean;
    isOutsideCurrentRange: boolean;
    isUnavailable: boolean;
    isCurrent: boolean;
    isWeekend: boolean;
}
interface CalendarCellProps extends RenderProps<CalendarCellRenderProps> {
    date: DateTime;
}
function CalendarCell(
    {date, ...props}: CalendarCellProps,
    ref: React.ForwardedRef<HTMLDivElement>,
) {
    const state = useGuardedContext(CalendarStateContext);
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
        isFocused,
    } = useCalendarCellProps(date, state);

    const defaultClassName = b('button', {
        disabled: isDisabled,
        selected: isSelected,
        'range-selection': isRangeSelection,
        'selection-start': isSelectionStart,
        'selection-end': isSelectionEnd,
        'out-of-boundary': isOutsideCurrentRange,
        unavailable: isUnavailable,
        current: isCurrent,
        weekend: isWeekend,
    });
    const renderProps = useRenderProps({
        ...props,
        defaultChildren: formattedDate,
        defaultClassName,
        values: {
            date,
            mode: state.mode,
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
            isFocused,
        },
    });

    return (
        <div ref={ref} {...cellProps}>
            <div {...mergeProps(filterDOMProps(props as any), buttonProps, renderProps)} />
        </div>
    );
}
