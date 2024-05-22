import {i18n} from '../i18n';

type DurationProperty = 'y' | 'M' | 'w' | 'd' | 'h' | 'm' | 's';
type Duration = {
    [key in DurationProperty]: number;
};

const ZERO_DURATION: Readonly<Duration> = {
    y: 0,
    M: 0,
    w: 0,
    d: 0,
    h: 0,
    m: 0,
    s: 0,
};

interface UnitDivisor {
    unit: DurationProperty;
    mult: number;
    prev: DurationProperty;
}
const unitDivisors: UnitDivisor[] = [
    {unit: 'm', mult: 60, prev: 's'},
    {unit: 'h', mult: 60, prev: 'm'},
    {unit: 'd', mult: 24, prev: 'h'},
    {unit: 'y', mult: 365, prev: 'd'},
];

/**
 * Makes duration object that represets approximatelly the same amount of time
 * as `value` ms. A month is considered to always be 30 days long, a year - 365
 * days long, a day - 24 hours long, etc.
 * @param value Milliseconds
 * @returns Proper duration object
 */
export function getDurationFromValue(value: number): Duration {
    if (isNaN(value) || !isFinite(value)) {
        return ZERO_DURATION;
    }

    const result: Duration = {
        ...ZERO_DURATION,
        s: Math.floor(Math.abs(value) / 1000),
    };

    for (const {unit, mult, prev} of unitDivisors) {
        const lesser = result[prev];
        if (lesser >= mult) {
            const bigger = Math.floor(lesser / mult);
            result[unit] = bigger;
            result[prev] = lesser % mult;
        }
    }

    // special treatment for months and weeks
    if (result.d >= 30) {
        const months = Math.floor(result.d / 30);
        if (months < 12) {
            result.d %= 30;
            result.M = months;
        }
    }
    if (result.d >= 7) {
        const weeks = Math.floor(result.d / 7);
        if (weeks < 5) {
            result.d %= 7;
            result.w = weeks;
        }
    }

    return result;
}

const propertyNamesDescending: DurationProperty[] = ['y', 'M', 'w', 'd', 'h', 'm', 's'];
/**
 * Creates a string representation of given duration object.
 *
 * Forall `d`, `d = parseDuration(stringifyDuration(d))` (not referentially)
 * @param d Proper duration object to stringify
 * @returns Proper duration string (e.g. '30s')
 */
export function stringifyDuration(d: Duration): string {
    const parts: string[] = [];
    for (const propName of propertyNamesDescending) {
        if (d[propName]) {
            const n = d[propName].toFixed(0);
            parts.push(`${n}${propName}`);
        }
    }
    return parts.join('') || '0s';
}

const downgradeMultipliers: UnitDivisor[] = [
    {unit: 'y', mult: 12, prev: 'M'},
    {unit: 'M', mult: 4, prev: 'w'},
    {unit: 'w', mult: 7, prev: 'd'},
    {unit: 'd', mult: 24, prev: 'h'},
    {unit: 'h', mult: 60, prev: 'm'},
    {unit: 'm', mult: 60, prev: 's'},
];
/**
 * Limits non-zero properties count of a duration by shifting them to shorter
 * properties (e.g., '1m15s' limited to 1 digit will become '75s')
 * @param d Source duration object
 * @param maxNonZeroDigits Number of maximum allowed non-zero time units in Duration
 * @returns A duration object with at max `maxNonZeroDigits` properties being greater than zero
 */
export function limitNonZeroDigits(d: Duration, maxNonZeroDigits: number): Duration {
    const result = {...d};
    let nonZeroes = Object.values(d).filter(Boolean).length;

    if (nonZeroes <= maxNonZeroDigits) {
        return d;
    }

    for (const {unit, mult, prev} of downgradeMultipliers) {
        if (nonZeroes <= maxNonZeroDigits) {
            break;
        }

        if (result[unit]) {
            result[prev] += mult * result[unit];
            result[unit] = 0;
            --nonZeroes;
        }
    }

    return result;
}

/**
 * Names a duration object with human-readable string (like '15 seconds')
 * @param d Duration to name
 * @returns Human-readable duration representation
 */
export function getHumanDurationName(d: Duration) {
    const [[unit, count]] = (
        Object.entries(limitNonZeroDigits(d, 1)) as Array<[keyof Duration, number]>
    ).filter(([, c]) => c > 0);
    const durationName = i18n(`duration-name.${unit}`, {count});
    return durationName;
}

export function getHighestRoundedDuration(duration: Duration = ZERO_DURATION) {
    const durationEntries = Object.entries(duration);
    const truncatedEntries: [string, number][] = [];
    let hasLeadingZeros = true;

    for (const [unit, count] of durationEntries) {
        if (count > 0) {
            hasLeadingZeros = false;
        }
        if (hasLeadingZeros) {
            continue;
        }

        truncatedEntries.push([unit, count]);
    }

    const [primaryEntry = [], secondaryEntry = []] = truncatedEntries;
    const [primaryUnit = 's', primaryCount = 0] = primaryEntry;
    const [secondaryUnit, secondaryCount = 0] = secondaryEntry;

    const isMinutes = primaryUnit === 'm';
    const isSeconds = primaryUnit === 's';
    const shouldKeepPrimaryUnit = isMinutes || isSeconds || secondaryCount === 0 || !secondaryUnit;

    const multiplier = downgradeMultipliers.find((item) => item.unit === primaryUnit);
    const count = shouldKeepPrimaryUnit
        ? primaryCount
        : primaryCount * (multiplier?.mult || 1) + secondaryCount;
    const unit = shouldKeepPrimaryUnit ? primaryUnit : secondaryUnit;

    return `${count}${unit}`;
}
