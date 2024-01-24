import type {RelativeRangeDatepickerSingleValue, RelativeRangeDatepickerValue} from '../types';

export function isValueEqual(
    v1?: RelativeRangeDatepickerValue | null,
    v2?: RelativeRangeDatepickerValue | null,
): boolean {
    function isValuePartEqual(
        v1?: RelativeRangeDatepickerSingleValue | null,
        v2?: RelativeRangeDatepickerSingleValue | null,
    ): boolean {
        if (v1 === v2) return true;
        if (!v1 && !v2) return true;
        if (v1?.type !== v2?.type) return false;
        if (!v1 || !v2) return true;
        if (v1.type === 'relative') {
            return v1.value === v2.value;
        }
        if (v2.type === 'absolute') {
            return v1.value.isSame(v2.value);
        }
        return false;
    }

    if (v1 === v2) return true;
    if (!v1 && !v2) return true;

    return isValuePartEqual(v1?.start, v2?.start) && isValuePartEqual(v1?.end, v2?.end);
}
