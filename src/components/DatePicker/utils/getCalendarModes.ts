import type {CalendarLayout} from '../../CalendarView/hooks/types';
import type {FormatInfo} from '../../DateField/types';

type LayoutModes = Partial<Record<CalendarLayout, boolean>>;

export function getCalendarModes(formatInfo: FormatInfo): LayoutModes | undefined {
    if (!formatInfo.hasDate) {
        return undefined;
    }

    const modes: LayoutModes = {years: true};
    if (formatInfo.availableUnits.day) {
        modes.days = true;
        modes.months = true;
    }

    if (formatInfo.availableUnits.month) {
        modes.months = true;
    }

    if (formatInfo.availableUnits.quarter && !modes.months) {
        modes.quarters = true;
    }

    return modes;
}
