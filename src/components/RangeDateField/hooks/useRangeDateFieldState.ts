/* eslint-disable complexity */
import React from 'react';

import {isValid} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';

import {
    type BaseDateFieldState,
    useBaseDateFieldState,
} from '../../DateField/hooks/useBaseDateFieldState';
import type {DateFieldSectionType, DateFieldSectionWithoutPosition} from '../../DateField/types';
import {
    EDITABLE_SEGMENTS,
    addSegment,
    parseDateFromString,
    setSegment,
    splitFormatIntoSections,
} from '../../DateField/utils';
import {useControlledState} from '../../hooks/useControlledState';
import type {DateFieldBase} from '../../types/datePicker';
import type {RangeValue} from '../../types/inputs';
import {createPlaceholderValue, isInvalid} from '../../utils/dates';
import {
    findDelimeterSectionIndex,
    getRangeEditableSections,
    splitToRangeSections,
    toRangeFormat,
} from '../utils';

export interface RangeDateFieldStateOptions extends DateFieldBase<RangeValue<DateTime>> {
    delimeter?: string;
}

const RANGE_FORMAT_DELIMETER = ' — ';

export type RangeDateFieldState = BaseDateFieldState<RangeValue<DateTime>>;

export function useRangeDateFieldState(props: RangeDateFieldStateOptions): RangeDateFieldState {
    const delimeter = props.delimeter ?? RANGE_FORMAT_DELIMETER;
    const [value, setDate] = useControlledState(props.value, props.defaultValue, props.onUpdate);

    const [placeholderDate, setPlaceholderDate] = React.useState<RangeValue<DateTime>>(() => {
        const date = createPlaceholderValue({
            placeholderValue: props.placeholderValue,
            timeZone: props.timeZone,
        });

        return {start: date, end: date};
    });

    const format = toRangeFormat(props.format || 'L', delimeter);
    const sections = useFormatSections(format);
    const delimeterSectionIndex = findDelimeterSectionIndex(sections, delimeter);

    const allSegments: RangeValue<typeof EDITABLE_SEGMENTS> = React.useMemo(() => {
        const {start: startSections, end: endSections} = splitToRangeSections(sections, delimeter);
        const start = startSections
            .filter((seg) => EDITABLE_SEGMENTS[seg.type])
            .reduce<typeof EDITABLE_SEGMENTS>((p, seg) => {
                p[seg.type] = true;
                return p;
            }, {});
        const end = endSections
            .filter((seg) => EDITABLE_SEGMENTS[seg.type])
            .reduce<typeof EDITABLE_SEGMENTS>((p, seg) => {
                p[seg.type] = true;
                return p;
            }, {});
        return {start, end};
    }, [delimeter, sections]);

    // eslint-disable-next-line prefer-const
    let [validSegments, setValidSegments] = React.useState<RangeValue<typeof EDITABLE_SEGMENTS>>(
        () =>
            props.value || props.defaultValue
                ? {start: {...allSegments.start}, end: {...allSegments.end}}
                : {start: {}, end: {}},
    );

    if (
        value &&
        (Object.keys(validSegments.start).length < Object.keys(allSegments.start).length ||
            Object.keys(validSegments.end).length < Object.keys(allSegments.end).length)
    ) {
        setValidSegments({start: {...allSegments.start}, end: {...allSegments.end}});
    }

    if (
        !value &&
        Object.keys(validSegments.start).length > 0 &&
        Object.keys(validSegments.start).length === Object.keys(allSegments.start).length &&
        Object.keys(validSegments.end).length > 0 &&
        Object.keys(validSegments.end).length === Object.keys(allSegments.end).length
    ) {
        validSegments = {start: {}, end: {}};
        setValidSegments(validSegments);
        const date = createPlaceholderValue({timeZone: props.timeZone});
        setPlaceholderDate({start: date, end: date});
    }

    const displayValue =
        value &&
        isValid(value.start) &&
        isValid(value.end) &&
        Object.keys(validSegments.start).length >= Object.keys(allSegments.start).length &&
        Object.keys(validSegments.end).length >= Object.keys(allSegments.end).length
            ? value
            : placeholderDate;
    const sectionsState = useSectionsState(sections, displayValue, validSegments, delimeter);

    const [selectedSections, setSelectedSections] = React.useState<number | 'all'>(-1);

    const selectedSectionIndexes = React.useMemo<{
        startIndex: number;
        endIndex: number;
    } | null>(() => {
        if (selectedSections === -1) {
            return null;
        }

        if (selectedSections === 'all') {
            return {
                startIndex: 0,
                endIndex: sectionsState.editableSections.length - 1,
            };
        }

        if (typeof selectedSections === 'number') {
            return {startIndex: selectedSections, endIndex: selectedSections};
        }

        if (typeof selectedSections === 'string') {
            const selectedSectionIndex = sectionsState.editableSections.findIndex(
                (section) => section.type === selectedSections,
            );

            return {startIndex: selectedSectionIndex, endIndex: selectedSectionIndex};
        }

        return selectedSections;
    }, [selectedSections, sectionsState.editableSections]);

    function setValue(newValue: RangeValue<DateTime>) {
        if (props.disabled || props.readOnly) {
            return;
        }

        if (
            Object.keys(validSegments.start).length >= Object.keys(allSegments.start).length &&
            Object.keys(validSegments.end).length >= Object.keys(allSegments.end).length
        ) {
            if (!value || !(newValue.start.isSame(value.start) && newValue.end.isSame(value.end))) {
                setDate(newValue);
            }
        } else {
            if (value) {
                setDate(null);
            }
            setPlaceholderDate(newValue);
        }
    }

    function markValid(portion: 'start' | 'end', part: DateFieldSectionType) {
        validSegments[portion][part] = true;
        if (
            validSegments[portion].day &&
            validSegments[portion].month &&
            validSegments[portion].year &&
            allSegments[portion].weekday
        ) {
            validSegments[portion].weekday = true;
        }
        if (validSegments[portion].hour && allSegments[portion].dayPeriod) {
            validSegments[portion].dayPeriod = true;
        }
        setValidSegments({...validSegments, [portion]: {...validSegments[portion]}});
    }

    function setSection(sectionIndex: number, amount: number) {
        const portion = sectionIndex < delimeterSectionIndex ? 'start' : 'end';
        const section = sectionsState.editableSections[sectionIndex];
        markValid(portion, section.type);
        setValue({
            ...displayValue,
            [portion]: setSegment(section, displayValue[portion], amount),
        });
    }

    function adjustSection(sectionIndex: number, amount: number) {
        const section = sectionsState.editableSections[sectionIndex];
        const portion = sectionIndex < delimeterSectionIndex ? 'start' : 'end';
        if (validSegments[portion][section.type]) {
            setValue({
                ...displayValue,
                [portion]: addSegment(section, displayValue[portion], amount),
            });
        } else {
            markValid(portion, section.type);
            if (
                Object.keys(validSegments[portion]).length >=
                Object.keys(allSegments[portion]).length
            ) {
                setValue(displayValue);
            }
        }
    }

    function flushValidSection(sectionIndex: number) {
        const portion = sectionIndex < delimeterSectionIndex ? 'start' : 'end';
        delete validSegments[portion][sectionsState.editableSections[sectionIndex].type];
        setValidSegments({...validSegments, [portion]: {...validSegments[portion]}});
    }

    function flushAllValidSections() {
        validSegments = {start: {}, end: {}};
        setValidSegments({start: {}, end: {}});
    }

    function getSectionValue(sectionIndex: number) {
        const portion = sectionIndex < delimeterSectionIndex ? 'start' : 'end';
        return displayValue[portion];
    }

    function setSectionValue(sectionIndex: number, currentValue: DateTime) {
        const portion = sectionIndex < delimeterSectionIndex ? 'start' : 'end';
        setValue({...displayValue, [portion]: currentValue});
    }

    function createPlaceHolder() {
        const date = createPlaceholderValue({
            placeholderValue: props.placeholderValue,
            timeZone: props.timeZone,
        });

        return {start: date, end: date};
    }

    function setValueFromString(str: string) {
        const fmt = props.format || 'L';
        const list = str.split(delimeter);
        const start = parseDateFromString(list?.[0]?.trim(), fmt, props.timeZone);
        const end = parseDateFromString(list?.[1]?.trim(), fmt, props.timeZone);
        if (isValid(start) && isValid(end)) {
            setDate({start, end});
            return true;
        }
        return false;
    }

    const validationState =
        props.validationState ||
        (isInvalid(value?.start, props.minValue, props.maxValue) ? 'invalid' : undefined) ||
        (isInvalid(value?.end, props.minValue, props.maxValue) ? 'invalid' : undefined) ||
        (value && props.isDateUnavailable?.(value.start) ? 'invalid' : undefined) ||
        (value && props.isDateUnavailable?.(value.end) ? 'invalid' : undefined);

    return useBaseDateFieldState<RangeValue<DateTime>>({
        value,
        displayValue,
        placeholderValue: props.placeholderValue,
        timeZone: props.timeZone,
        validationState,
        editableSections: sectionsState.editableSections,
        readOnly: props.readOnly,
        disabled: props.disabled,
        selectedSectionIndexes,
        selectedSections,
        isEmpty: () =>
            Object.keys(validSegments.start).length === 0 &&
            Object.keys(validSegments.end).length === 0,
        flushAllValidSections,
        flushValidSection,
        setSelectedSections,
        setValue,
        setDate,
        adjustSection,
        setSection,
        getSectionValue,
        setSectionValue,
        createPlaceHolder,
        setValueFromString,
    });
}

function useFormatSections(format: string) {
    const usedFormat = format;
    const [sections, setSections] = React.useState(() => splitFormatIntoSections(usedFormat));

    const [previousFormat, setFormat] = React.useState(usedFormat);
    if (usedFormat !== previousFormat) {
        setFormat(usedFormat);
        setSections(splitFormatIntoSections(usedFormat));
    }

    return sections;
}

function useSectionsState(
    sections: DateFieldSectionWithoutPosition[],
    value: RangeValue<DateTime>,
    validSegments: RangeValue<typeof EDITABLE_SEGMENTS>,
    delimeter: string,
) {
    const [state, setState] = React.useState(() => {
        return {
            value,
            sections,
            validSegments,
            editableSections: getRangeEditableSections(sections, value, validSegments, delimeter),
        };
    });

    if (
        sections !== state.sections ||
        validSegments !== state.validSegments ||
        !(value.start.isSame(state.value.start) && value.end.isSame(state.value.end))
    ) {
        setState({
            value,
            sections,
            validSegments,
            editableSections: getRangeEditableSections(sections, value, validSegments, delimeter),
        });
    }

    return state;
}
