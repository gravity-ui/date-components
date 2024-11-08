import {dateTimeUtc, settings} from '@gravity-ui/date-utils';
import type {DateTime, DurationUnit} from '@gravity-ui/date-utils/build/typings';

import type {RangeValue} from '../../../types';
import {DAY, HOUR, MINUTE, MONTH, SECOND, WEEK, YEAR} from '../../../utils/constants';
import {getLerpCoeff} from '../../utils/span';

const MAX_TICKS = 100000;

interface TickSize {
    duration: number;
    period: DurationUnit;
    multiplier: number;
}
function makeTickSizes(
    periodSize: number,
    periodName: DurationUnit,
    ...multipliers: number[]
): TickSize[] {
    return multipliers.map((m) => ({
        duration: m * periodSize,
        period: periodName,
        multiplier: m,
    }));
}

const tickSizes = [
    ...makeTickSizes(SECOND, 'second', 1, 2, 5, 10, 15, 30),
    ...makeTickSizes(MINUTE, 'minute', 1, 2, 5, 10, 20, 30),
    ...makeTickSizes(HOUR, 'hour', 1, 2, 3, 6, 12),
    ...makeTickSizes(DAY, 'day', 1, 2, 3),
    ...makeTickSizes(WEEK, 'week', 1, 2),
    ...makeTickSizes(MONTH, 'month', 1, 2, 3, 6),
    ...makeTickSizes(YEAR, 'year', 1, 2, 5, 10, 15, 20, 30),
];

const TickFormat = {
    SECONDS: 'HH:mm:ss',
    MINUTES: 'HH:mm',
    DATE: 'DD.MM.YY',
    MONTH: 'MM-YYYY',
    YEAR: 'YYYY',
} as const;

interface FindTickSizeOpts {
    minWidth: number;
    maxWidth: number;
    timelineWidth: number;
    timelineDuration: number;
}

function findTickSize({minWidth, maxWidth, timelineWidth, timelineDuration}: FindTickSizeOpts) {
    const minDuration = (minWidth / timelineWidth) * timelineDuration;
    const maxDuration = (maxWidth / timelineWidth) * timelineDuration;

    const suitableSizes: TickSize[] = [];

    for (const size of tickSizes) {
        if (minDuration <= size.duration) {
            if (size.duration <= maxDuration) {
                suitableSizes.push(size);
            } else if (!suitableSizes.length) {
                return size;
            }
        }
    }

    if (!suitableSizes.length) {
        return tickSizes[tickSizes.length - 1];
    }

    return suitableSizes[Math.floor(suitableSizes.length / 2)];
}

interface CalculateTicksOptions {
    viewportStart: DateTime;
    viewportEnd: DateTime;
    minTickWidth: number;
    maxTickWidth: number;
    viewportWidth: number;

    timeZone?: string;
}

