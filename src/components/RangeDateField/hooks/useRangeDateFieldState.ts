/* eslint-disable complexity */
import React from 'react';

import {isValid} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';
import {useControlledState} from '@gravity-ui/uikit';

import {useBaseDateFieldState} from '../../DateField';
import type {DateFieldState} from '../../DateField';
import type {DateFieldSectionType, DateFieldSectionWithoutPosition} from '../../DateField/types';
import {
    EDITABLE_SEGMENTS,
    addSegment,
    isAllSegmentsValid,
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

    const [placeholderDate, setPlaceholderDate] = React.useState<RangeValue<DateTime>>(() => {
        return createPlaceholderRangeValue({
            placeholderValue: props.placeholderValue,
            timeZone,
        });
    });

    const format = props.format || 'L';
    const delimiter = props.delimiter ?? RANGE_FORMAT_DELIMITER;
    const sections = useFormatSections(format);

    const allSegments: typeof EDITABLE_SEGMENTS = React.useMemo(() => {
        return sections
            .filter((seg) => EDITABLE_SEGMENTS[seg.type])
            .reduce<typeof EDITABLE_SEGMENTS>((p, seg) => ({...p, [seg.type]: true}), {});
    }, [sections]);

    // eslint-disable-next-line prefer-const
    let [validSegments, setValidSegments] = React.useState<RangeValue<typeof EDITABLE_SEGMENTS>>(
        () => (value ? {start: {...allSegments}, end: {...allSegments}} : {start: {}, end: {}}),
    );

    if (
        value &&
        (!isAllSegmentsValid(allSegments, validSegments.start) ||
            !isAllSegmentsValid(allSegments, validSegments.end))
    ) {
        setValidSegments({start: {...allSegments}, end: {...allSegments}});
    }

    if (
        !value &&
        isAllSegmentsValid(allSegments, validSegments.start) &&
        Object.keys(validSegments.start).length === Object.keys(allSegments).length &&
        isAllSegmentsValid(allSegments, validSegments.end) &&
        Object.keys(validSegments.end).length === Object.keys(allSegments).length
    ) {
        validSegments = {start: {}, end: {}};
        setValidSegments(validSegments);
        setPlaceholderDate(
            createPlaceholderRangeValue({
                placeholderValue: props.placeholderValue,
                timeZone,
            }),
        );
    }

    const displayValue =
        value &&
        isValid(value.start) &&
        isValid(value.end) &&
        Object.keys(validSegments.start).length >= Object.keys(allSegments).length &&
        Object.keys(validSegments.end).length >= Object.keys(allSegments).length
            ? {start: value.start.timeZone(timeZone), end: value.end.timeZone(timeZone)}
            : {
                  start: placeholderDate.start.timeZone(timeZone),
                  end: placeholderDate.end.timeZone(timeZone),
              };
    const sectionsState = useSectionsState(sections, displayValue, validSegments, delimiter);

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
            isAllSegmentsValid(allSegments, validSegments.start) &&
            isAllSegmentsValid(allSegments, validSegments.end)
        ) {
            if (!value || !(newValue.start.isSame(value.start) && newValue.end.isSame(value.end))) {
                handleUpdateRange(newValue);
            }
        } else {
            if (value) {
                handleUpdateRange(null);
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
            allSegments.weekday
        ) {
            validSegments[portion].weekday = true;
        }
        if (validSegments[portion].hour && allSegments.dayPeriod) {
            validSegments[portion].dayPeriod = true;
        }
        setValidSegments({...validSegments, [portion]: {...validSegments[portion]}});
    }

    function setSection(sectionIndex: number, amount: number) {
        const portion = sectionIndex <= sections.length ? 'start' : 'end';
        const section = sectionsState.editableSections[sectionIndex];
        markValid(portion, section.type);
        setValue({
            ...displayValue,
            [portion]: setSegment(section, displayValue[portion], amount),
        });
    }

    function adjustSection(sectionIndex: number, amount: number) {
        const section = sectionsState.editableSections[sectionIndex];
        const portion = sectionIndex <= sections.length ? 'start' : 'end';
        if (validSegments[portion][section.type]) {
            setValue({
                ...displayValue,
                [portion]: addSegment(section, displayValue[portion], amount),
            });
        } else {
            markValid(portion, section.type);
            if (Object.keys(validSegments[portion]).length >= Object.keys(allSegments).length) {
                setValue(displayValue);
            }
        }
    }

    function flushValidSection(sectionIndex: number) {
        const portion = sectionIndex <= sections.length ? 'start' : 'end';
        delete validSegments[portion][sectionsState.editableSections[sectionIndex].type];
        setValidSegments({...validSegments, [portion]: {...validSegments[portion]}});
    }

    function flushAllValidSections() {
        validSegments = {start: {}, end: {}};
        setValidSegments({start: {}, end: {}});
    }

    function getSectionValue(sectionIndex: number) {
        const portion = sectionIndex <= sections.length ? 'start' : 'end';
        return displayValue[portion];
    }

    function setSectionValue(sectionIndex: number, currentValue: DateTime) {
        const portion = sectionIndex <= sections.length ? 'start' : 'end';
        setValue({...displayValue, [portion]: currentValue});
    }

    function createPlaceholder() {
        return createPlaceholderRangeValue({
            placeholderValue: props.placeholderValue,
            timeZone,
        });
    }

    function setValueFromString(str: string) {
        const list = str.split(delimiter);
        const start = parseDateFromString(list?.[0]?.trim(), format, timeZone);
        const end = parseDateFromString(list?.[1]?.trim(), format, timeZone);
        const range = {start, end};
        if (isValid(range.start) && isValid(range.end)) {
            handleUpdateRange(range);
            return true;
        }
        return false;
    }

    const validationState =
        props.validationState ||
        (isInvalid(value?.start, props.minValue, props.maxValue) ? 'invalid' : undefined) ||
        (isInvalid(value?.end, props.minValue, props.maxValue) ? 'invalid' : undefined) ||
        (value && !isValidRange(value) ? 'invalid' : undefined) ||
        (value && props.isDateUnavailable?.(value.start) ? 'invalid' : undefined) ||
        (value && props.isDateUnavailable?.(value.end) ? 'invalid' : undefined);

    return useBaseDateFieldState({
        value,
        displayValue,
        placeholderValue: props.placeholderValue,
        timeZone,
        validationState,
        editableSections: sectionsState.editableSections,
        readOnly: props.readOnly,
        disabled: props.disabled,
        selectedSectionIndexes,
        selectedSections,
        isEmpty:
            Object.keys(validSegments.start).length === 0 &&
            Object.keys(validSegments.end).length === 0,
        flushAllValidSections,
        flushValidSection,
        setSelectedSections,
        setValue,
        setDate: handleUpdateRange,
        adjustSection,
        setSection,
        getSectionValue,
        setSectionValue,
        createPlaceholder,
        setValueFromString,
    });
}

function useSectionsState(
    sections: DateFieldSectionWithoutPosition[],
    value: RangeValue<DateTime>,
    validSegments: RangeValue<typeof EDITABLE_SEGMENTS>,
    delimiter: string,
) {
    const [state, setState] = React.useState(() => {
        return {
            value,
            sections,
            validSegments,
            delimiter,
            editableSections: getRangeEditableSections(sections, value, validSegments, delimiter),
        };
    });

    if (
        sections !== state.sections ||
        validSegments !== state.validSegments ||
        !(value.start.isSame(state.value.start) && value.end.isSame(state.value.end)) ||
        delimiter !== state.delimiter
    ) {
        setState({
            value,
            sections,
            validSegments,
            delimiter,
            editableSections: getRangeEditableSections(sections, value, validSegments, delimiter),
        });
    }

    return state;
}
