import React from 'react';

import {Flex} from '@gravity-ui/uikit';

import {block} from '../../utils/cn';

import type {TimeSelectionProps} from './TimeSelection.types';
import {Wheel} from './Wheel';
import {useTimeRanges, useTimeSelection} from './hooks';

import './TimeSelection.scss';

const b = block('time-selection');

const DEFAULT_VIEWS: TimeSelectionProps['views'] = ['hours', 'minutes'];

export const TimeSelection = ({
    ampm = false,
    views = DEFAULT_VIEWS,
    defaultValue,
    value,
    readOnly = false,
    disabled = false,
    onUpdate,
    timeSteps,
    isTimeDisabled,
    minValue,
    maxValue,
    focusedView,
    onFocusViewUpdate,
    timeZone,
}: TimeSelectionProps) => {
    const {currentValue, activeWheel, order, handleChange, handleActivate, getCurrentValue} =
        useTimeSelection({
            defaultValue,
            value,
            readOnly,
            disabled,
            timeZone,
            ampm,
            views: views || DEFAULT_VIEWS,
            focusedView,
            onUpdate,
            onFocusViewUpdate,
        });

    const ranges = useTimeRanges({
        ampm,
        timeSteps,
        isTimeDisabled,
        minValue,
        maxValue,
        value: currentValue,
    });

    const isNotLastWheel = (index: number): boolean => index !== order.length - 1;

    return (
        <Flex
            className={b({disabled, 'read-only': readOnly})}
            role="group"
            aria-label="Time selection"
            alignItems="flex-start"
            gap={2}
        >
            {order.map((key, index) => (
                <React.Fragment key={key}>
                    <Wheel
                        values={ranges[key] || []}
                        value={getCurrentValue(key)}
                        setValue={(val) => handleChange(key, val)}
                        isActive={activeWheel === key}
                        onActivate={() => handleActivate(key)}
                        isInfinite={false}
                        disabled={disabled || readOnly}
                    />
                    {isNotLastWheel(index) && <div className={b('divider')} />}
                </React.Fragment>
            ))}
        </Flex>
    );
};
