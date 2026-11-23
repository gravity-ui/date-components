'use client';

import React from 'react';

import {List, useDirection, useFocusWithin, useLayoutEffect} from '@gravity-ui/uikit';
import type {ListSize} from '@gravity-ui/uikit';

import {block} from '../../utils/cn';
import {filterDOMProps} from '../utils/filterDOMProps';

import {useTimeSelectionState} from './hooks/useTimeSelectionState';
import {i18n} from './i18n';
import type {TimeSelectionProps} from './types';
import type {TimeSelectionColumn, TimeSelectionItem} from './utils';

import './TimeSelection.scss';

const b = block('time-selection');

const COLUMN_LABEL_KEYS = {
    hours: 'Hours',
    meridiem: 'AM/PM',
    milliseconds: 'Milliseconds',
    minutes: 'Minutes',
    seconds: 'Seconds',
} as const;

const SELECTED_OPTION_SELECTOR = '[role="option"][aria-selected="true"]';

function scrollToCenter(container: HTMLElement, element: HTMLElement, smooth: boolean) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const top = Math.min(
        Math.max(element.offsetTop - (container.clientHeight - element.offsetHeight) / 2, 0),
        container.scrollHeight - container.clientHeight,
    );
    container.scrollTo({behavior: smooth && !reducedMotion ? 'smooth' : 'instant', top});
}

interface ScrollState {
    /** The option the column was last scrolled to: scrolling to it again would undo a manual scroll */
    scrolledId?: string;
    /** A column that has not been laid out yet (a hidden parent) has nothing to animate from */
    shown: boolean;
}

function centerSelectedOption(container: HTMLElement | null, state: ScrollState): ScrollState {
    if (!container || container.clientHeight === 0) {
        return state;
    }
    const element = container.querySelector<HTMLElement>(SELECTED_OPTION_SELECTOR);
    if (element && element.id !== state.scrolledId) {
        scrollToCenter(container, element, state.shown);
    } else if (!element && !state.shown) {
        // Nothing is selected yet: the list starts from its first row, past the room above it
        const first = container.querySelector<HTMLElement>('[role="option"]');
        container.scrollTo({behavior: 'instant', top: first?.offsetTop ?? 0});
    }
    return {scrolledId: element?.id, shown: true};
}

/** The root of the List is not focusable, its rows are: the selected one, or the tab stop */
function focusColumn(root: HTMLElement | null, column: TimeSelectionColumn) {
    const container = root?.querySelector<HTMLElement>(`[data-column="${column}"]`);
    if (!container || container.contains(document.activeElement)) {
        return;
    }
    const target =
        container.querySelector<HTMLElement>(
            `${SELECTED_OPTION_SELECTOR}:not([aria-disabled="true"])`,
        ) ?? container.querySelector<HTMLElement>('[role="option"][tabindex="0"]');
    if (!target) {
        return;
    }
    target.focus({preventScroll: true});
    const visible =
        target.offsetTop >= container.scrollTop &&
        target.offsetTop + target.offsetHeight <= container.scrollTop + container.clientHeight;
    if (!visible) {
        scrollToCenter(container, target, false);
    }
}

function getItemContent(item: TimeSelectionItem) {
    return <span className={b('item-text')}>{item.label}</span>;
}

function getItemTextValue(item: TimeSelectionItem) {
    return item.label;
}

interface TimeSelectionColumnViewProps {
    column: TimeSelectionColumn;
    items: TimeSelectionItem[];
    label: string;
    onFocusColumn: (column: TimeSelectionColumn) => void;
    onMove: (column: TimeSelectionColumn, offset: -1 | 1) => void;
    onSelect: (column: TimeSelectionColumn, item: TimeSelectionItem) => void;
    readOnly: boolean;
    selectedId: string | undefined;
    size: ListSize;
}

