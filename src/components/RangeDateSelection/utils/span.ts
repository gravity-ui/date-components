export interface Span {
    start: number;
    end: number;
}

/**
 * Implements linear interpolation (lerp).
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