export function calculateTickTimes({
    viewportStart,
    viewportEnd,
    minTickWidth,
    maxTickWidth,
    viewportWidth,
    timeZone,
}: CalculateTicksOptions) {
    const tickSize = findTickSize({
        minWidth: minTickWidth,
        maxWidth: maxTickWidth,
        timelineDuration: viewportEnd.valueOf() - viewportStart.valueOf(),
        timelineWidth: viewportWidth,
    });

    let cursor: DateTime;
    const stableDate = dateTimeUtc({input: '1977-01-01'}).timeZone(
        timeZone || settings.getDefaultTimeZone(),
        true,
    );
    const diff = stableDate.diff(viewportStart, tickSize.period);
    const divider = tickSize.multiplier;
    const multiplier = Math.floor(diff / divider);
    cursor = stableDate.subtract(multiplier * divider, tickSize.period);
    if (viewportStart.isBefore(cursor)) {
        cursor = cursor.subtract(divider, tickSize.period);
    }
    const timeDiff = stableDate.utcOffset() - cursor.utcOffset();
    if (
        timeDiff !== 0 &&
        (tickSize.period === 'hour' || tickSize.period === 'minute' || tickSize.period === 'second')
    ) {
        cursor = cursor.add(timeDiff, 'minutes');
    }

    const ticks: number[] = [];

    let i = 0;
    let maxTickValue = cursor.valueOf();

    while (cursor.valueOf() < viewportEnd.valueOf()) {
        if (i >= MAX_TICKS) {
            throw new Error('TimeLine: too much ticks');
        }
        i++;
        ticks.push(cursor.valueOf());

        let next = cursor.add(tickSize.multiplier, tickSize.period);

        // Get time shift when season timeZone changed
        const timeDiff = cursor.utcOffset() - next.utcOffset();

        if (
            timeDiff !== 0 &&
            (tickSize.period === 'hour' ||
                tickSize.period === 'minute' ||
                tickSize.period === 'second')
        ) {
            // Tick should be on same local time distance. Then labels will have correct format (such as date/week/month)
            // For example, Amsterdam timezone:
            //
            //  2023-10-28T22:00Z -> Summer time is 2023-10-29T00:00, displays as 29.10.2023
            //  2023-10-29T22:00Z -> Winter time is 2023-10-29T23:00, displays as 23:00
            //
            //  Add 1h:
            //  2023-10-29T23:00Z -> Winter time is 2023-10-30T00:00, displays as 30.10.2023
            //
            next = next.add(timeDiff, 'minutes');

            let k = 1;
            while (next.valueOf() <= maxTickValue) {
                // Example of case, Amsterdam timezone:
                //  2023-03-26T00:00Z -> Winter time is 2023-03-26T01:00, displays as 01:00
                //  2023-03-26T01:00Z -> Summer time is 2023-03-26T03:00, displays as 03:00
                // We shift time on -1h... And again:
                //  2023-03-26T00:00Z -> Winter time is 2023-03-26T01:00, displays as 01:00
                // Infinite loop
                //
                // Therefore we need to skip period in the past
                next = next
                    .add(tickSize.multiplier * k++, tickSize.period)
                    .add(timeDiff, 'minutes');
            }
        }

        cursor = next;
        maxTickValue = Math.max(maxTickValue, cursor.valueOf());
    }

    return ticks;
}

export function formatTick(t: DateTime) {
    let format: string;

    if (t.valueOf() % MINUTE === 0) {
        if (t.hour() === 0 && t.minute() === 0) {
            if (t.date() === 1) {
                if (t.month() === 0) {
                    format = TickFormat.YEAR;
                } else {
                    format = TickFormat.MONTH;
                }
            } else {
                format = TickFormat.DATE;
            }
        } else {
            format = TickFormat.MINUTES;
        }
    } else {
        format = TickFormat.SECONDS;
    }

    return t.format(format);
}

export interface Geometry {
    (x: number): string;
}

interface MakeTicksOptions {
    tickHeight: number;
    viewportHeight: number;
}
export function makeMiddleTicksGeometry({tickHeight, viewportHeight}: MakeTicksOptions): Geometry {
    const tickYStart = (viewportHeight - tickHeight) / 2;
    return (x) => `M${x},${tickYStart}l0,${tickHeight}`;
}

export function makeSlitTicksGeometry({tickHeight, viewportHeight}: MakeTicksOptions): Geometry {
    const slitHeight = viewportHeight - 2 * tickHeight;
    return (x) => `M${x},0l0,${tickHeight}m0,${slitHeight}l0,${tickHeight}`;
}

export function makeUnavailableTicksGeometry({
    tickHeight,
    viewportHeight,
}: MakeTicksOptions): Geometry {
    const w = tickHeight;
    const h = viewportHeight;
    return (x) => `M${x},0l${h},${h}l${w},0l${-h},${-h}l${-w},0`;
}

export function calculatePosition(
    value: DateTime | undefined,
    interval: RangeValue<DateTime>,
    width: number,
) {
    if (!value) {
        return NaN;
    }
    const timeToXCoeff = getLerpCoeff(
        {start: interval.start.valueOf(), end: interval.end.valueOf()},
        {start: 0, end: width},
    );
    return Math.round((value.valueOf() - interval.start.valueOf()) * timeToXCoeff);
}