function TimeSelectionColumnView({
    column,
    items,
    label,
    onFocusColumn,
    onMove,
    onSelect,
    readOnly,
    selectedId,
    size,
}: TimeSelectionColumnViewProps) {
    const direction = useDirection();
    const containerRef = React.useRef<HTMLDivElement>(null);
    const scrollStateRef = React.useRef<ScrollState>({shown: false});
    // Only a column with focus has an active row (hover alone does not set one), so the column
    // is always entered at the selected option
    const [activeId, setActiveId] = React.useState<string | null>(null);

    useLayoutEffect(() => {
        scrollStateRef.current = centerSelectedOption(containerRef.current, scrollStateRef.current);
    }, [selectedId]);

    // A column that mounted hidden is centered when it gets its size
    React.useEffect(() => {
        const container = containerRef.current;
        if (!container || typeof ResizeObserver === 'undefined') {
            return undefined;
        }
        const observer = new ResizeObserver(() => {
            scrollStateRef.current = centerSelectedOption(container, scrollStateRef.current);
        });
        observer.observe(container);
        return () => observer.disconnect();
    }, []);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
            return;
        }
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            const forward = (event.key === 'ArrowRight') === (direction !== 'rtl');
            onMove(column, forward ? 1 : -1);
        }
    };

    return (
        <List
            ref={containerRef}
            role="listbox"
            aria-label={label}
            className={b('column')}
            size={size}
            items={items}
            getItemContent={getItemContent}
            getItemTextValue={getItemTextValue}
            selectionMode="single"
            selectedIds={selectedId === undefined ? [] : [selectedId]}
            activeItemId={activeId}
            onActiveItemUpdate={(id) => {
                if (containerRef.current?.contains(document.activeElement)) {
                    setActiveId(id);
                }
            }}
            onItemAction={(_id, item) => onSelect(column, item)}
            containerProps={{
                'aria-readonly': readOnly || undefined,
                'data-column': column,
                onBlur: (event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                        setActiveId(null);
                    }
                },
                onFocus: (event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                        onFocusColumn(column);
                    }
                },
                onKeyDown: handleKeyDown,
            }}
        />
    );
}

export function TimeSelection(props: TimeSelectionProps) {
    const {defaultFocusView, focusedView, onFocusViewUpdate, size = 'm'} = props;
    const state = useTimeSelectionState(props);
    const {t} = i18n.useTranslation();
    const rootRef = React.useRef<HTMLDivElement>(null);

    // The view the consumer already knows about: `onFocusViewUpdate` reports changes only
    const knownViewRef = React.useRef(focusedView ?? defaultFocusView);
    const defaultFocusViewRef = React.useRef(defaultFocusView);
    React.useEffect(() => {
        const view = focusedView ?? defaultFocusViewRef.current;
        defaultFocusViewRef.current = undefined;
        if (view) {
            knownViewRef.current = view;
            focusColumn(rootRef.current, view);
        }
    }, [focusedView]);

    // Focus moves after the picked value is rendered: the pick may change what is selected in
    // the next column (the value is kept within the range, the first pick fills every unit)
    const [focusRequest, setFocusRequest] = React.useState<{column: TimeSelectionColumn}>();
    useLayoutEffect(() => {
        if (focusRequest) {
            focusColumn(rootRef.current, focusRequest.column);
        }
    }, [focusRequest]);

    const getNeighbor = (column: TimeSelectionColumn, offset: -1 | 1) => {
        const index = state.columns.findIndex((entry) => entry.column === column);
        return index === -1 ? undefined : state.columns[index + offset]?.column;
    };

    const handleFocusColumn = (column: TimeSelectionColumn) => {
        if (column !== 'meridiem' && knownViewRef.current !== column) {
            knownViewRef.current = column;
            onFocusViewUpdate?.(column);
        }
    };

    const handleMove = (column: TimeSelectionColumn, offset: -1 | 1) => {
        const neighbor = getNeighbor(column, offset);
        if (neighbor) {
            focusColumn(rootRef.current, neighbor);
        }
    };

    const handleSelect = (column: TimeSelectionColumn, item: TimeSelectionItem) => {
        const next = getNeighbor(column, 1);
        if (state.selectItem(column, item) && next) {
            setFocusRequest({column: next});
        }
    };

    const {focusWithinProps} = useFocusWithin({
        onBlurWithin: props.onBlur,
        onFocusWithin: props.onFocus,
    });

    return (
        <div
            {...filterDOMProps(props, {labelable: true})}
            ref={rootRef}
            role="group"
            aria-disabled={state.disabled || undefined}
            className={b({disabled: state.disabled, size}, props.className)}
            style={props.style}
            {...focusWithinProps}
        >
            {state.columns.map(({column, items, selectedId}) => (
                <TimeSelectionColumnView
                    key={column}
                    column={column}
                    items={items}
                    label={t(COLUMN_LABEL_KEYS[column])}
                    onFocusColumn={handleFocusColumn}
                    onMove={handleMove}
                    onSelect={handleSelect}
                    readOnly={state.readOnly}
                    selectedId={selectedId}
                    size={size}
                />
            ))}
        </div>
    );
}
