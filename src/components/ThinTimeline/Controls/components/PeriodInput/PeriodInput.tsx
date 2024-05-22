import React from 'react';

import {dateTimeParse, guessUserTimeZone} from '@gravity-ui/date-utils';
import {ChevronLeft, ChevronRight} from '@gravity-ui/icons';
import {Button, Icon} from '@gravity-ui/uikit';

import {block} from '../../../../../utils/cn';
import type {Value} from '../../../../RelativeDatePicker';
import {RelativeRangeDatePicker} from '../../../../RelativeRangeDatePicker';
import type {RangeValue} from '../../../../types';
import {useReferentiallyConstantObject} from '../../../hooks';

import {usePeriodShifter} from './hooks';
import {getRelativeRangeTitle, isRelativeRange} from './utils';

import './PeriodInput.scss';

interface PeriodInputProps {
    onUpdate: (value?: RangeValue<Value | null> | null) => void;
    alwaysShowAsAbsolute?: boolean;
    format: string;
    value?: RangeValue<Value | null> | null;
    withPresets?: boolean;
    withRangeDatePicker?: boolean;
    suggestLimit?: string;
    timeZone?: string;
}

const b = block('thin-timeline-period-input');

export function PeriodInput({
    value,
    alwaysShowAsAbsolute,
    onUpdate,
    format,
    withPresets = true,
    withRangeDatePicker = true,
    suggestLimit,
    timeZone = guessUserTimeZone(),
}: PeriodInputProps) {
    const period = useReferentiallyConstantObject({value: value});
    const shiftToPast = usePeriodShifter({
        coeff: -1,
        period: {
            start: period.value?.start || null,
            end: period.value?.end || null,
        },
        onUpdate,
    });
    const shiftToFuture = usePeriodShifter({
        coeff: +1,
        period: {
            start: period.value?.start || null,
            end: period.value?.end || null,
        },
        onUpdate,
    });

    const limitAbsoluteDates = {
        from: dateTimeParse(`now-${suggestLimit}`, {timeZone}),
        to: dateTimeParse('now', {timeZone}),
    };

    const isRelativeRangeDates =
        value?.start?.value &&
        value.end?.value &&
        typeof value.end?.value === 'string' &&
        typeof value.start.value === 'string' &&
        isRelativeRange(value.start.value, value.end.value);

    const getRangeTitle = isRelativeRangeDates
        ? (value?: RangeValue<Value | null> | null) => {
              const title = getRelativeRangeTitle(
                  value?.start && value.start.value && typeof value.start.value === 'string'
                      ? value.start.value
                      : '',
              );
              return title;
          }
        : undefined;

    return (
        <React.Fragment>
            {withRangeDatePicker && (
                <RelativeRangeDatePicker
                    size="s"
                    className={b('datepicker')}
                    value={value}
                    getRangeTitle={getRangeTitle}
                    onUpdate={onUpdate}
                    alwaysShowAsAbsolute={alwaysShowAsAbsolute}
                    allowNullableValues={false}
                    hasClear={false}
                    withPresets={withPresets}
                    withApplyButton
                    timeZone={timeZone}
                    minValue={suggestLimit ? limitAbsoluteDates.from : undefined}
                    maxValue={suggestLimit ? limitAbsoluteDates.to : undefined}
                    format={format}
                />
            )}
            <Button size="s" view="flat-secondary" onClick={shiftToPast}>
                <Icon data={ChevronLeft} />
            </Button>
            <Button size="s" view="flat-secondary" onClick={shiftToFuture}>
                <Icon data={ChevronRight} />
            </Button>
        </React.Fragment>
    );
}
