import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';
import {useControlledState, useLang} from '@gravity-ui/uikit';

import {useBaseDateFieldState} from '../../DateField';
import type {DateFieldState} from '../../DateField';
import {IncompleteDate} from '../../DateField/IncompleteDate.js';
import type {DateFieldSectionWithoutPosition} from '../../DateField/types';
import {
    addSegment,
    adjustDateToFormat,
    getFormatInfo,
    isEditableSectionType,
    parseDateFromString,
    setSegment,
    useFormatSections,
} from '../../DateField/utils';
import type {DateFieldBase} from '../../types/datePicker';
import type {RangeValue} from '../../types/inputs';
import {isInvalid} from '../../utils/dates';
import {useDefaultTimeZone} from '../../utils/useDefaultTimeZone';
import {createPlaceholderRangeValue, getRangeEditableSections, isValidRange} from '../utils';

export interface RangeDateFieldStateOptions extends DateFieldBase<RangeValue<DateTime>> {
    delimiter?: string;
}

const RANGE_FORMAT_DELIMITER = ' — ';

export type RangeDateFieldState = DateFieldState<RangeValue<DateTime>>;

export function useRangeDateFieldState(props: RangeDateFieldStateOptions): RangeDateFieldState {
    const [value, setRange] = useControlledState(
        props.value,
        props.defaultValue || null,
        props.onUpdate,
    );

    const inputTimeZone = useDefaultTimeZone(
        props.value?.start || props.defaultValue?.start || props.placeholderValue,
    );
    const timeZone = props.timeZone || inputTimeZone;

    const handleUpdateRange = (v: RangeValue<DateTime> | null) => {
        setRange(
            v ? {start: v.start.timeZone(inputTimeZone), end: v.end.timeZone(inputTimeZone)} : v,
        );
    };

    const placeholder = React.useMemo(() => {
        return createPlaceholderRangeValue({
            placeholderValue: props.placeholderValue,
            timeZone,
        });
    }, [props.placeholderValue, timeZone]);

    const format = props.format || 'L';
    const delimiter = props.delimiter ?? RANGE_FORMAT_DELIMITER;
    const sections = useFormatSections(format);
    const formatInfo = React.useMemo(() => getFormatInfo(sections), [sections]);
    const allSegments = formatInfo.availableUnits;

    const [displayValue, setDisplayValue] = React.useState(() => {
        return {
            start: new IncompleteDate(value ? value.start.timeZone(timeZone) : null),
            end: new IncompleteDate(value ? value.end.timeZone(timeZone) : null),
        };
    });

    const [lastValue, setLastValue] = React.useState(value);
    const [lastTimezone, setLastTimezone] = React.useState(timeZone);
    if (
        (value && !(value.start.isSame(lastValue?.start) && value.end.isSame(lastValue?.end))) ||
        (value && lastTimezone !== timeZone) ||
        (value === null && lastValue !== null)
    ) {
        setLastValue(value);
        setLastTimezone(timeZone);
        setDisplayValue({
            start: new IncompleteDate(value ? value.start.timeZone(timeZone) : null),
            end: new IncompleteDate(value ? value.end.timeZone(timeZone) : null),
        });
    }

    const {lang} = useLang();
    const rangeValue = React.useMemo(() => {
        return {
            start: displayValue.start
                .toDateTime(value?.start.timeZone(timeZone) ?? placeholder.start, {
                    setDate: formatInfo.hasDate,
                    setTime: formatInfo.hasTime,
                })
                .locale(lang),
            end: displayValue.end
                .toDateTime(value?.end.timeZone(timeZone) ?? placeholder.end, {
                    setDate: formatInfo.hasDate,
                    setTime: formatInfo.hasTime,
                })
                .locale(lang),
        };
    }, [displayValue, value, placeholder, formatInfo, timeZone, lang]);

    const sectionsState = useSectionsState(sections, displayValue, rangeValue, delimiter);

    function setValue(newValue: RangeValue<DateTime> | RangeValue<IncompleteDate> | null) {
        if (props.disabled || props.readOnly) {
            return;
        }

        if (
            newValue === null ||
            (newValue.start instanceof IncompleteDate &&
                newValue.start.isCleared(allSegments) &&
                newValue.end instanceof IncompleteDate &&
                newValue.end.isCleared(allSegments))
        ) {
            setRange(null);
            setDisplayValue({start: new IncompleteDate(), end: new IncompleteDate()});
        } else if (
            newValue.start instanceof IncompleteDate &&
            newValue.end instanceof IncompleteDate
        ) {
            if (newValue.start.isComplete(allSegments) && newValue.end.isComplete(allSegments)) {
                const newRange = {
                    start: newValue.start.toDateTime(rangeValue.start, {
                        setDate: formatInfo.hasDate,
                        setTime: formatInfo.hasTime,
                    }),
                    end: newValue.end.toDateTime(rangeValue.end, {
                        setDate: formatInfo.hasDate,
                        setTime: formatInfo.hasTime,
                    }),
                };
                if (
                    newValue.start.validate(newRange.start, allSegments) &&
                    newValue.end.validate(newRange.end, allSegments)
                ) {
                    if (
                        !value ||
                        !(newRange.start.isSame(value.start) && newRange.end.isSame(value.end))
                    ) {
                        handleUpdateRange({
                            start: adjustDateToFormat(newRange.start, formatInfo, 'startOf'),
                            end: adjustDateToFormat(newRange.end, formatInfo, 'endOf'),
                        });
                    }
                }
            }
            setDisplayValue({start: newValue.start, end: newValue.end});
        } else if (
            !(newValue.start instanceof IncompleteDate) &&
            !(newValue.end instanceof IncompleteDate) &&
            (!value || !(value.start.isSame(newValue.start) && value.end.isSame(newValue.end)))
        ) {
            handleUpdateRange({start: newValue.start, end: newValue.end});
        }
    }

    function setSection(sectionIndex: number, amount: number) {
        const portion = sectionIndex <= sections.length ? 'start' : 'end';
        const section = sectionsState.editableSections[sectionIndex];
        setValue({
            ...displayValue,
            [portion]: setSegment(section, displayValue[portion], amount, rangeValue[portion]),
        });
    }

    function adjustSection(sectionIndex: number, amount: number) {
        const section = sectionsState.editableSections[sectionIndex];
        const portion = sectionIndex <= sections.length ? 'start' : 'end';
        if (section) {
            setValue({
                ...displayValue,
                [portion]: addSegment(section, displayValue[portion], amount, rangeValue[portion]),
            });
        }
    }

    function clearSection(sectionIndex: number) {
        const section = sectionsState.editableSections[sectionIndex];
        const portion = sectionIndex <= sections.length ? 'start' : 'end';
        if (section && isEditableSectionType(section.type)) {
            setValue({
                ...displayValue,
                [portion]: displayValue[portion].clear(section.type),
            });
        }
    }

    function setValueFromString(str: string) {
        const [startDate = '', endDate = ''] = str.split(delimiter);
        const parseDate = props.parseDateFromString ?? parseDateFromString;
        const start = parseDate(startDate, format, timeZone);
        const end = parseDate(endDate, format, timeZone);
        if (start.isValid() && end.isValid()) {
            handleUpdateRange({start, end});
            return true;
        }
        return false;
    }

    function confirmPlaceholder() {
        if (props.disabled || props.readOnly) {
            return;
        }

        // If the display value is complete but invalid, we need to constrain it and emit onChange on blur.
        if (
            displayValue.start.isComplete(allSegments) &&
            displayValue.end.isComplete(allSegments)
        ) {
            const newValue = {
                start: adjustDateToFormat(
                    displayValue.start.toDateTime(rangeValue.start, {
                        setDate: formatInfo.hasDate,
                        setTime: formatInfo.hasTime,
                    }),
                    formatInfo,
                    'startOf',
                ),
                end: adjustDateToFormat(
                    displayValue.end.toDateTime(rangeValue.end, {
                        setDate: formatInfo.hasDate,
                        setTime: formatInfo.hasTime,
                    }),
                    formatInfo,
                    'endOf',
                ),
            };
            setValue(newValue);
        }
    }

    const validationState =
        props.validationState ||
        (isInvalid(value?.start, props.minValue, props.maxValue) ? 'invalid' : undefined) ||
        (isInvalid(value?.end, props.minValue, props.maxValue) ? 'invalid' : undefined) ||
        (value && !isValidRange(value) ? 'invalid' : undefined) ||
        (value && props.isDateUnavailable?.(value.start) ? 'invalid' : undefined) ||
        (value && props.isDateUnavailable?.(value.end) ? 'invalid' : undefined);

    return useBaseDateFieldState<RangeValue<DateTime>, RangeValue<IncompleteDate>>({
        value,
        displayValue: rangeValue,
        placeholderValue: props.placeholderValue,
        timeZone,
        validationState,
        editableSections: sectionsState.editableSections,
        formatInfo,
        readOnly: props.readOnly,
        disabled: props.disabled,
        isEmpty:
            displayValue.start.isCleared(allSegments) && displayValue.end.isCleared(allSegments),
        setValue,
        adjustSection,
        setSection,
        clearSection,
        setValueFromString,
        confirmPlaceholder,
    });
}

function useSectionsState(
    sections: DateFieldSectionWithoutPosition[],
    value: RangeValue<IncompleteDate>,
    placeholder: RangeValue<DateTime>,
    delimiter: string,
) {
    const [state, setState] = React.useState(() => {
        return {
            value,
            sections,
            placeholder,
            delimiter,
            editableSections: getRangeEditableSections(sections, value, placeholder, delimiter),
        };
    });

    if (
        sections !== state.sections ||
        value !== state.value ||
        !(
            placeholder.start.isSame(state.placeholder.start) &&
            placeholder.end.isSame(state.placeholder.end)
        ) ||
        delimiter !== state.delimiter
    ) {
        setState({
            value,
            sections,
            placeholder,
            delimiter,
            editableSections: getRangeEditableSections(sections, value, placeholder, delimiter),
        });
    }

    return state;
}
