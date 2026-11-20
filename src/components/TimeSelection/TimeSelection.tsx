'use client';

import React from 'react';

import {List, useDirection, useFocusWithin, useLayoutEffect} from '@gravity-ui/uikit';

import {block} from '../../utils/cn';
import {filterDOMProps} from '../utils/filterDOMProps';

import {useTimeSelectionState} from './hooks/useTimeSelectionState';
import {i18n} from './i18n';
import type {TimeSelectionProps} from './types';
import type {TimeSelectionColumn, TimeSelectionItem} from './utils';

import './TimeSelection.scss';

const b = block('time-selection');

const COLUMN_LABELS = {
    hours: 'Hours',
    minutes: 'Minutes',
    seconds: 'Seconds',
    meridiem: 'AM/PM',
} as const;

const SELECTED_OPTION_SELECTOR = '[role="option"][aria-selected="true"]';

function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Puts the option in the middle of the column; next to the edges of the list — as close as it gets */
function scrollToCenter(container: HTMLElement, element: HTMLElement, smooth: boolean) {
    const maxScrollTop = container.scrollHeight - container.clientHeight;
    const top = Math.min(
        Math.max(element.offsetTop - (container.clientHeight - element.offsetHeight) / 2, 0),
        maxScrollTop,
    );
    container.scrollTo({top, behavior: smooth && !prefersReducedMotion() ? 'smooth' : 'instant'});
}

function isFullyVisible(container: HTMLElement, element: HTMLElement) {
    return (
        element.offsetTop >= container.scrollTop &&
        element.offsetTop + element.offsetHeight <= container.scrollTop + container.clientHeight
    );
}

/**
 * Moves DOM focus into the column: to the selected option, otherwise to the tab stop of the list.
 * The root of the `List` is not focusable itself, its rows are.
 */
function focusColumnElement(container: HTMLElement) {
    if (container.contains(document.activeElement)) {
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
    if (!isFullyVisible(container, target)) {
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
    selectedId: string | undefined;
    label: string;
    size: NonNullable<TimeSelectionProps['size']>;
    registerColumn: (column: TimeSelectionColumn, element: HTMLElement | null) => void;
    onSelect: (column: TimeSelectionColumn, item: TimeSelectionItem) => void;
    onMove: (column: TimeSelectionColumn, offset: -1 | 1) => void;
    onFocusColumn: (column: TimeSelectionColumn) => void;
}

function TimeSelectionColumnView({
    column,
    items,
    selectedId,
    label,
    size,
    registerColumn,
    onSelect,
    onMove,
    onFocusColumn,
}: TimeSelectionColumnViewProps) {
    const direction = useDirection();
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    // The active row is dropped when focus leaves the column, so that the column is always
    // entered at the selected option
    const [activeId, setActiveId] = React.useState<string | null>(null);
    const selectedIds = React.useMemo(
        () => (selectedId === undefined ? [] : [selectedId]),
        [selectedId],
    );

    const setContainer = React.useCallback(
        (element: HTMLDivElement | null) => {
            containerRef.current = element;
            registerColumn(column, element);
        },
        [column, registerColumn],
    );

    // The option the column was last scrolled to: scrolling to it again would undo a manual scroll
    const scrolledIdRef = React.useRef<string | undefined>(undefined);
    const mountedRef = React.useRef(false);
    useLayoutEffect(() => {
        const smooth = mountedRef.current;
        mountedRef.current = true;
        const container = containerRef.current;
        if (selectedId === undefined) {
            scrolledIdRef.current = undefined;
            return;
        }
        if (!container || scrolledIdRef.current === selectedId) {
            return;
        }
        const element = container.querySelector<HTMLElement>(SELECTED_OPTION_SELECTOR);
        if (!element || container.clientHeight === 0) {
            return;
        }
        scrolledIdRef.current = selectedId;
        scrollToCenter(container, element, smooth);
    }, [selectedId]);

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
            ref={setContainer}
            role="listbox"
            aria-label={label}
            className={b('column')}
            size={size}
            items={items}
            getItemContent={getItemContent}
            getItemTextValue={getItemTextValue}
            selectionMode="single"
            selectedIds={selectedIds}
            activeItemId={activeId}
            onActiveItemUpdate={setActiveId}
            onItemAction={(_id, item) => onSelect(column, item)}
            containerProps={{
                onKeyDown: handleKeyDown,
                onFocus: (event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                        onFocusColumn(column);
                    }
                },
                onBlur: (event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                        setActiveId(null);
                    }
                },
            }}
        />
    );
}

export function TimeSelection(props: TimeSelectionProps) {
    const {size = 'm', focusedView, defaultFocusView, onFocusViewUpdate} = props;
    const state = useTimeSelectionState(props);
    const {t} = i18n.useTranslation();

    const columnElementsRef = React.useRef(new Map<TimeSelectionColumn, HTMLElement>());
    const registerColumn = React.useCallback(
        (column: TimeSelectionColumn, element: HTMLElement | null) => {
            if (element) {
                columnElementsRef.current.set(column, element);
            } else {
                columnElementsRef.current.delete(column);
            }
        },
        [],
    );
    const focusColumn = React.useCallback((column: TimeSelectionColumn) => {
        const element = columnElementsRef.current.get(column);
        if (element) {
            focusColumnElement(element);
        }
    }, []);

    // The view the consumer already knows about: `onFocusViewUpdate` reports changes only
    const [initialView] = React.useState(focusedView ?? defaultFocusView);
    const knownViewRef = React.useRef(initialView);
    const mountedRef = React.useRef(false);
    React.useEffect(() => {
        const view = mountedRef.current ? focusedView : initialView;
        mountedRef.current = true;
        if (view) {
            knownViewRef.current = view;
            focusColumn(view);
        }
    }, [focusedView, initialView, focusColumn]);

    const handleFocusColumn = (column: TimeSelectionColumn) => {
        if (column !== 'meridiem' && knownViewRef.current !== column) {
            knownViewRef.current = column;
            onFocusViewUpdate?.(column);
        }
    };

    const moveFocus = (column: TimeSelectionColumn, offset: -1 | 1) => {
        const index = state.columns.findIndex((item) => item.column === column);
        const next = state.columns[index + offset];
        if (index !== -1 && next) {
            focusColumn(next.column);
        }
    };

    const handleSelect = (column: TimeSelectionColumn, item: TimeSelectionItem) => {
        if (state.selectItem(column, item)) {
            moveFocus(column, 1);
        }
    };

    const {focusWithinProps} = useFocusWithin({
        onFocusWithin: props.onFocus,
        onBlurWithin: props.onBlur,
    });

    return (
        <div
            {...filterDOMProps(props, {labelable: true})}
            role="group"
            aria-disabled={state.disabled || undefined}
            className={b({size, disabled: state.disabled}, props.className)}
            style={props.style}
            {...focusWithinProps}
        >
            {state.columns.map(({column, items, selectedId}) => (
                <TimeSelectionColumnView
                    key={column}
                    column={column}
                    items={items}
                    selectedId={selectedId}
                    label={t(COLUMN_LABELS[column])}
                    size={size}
                    registerColumn={registerColumn}
                    onSelect={handleSelect}
                    onMove={moveFocus}
                    onFocusColumn={handleFocusColumn}
                />
            ))}
        </div>
    );
}
