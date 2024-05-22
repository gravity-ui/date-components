import {dateTime} from '@gravity-ui/date-utils';
import type {DateTime, DurationUnit} from '@gravity-ui/date-utils/build/typings';

import {DAY, HOUR, MINUTE, MONTH, SECOND, WEEK, YEAR} from '../../constants';
import type {RulerViewport} from '../../types';

const MAX_TICKS = 100000;

const periods = [
    [SECOND, 'second'],
    [MINUTE, 'minute'],
    [HOUR, 'hour'],
    [DAY, 'day'],
    [WEEK, 'week'],
    [MONTH, 'month'],
    [YEAR, 'year'],
] as const;

interface TickSize {
    duration: number;
    period: DurationUnit;
    multiplier: number;
}
const makeTickSizes = (periodSize: number, periodName: DurationUnit, ...muls: number[]) =>
    muls.map(
        (m): TickSize => ({
            duration: m * periodSize,
            period: periodName,
            multiplier: m,
        }),
    );

function getTimezoneOffset(dt: DateTime, timeZone?: string) {
    // Dayjs bug: dateTime({ input, timeZone }) sometimes create DateTime with zero timeZone
    // Second dateTime({ input, timeZone }) works correctly and I do it here
    return -dateTime({input: dt.valueOf(), timeZone}).utcOffset();
}

const tickSizes = [
    ...makeTickSizes(SECOND, 'second', 1, 2, 5, 10, 15, 30),
    ...makeTickSizes(MINUTE, 'minute', 1, 2, 5, 10, 20, 30),
    ...makeTickSizes(HOUR, 'hour', 1, 2, 3, 6, 12),
    ...makeTickSizes(DAY, 'day', 1, 2, 3),
    ...makeTickSizes(WEEK, 'week', 1, 2),
    ...makeTickSizes(MONTH, 'month', 1, 2, 3, 6),
    ...makeTickSizes(YEAR, 'year', 1, 2, 5),
];

enum TickFormat {
    SECONDS = 'HH:mm:ss',
    MINUTES = 'HH:mm',
    DATE = 'DD.MM.YY',
    MONTH = 'MM-YYYY',
    YEAR = 'YYYY',
}

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

interface CalculateTicksOptions extends RulerViewport {
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
        timelineDuration: viewportEnd - viewportStart,
        timelineWidth: viewportWidth,
    });

    let supremum: DurationUnit = 'year';
    for (const [periodSize, name] of periods) {
        if (tickSize.duration < periodSize) {
            supremum = name;
            break;
        }
    }

    let cursor = dateTime({input: viewportStart, timeZone}).startOf(supremum);
    const ticks: number[] = [];

    let i = 0;
    let maxTickValue = cursor.valueOf();

    while (cursor.valueOf() < viewportEnd) {
        if (i >= MAX_TICKS) {
            throw new Error('TimeLine: too much ticks');
        }
        i++;
        ticks.push(cursor.valueOf());

        let next = dateTime({
            // It safe to add time to UTC date, because UTC hasn't season time transition
            // Time zone bugs: https://github.com/iamkun/dayjs/issues?q=is%3Aissue+is%3Aopen+timezone
            input: dateTime({input: cursor, timeZone: 'UTC'})
                .add(tickSize.multiplier, tickSize.period)
                .valueOf(),

            timeZone,
        });

        // Get time shift when season timeZone changed
        const timeDiff = getTimezoneOffset(next, timeZone) - getTimezoneOffset(cursor, timeZone);

        if (timeDiff !== 0) {
            // Tick should be on same local time distance. Then labels will have correct format (such as date/week/month)
            // For example, Amsterdam timezone:
            //
            //  2023-10-28T22:00Z -> Summer time is 2023-10-29T00:00, displays as 29.10.2023
            //  2023-10-29T22:00Z -> Winter time is 2023-10-29T23:00, displays as 23:00
            //
            //  Add 1h:
            //  2023-10-29T23:00Z -> Winter time is 2023-10-30T00:00, displays as 30.10.2023
            //
            next = dateTime({
                input: dateTime({input: cursor, timeZone: 'UTC'})
                    .add(tickSize.multiplier, tickSize.period)
                    .add(timeDiff, 'minutes'),
                timeZone,
            });

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
                next = dateTime({
                    input: dateTime({input: cursor, timeZone: 'UTC'})
                        .add(tickSize.multiplier * k++, tickSize.period)
                        .add(timeDiff, 'minutes'),
                    timeZone,
                });
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
