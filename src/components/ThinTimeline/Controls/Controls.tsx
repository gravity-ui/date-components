import React from 'react';

import {guessUserTimeZone} from '@gravity-ui/date-utils';

import {block} from '../../../utils/cn';
import type {RelativeRangeDatePickerProps} from '../../RelativeRangeDatePicker';
import {MINUTE, SECOND} from '../constants';

import {PeriodInput, PresetsToolbar, RefreshIntervalSelect, StickToNowButton} from './components';
import {useStickToNowSwitcher} from './hooks';

import './Controls.scss';

const b = block('thin-timeline-controls');

export interface ThinTimelineControlsProps {
    value: RelativeRangeDatePickerProps['value'];

    /** Gets called whenever selected period, stickToNow, or period name are updated */
    onUpdate: (value: RelativeRangeDatePickerProps['value']) => void;

    /** Presets for toolbar at the top as duration strings (e.g. '1m', '15d', '1y') */
    toolbarPresets?: string[];
    /** Presets for date input popup as duration strings (e.g. '1m', '15d', '1y') */
    relativeRangesPalette?: string[];
    /** Enables/disables toolbar custom button that is used to input arbitrary duration string */
    hasCustomPresetInput?: boolean;

    /** Indicates whether to add a 'Now' block */
    withNow?: boolean;
    /** Indicates whether to show popup presets */
    withPresets?: boolean;
    /** Indicates whether to add a range date picker block */
    withRangeDatePicker?: boolean;

    /** Set one of proposed date and time formats in Datepicker [Available formats](https://day.js.org/docs/en/display/format) */
    format?: string;
    /** Indicates whether to add a refresh block */
    withRefresh?: boolean;
    /** Selected refresh interval value (milliseconds, 0 = off) */
    refreshInterval?: number;
    /** Available refresh interval options (milliseconds, 0 = off) */
    availableRefreshIntervals?: number[];
    alwaysShowAsAbsolute?: boolean;
    /** Gets invoked whenever refresh interval is updated */
    onRefreshIntervalUpdate?: (value: number) => void;
    /** Gets invoked when refresh button is clicked */
    onRefreshClick?: () => void;
    /**
     * If `true`, selected refresh interval is rendered as human-readable string;
     * otherwise shorthand duration string is used (e.g. '30s')
     */
    humanReadableActiveRefreshInterval?: boolean;
    /**
     * Allows to specify a default refresh interval. If 'Now' button gets clicked,
     * this interval will be automatically enabled.
     * If not provided, the first non-zero value from `availableRefreshIntervals`
     * will be taken.
     */
    defaultRefreshInterval?: number;

    className?: string;

    /**
     * Custom content to render before all toolbar items.
     * Can be utilized to reuse the same flex container as the rest of the toolbar.
     */
    prepend?: React.ReactNode;
    /** Same as `prepend`, but after all toolbar items. */
    append?: React.ReactNode;

    /**
     * This prop can be used to specify the point of maximal interest in the
     * selected period. 0 means the earliest point, 1 means the latest, 0.5 can
     * be used to mark the middle of the selected period.
     *
     * When 'Now' button is pressed, this point is set to match current datetime.
     */
    pointOfMaxInterest?: number;

    /**
     * Maximum time limit for suggest values
     * By default, suggest includes values up to '2y'
     * With this prop you can set max suggest value
     */
    suggestLimit?: string;

    /**
     * Specify this if you want to override the timeZone used when parsing or formatting a date and time value.
     * If no timeZone is set, the default timeZone for the current user is used.
     */
    timeZone?: string;
}

const defaultPresets = ['30m', '1h', '1d', '1w'];
const defaultRefreshIntervals = [15 * SECOND, MINUTE, 2 * MINUTE, 5 * MINUTE, 0];

export function ThinTimelineControls({
    value,
    onUpdate,

    toolbarPresets = defaultPresets,
    hasCustomPresetInput = true,

    withNow = true,
    withPresets = true,
    withRangeDatePicker = true,

    withRefresh = true,
    format = 'DD.MM.YYYY HH:mm',
    refreshInterval = 0,
    availableRefreshIntervals = defaultRefreshIntervals,
    alwaysShowAsAbsolute = true,
    onRefreshIntervalUpdate = () => {},
    onRefreshClick,
    humanReadableActiveRefreshInterval = false,

    className,
    timeZone = guessUserTimeZone(),
    prepend,
    append,
    pointOfMaxInterest = 1,
    suggestLimit,
}: ThinTimelineControlsProps) {
    const {enableStickToNow} = useStickToNowSwitcher({
        value,
        stickToNow: false,
        pointOfMaxInterest,
        onUpdate,
    });

    return (
        <div className={b(null, className)}>
            {prepend}
            <PeriodInput
                timeZone={timeZone}
                value={value}
                onUpdate={onUpdate}
                alwaysShowAsAbsolute={alwaysShowAsAbsolute}
                format={format}
                withPresets={withPresets}
                withRangeDatePicker={withRangeDatePicker}
                suggestLimit={suggestLimit}
            />
            {withNow && (
                <StickToNowButton className={b('now-btn')} enableStickToNow={enableStickToNow} />
            )}
            <div className={b('separator')} />
            <PresetsToolbar
                value={value}
                onUpdate={onUpdate}
                presets={toolbarPresets}
                hasCustom={hasCustomPresetInput}
                customPresetButtonSuggestLimit={suggestLimit}
            />
            {withRefresh && (
                <React.Fragment>
                    <div className={b('separator')} />
                    <RefreshIntervalSelect
                        refreshInterval={refreshInterval}
                        options={availableRefreshIntervals}
                        onRefreshIntervalUpdate={onRefreshIntervalUpdate}
                        onRefreshClick={onRefreshClick}
                        useText={humanReadableActiveRefreshInterval}
                    />
                </React.Fragment>
            )}
            {append}
        </div>
    );
}
