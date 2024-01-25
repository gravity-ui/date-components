import React from 'react';

import {isValid} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';

import {useControlledState} from '../../hooks/useControlledState';
import type {DateFieldBase} from '../../types/datePicker';
import {createPlaceholderValue, isInvalid} from '../../utils/dates';
import type {DateFieldSectionType, DateFieldSectionWithoutPosition} from '../types';
import {
    EDITABLE_SEGMENTS,
    addSegment,
    getEditableSections,
    parseDateFromString,
    setSegment,
    splitFormatIntoSections,
} from '../utils';

import {type BaseDateFieldState, useBaseDateFieldState} from './useBaseDateFieldState';

export interface DateFieldStateOptions extends DateFieldBase {}

export type DateFieldState = BaseDateFieldState;

export function useDateFieldState(props: DateFieldStateOptions): DateFieldState {
    const [value, setDate] = useControlledState(
        props.value,
        props.defaultValue ?? null,
        props.onUpdate,
    );

    const [placeholderDate, setPlaceholderDate] = React.useState(() => {
        return createPlaceholderValue({
            placeholderValue: props.placeholderValue,
            timeZone: props.timeZone,
        });
    });

    const format = props.format || 'L';
    const sections = useFormatSections(format);
    const allSegments: typeof EDITABLE_SEGMENTS = React.useMemo(
        () =>
            sections
                .filter((seg) => EDITABLE_SEGMENTS[seg.type])
                .reduce<typeof EDITABLE_SEGMENTS>((p, seg) => ({...p, [seg.type]: true}), {}),
        [sections],
    );

    const validSegmentsState = React.useState<typeof EDITABLE_SEGMENTS>(() =>
        props.value || props.defaultValue ? {...allSegments} : {},
    );

    let validSegments = validSegmentsState[0];
    const setValidSegments = validSegmentsState[1];

    if (value && Object.keys(validSegments).length < Object.keys(allSegments).length) {
        setValidSegments({...allSegments});
    }

    if (
        !value &&
        Object.keys(validSegments).length > 0 &&
        Object.keys(validSegments).length === Object.keys(allSegments).length
    ) {
        validSegments = {};
        setValidSegments(validSegments);
        setPlaceholderDate(createPlaceholderValue({timeZone: props.timeZone}));
    }

    const displayValue =
        value &&
        isValid(value) &&
        Object.keys(validSegments).length >= Object.keys(allSegments).length
            ? value
            : placeholderDate;
    const sectionsState = useSectionsState(sections, displayValue, validSegments);

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

    function setValue(newValue: DateTime) {
        if (props.disabled || props.readOnly) {
            return;
        }

        if (Object.keys(validSegments).length >= Object.keys(allSegments).length) {
            if (!value || !newValue.isSame(value)) {
                setDate(newValue);
            }
        } else {
            if (value) {
                setDate(null);
            }
            setPlaceholderDate(newValue);
        }
    }

    function markValid(part: DateFieldSectionType) {
        validSegments[part] = true;
        if (validSegments.day && validSegments.month && validSegments.year && allSegments.weekday) {
            validSegments.weekday = true;
        }
        if (validSegments.hour && allSegments.dayPeriod) {
            validSegments.dayPeriod = true;
        }
        setValidSegments({...validSegments});
    }

    function setSection(sectionIndex: number, amount: number) {
        const section = sectionsState.editableSections[sectionIndex];
        markValid(section.type);
        setValue(setSegment(section, displayValue, amount));
    }

    function adjustSection(sectionIndex: number, amount: number) {
        const section = sectionsState.editableSections[sectionIndex];
        if (validSegments[section.type]) {
            setValue(addSegment(section, displayValue, amount));
        } else {
            markValid(section.type);
            if (Object.keys(validSegments).length >= Object.keys(allSegments).length) {
                setValue(displayValue);
            }
        }
    }

    function flushValidSection(sectionIndex: number) {
        delete validSegments[sectionsState.editableSections[sectionIndex].type];
        setValidSegments({...validSegments});
    }

    function flushAllValidSections() {
        validSegments = {};
        setValidSegments({});
    }

    function getSectionValue(_sectionIndex: number) {
        return displayValue;
    }

    function setSectionValue(_sectionIndex: number, currentValue: DateTime) {
        setValue(currentValue);
    }

    function createPlaceholder() {
        return createPlaceholderValue({
            placeholderValue: props.placeholderValue,
            timeZone: props.timeZone,
        });
    }

    function setValueFromString(str: string) {
        const date = parseDateFromString(str, props.format || 'L', props.timeZone);
        if (isValid(date)) {
            setDate(date);
            return true;
        }
        return false;
    }

    const validationState =
        props.validationState ||
        (isInvalid(value, props.minValue, props.maxValue) ? 'invalid' : undefined) ||
        (value && props.isDateUnavailable?.(value) ? 'invalid' : undefined);

    return useBaseDateFieldState<DateTime>({
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
        isEmpty: () => Object.keys(validSegments).length === 0,
        flushAllValidSections,
        flushValidSection,
        setSelectedSections,
        setValue,
        setDate,
        adjustSection,
        setSection,
        getSectionValue,
        setSectionValue,
        createPlaceholder,
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
    value: DateTime,
    validSegments: typeof EDITABLE_SEGMENTS,
) {
    const [state, setState] = React.useState(() => {
        return {
            value,
            sections,
            validSegments,
            editableSections: getEditableSections(sections, value, validSegments),
        };
    });

    if (
        sections !== state.sections ||
        validSegments !== state.validSegments ||
        !value.isSame(state.value)
    ) {
        setState({
            value,
            sections,
            validSegments,
            editableSections: getEditableSections(sections, value, validSegments),
        });
    }

    return state;
}
