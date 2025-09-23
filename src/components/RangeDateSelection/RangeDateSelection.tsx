'use client';

import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';
import {Minus, Plus} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';

import {block} from '../../utils/cn';
import type {AccessibilityProps, DomProps, StyleProps} from '../types';
import {filterDOMProps} from '../utils/filterDOMProps';

import {DateTimeRuler} from './components/Ruler/Ruler';
import type {ViewportDimensions, ViewportInterval} from './components/Ruler/Ruler';
import {SelectionControl} from './components/SelectionControl/SelectionControl';
import {useRangeDateSelectionState} from './hooks/useRangeDateSelectionState';
import type {RangeDateSelectionOptions} from './hooks/useRangeDateSelectionState';
import {i18n} from './i18n';

import './RangeDateSelection.scss';

const b = block('range-date-selection');

export interface RangeDateSelectionProps
    extends RangeDateSelectionOptions,
        DomProps,
        StyleProps,
        AccessibilityProps {
    /** Formats time ticks */
    formatTime?: (time: DateTime) => string;
    /** Displays now line */
    displayNow?: boolean;
    /** Enables dragging ruler */
    draggableRuler?: boolean;
    /** Displays buttons to scale selection */
    hasScaleButtons?: boolean;
    /** Position of scale buttons */
    scaleButtonsPosition?: 'start' | 'end';
    /** Renders additional svg content in the ruler */
    renderAdditionalRulerContent?: (props: {
        interval: ViewportInterval;
        dimensions: ViewportDimensions;
    }) => React.ReactNode;
}

export function RangeDateSelection(props: RangeDateSelectionProps) {
    const state = useRangeDateSelectionState(props);

    const [isDraggingRuler, setDraggingRuler] = React.useState(false);

    const handleRulerMoveStart = () => {
        state.setDraggingValue(state.value);
        setDraggingRuler(true);
    };
    const handleRulerMove = (d: number) => {
        const intervalWidth = state.viewportInterval.end.diff(state.viewportInterval.start);
        const delta = -Math.floor((d * intervalWidth) / 100);
        state.move(delta);
    };
    const handleRulerMoveEnd = () => {
        setDraggingRuler(false);
        state.endDragging();
    };

    let id = React.useId();
    id = props.id ?? id;

    const {t} = i18n.useTranslation();

    return (
        <div
            {...filterDOMProps(props, {labelable: true})}
            id={id}
            className={b(null, props.className)}
            style={props.style}
            dir="ltr" // TODO: RTL support
        >
            <DateTimeRuler
                className={b('ruler', {dragging: isDraggingRuler})}
                {...state.viewportInterval}
                onMoveStart={handleRulerMoveStart}
                onMove={props.draggableRuler ? handleRulerMove : undefined}
                onMoveEnd={handleRulerMoveEnd}
                dragDisabled={state.isDragging}
                displayNow={props.displayNow}
                minValue={props.minValue}
                maxValue={props.maxValue}
                formatTime={props.formatTime}
                timeZone={state.timeZone}
                renderAdditionalRulerContent={props.renderAdditionalRulerContent}
            >
                <SelectionControl className={b('selection')} state={state} aria-labelledby={id} />
            </DateTimeRuler>
            {props.hasScaleButtons ? (
                <div className={b('buttons', {position: props.scaleButtonsPosition ?? 'start'})}>
                    <Button
                        view="flat-secondary"
                        size="xs"
                        onClick={() => {
                            state.startDragging();
                            state.scale(0.5);
                            state.endDragging();
                        }}
                        aria-label={t('Decrease range')}
                    >
                        <Icon data={Minus} />
                    </Button>
                    <Button
                        view="flat-secondary"
                        size="xs"
                        onClick={() => {
                            state.startDragging();
                            state.scale(1.5);
                            state.endDragging();
                        }}
                        aria-label={t('Increase range')}
                    >
                        <Icon data={Plus} />
                    </Button>
                </div>
            ) : null}
        </div>
    );
}
