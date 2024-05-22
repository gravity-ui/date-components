export interface Span {
    start: number;
    end: number;
}

export const UNIT_SPAN: Span = {start: 0, end: 1};

interface RescaleOptions extends Span {
    fixedPoint?: number;
    scale: number;
}
/**
 * Rescales a span by `scale` times so that it's `fixedPoint` remains constant.
 * `fixedPoint` is relative to original span size: 0 means start, 1 means end,
 * 0.5 means middle.
 * @param options Sets scale coefficient and a fixed point
 * @returns Rescaled span
 */
export function rescaleSpan({start, end, fixedPoint = 0.5, scale}: RescaleOptions): Span {
    const len = end - start;
    const factor = scale - 1;
    return {
        start: Math.floor(start - len * fixedPoint * factor),
        end: Math.floor(end + len * (1 - fixedPoint) * factor),
    };
}

/**
 * Implements linear intrepolation.
 *
 * Calculates such a linear mapping `R -> R` that `from.start` will be mapped
 * into `to.start`, and `from.end` will be mapped to `to.end`. Then applies
 * this mapping to `value`.
 * @param from Interpolation domain
 * @param to Interpolation target
 * @param value Value from domain
 * @returns Value from target
 */
export function lerp(from: Span, to: Span, value: number): number {
    return to.start + ((value - from.start) * (to.end - to.start)) / (from.end - from.start);
}

/**
 * Calculates a lerp scale coefficient
 * @param from Interpolation domain
 * @param to Interpolation target
 * @returns Scale coefficient
 */
export function getLerpCoeff(from: Span, to: Span): number {
    return (to.end - to.start) / (from.end - from.start);
}
