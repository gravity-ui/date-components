import React from 'react';

import {guessUserTimeZone} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';
import {Minus, Plus} from '@gravity-ui/icons';
import {Button} from '@gravity-ui/uikit';

import {block} from '../../../../utils/cn';
import type {HasHandlesProp, Period, RulerConfiguration, RulerViewport} from '../../types';
import {ThinTimelineRulerViewport} from '../RulerViewport/RulerViewport';
import type {RenderSelectionOptions} from '../RulerViewport/RulerViewport';
import {DEFAULT_MAX_VIEWPORT_LENGTH, DEFAULT_MIN_VIEWPORT_LENGTH} from '../RulerViewport/constants';
import {Selection} from '../Selection/Selection';

import './ControlledRuler.scss';

interface ControlledThinTimelineRulerProps extends RulerConfiguration, HasHandlesProp {
    /** If display red line denoting current instant */
    displayNow?: boolean;

    /** Use this to customize rendering of selected period */
    renderSelection?: (opts: RenderSelectionOptions) => React.ReactNode;
    /** Use this to render additional SVG nodes on the ruler */
    renderAdditionalSvg?: (opts: RenderSelectionOptions) => React.ReactNode;
    /** Use this to allow custom rendering of time ticks */
    formatTime?: (time: DateTime) => string;

    /** '-' button click handler */
    onZoomIn?: () => void;
    /** '+' button click handler */
    onZoomOut?: () => void;
    /** Position of the '-' and '+' zoom buttons */
    zoomButtonsPosition?: 'left' | 'right';
    /** Gets invoked whenever selected period gets updated */
    onUpdate?: (value: Period) => void;
    /** Gets invoked whenever ruler viewport period gets updated */
    onViewportUpdate?: (value: RulerViewport) => void;

    /** Min ruler viewport length (ms) */
    viewportMinLength?: number;
    /** Max ruler viewport length (ms) */
    viewportMaxLength?: number;

    /** If disabled, prevents timeline drag. Default: true */
    isTimelineDragEnabled?: boolean;

    /**
     * Specify this if you want to override the timeZone used when parsing or formatting a date and time value.
     * If no timeZone is set, the default timeZone for the current user is used.
     */
    timeZone?: string;

    className?: string;
}

const b = block('thin-timeline-ruler');

export function ControlledThinTimelineRuler({
    start,
    end,
    viewportStart,
    viewportEnd,
    onZoomIn,
    onZoomOut,
    onUpdate,
    onViewportUpdate,
    renderSelection: customRenderSelection,
    renderAdditionalSvg,
    formatTime,
    displayNow,
    isTimelineDragEnabled = true,
    viewportMinLength = DEFAULT_MIN_VIEWPORT_LENGTH,
    viewportMaxLength = DEFAULT_MAX_VIEWPORT_LENGTH,
    hasHandles = true,
    timeZone = guessUserTimeZone(),
    className,
    zoomButtonsPosition = 'left',
}: ControlledThinTimelineRulerProps) {
    const hasControls = Boolean(onZoomIn || onZoomOut);

    const renderSelection = React.useMemo(() => {
        if (customRenderSelection) {
            return customRenderSelection;
        }

        // eslint-disable-next-line react/display-name, @typescript-eslint/no-shadow
        return ({viewportStart, viewportEnd, viewportWidth}: RenderSelectionOptions) => (
            <Selection
                start={start}
                end={end}
                viewportStart={viewportStart}
                viewportEnd={viewportEnd}
                viewportWidth={viewportWidth}
                onUpdate={onUpdate}
                hasHandles={hasHandles}
            />
        );
    }, [customRenderSelection, start, end, hasHandles, onUpdate]);

    return (
        <div className={b(null, className)}>
            {hasControls && zoomButtonsPosition === 'left'
                ? renderZoomControls({onZoomIn, onZoomOut, position: zoomButtonsPosition})
                : null}
            <ThinTimelineRulerViewport
                timeZone={timeZone}
                viewportStart={viewportStart}
                viewportEnd={viewportEnd}
                viewportMinStart={start}
                viewportMaxEnd={end}
                displayNow={displayNow}
                renderSelection={renderSelection}
                renderAdditionalSvg={renderAdditionalSvg}
                formatTime={formatTime}
                onUpdate={onViewportUpdate}
                viewportMinLength={viewportMinLength}
                viewportMaxLength={viewportMaxLength}
                isTimelineDragEnabled={isTimelineDragEnabled}
            />
            {hasControls && zoomButtonsPosition === 'right'
                ? renderZoomControls({onZoomIn, onZoomOut, position: zoomButtonsPosition})
                : null}
        </div>
    );
}

function renderZoomControls({
    onZoomIn,
    onZoomOut,
    position,
}: {
    onZoomIn?: () => void;
    onZoomOut?: () => void;
    position: 'left' | 'right';
}) {
    return (
        <div className={b('controls', {[position]: true})}>
            {onZoomIn && (
                <Button
                    view="flat-secondary"
                    size="s"
                    className={b('control-btn')}
                    onClick={onZoomIn}
                >
                    <Button.Icon>
                        <Plus />
                    </Button.Icon>
                </Button>
            )}
            {onZoomOut && (
                <Button
                    view="flat-secondary"
                    size="s"
                    className={b('control-btn')}
                    onClick={onZoomOut}
                >
                    <Button.Icon>
                        <Minus />
                    </Button.Icon>
                </Button>
            )}
        </div>
    );
}
