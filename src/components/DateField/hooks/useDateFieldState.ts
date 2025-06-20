import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';
import {useControlledState} from '@gravity-ui/uikit';

import type {DateFieldBase} from '../../types/datePicker';
import {createPlaceholderValue, isInvalid} from '../../utils/dates';
import {useDefaultTimeZone} from '../../utils/useDefaultTimeZone';
import type {
    AvailableSections,
    DateFieldSectionType,
    DateFieldSectionWithoutPosition,
} from '../types';
import {
    addSegment,
    adjustDateToFormat,
    getEditableSections,
    getFormatInfo,
    isAllSegmentsValid,
    markValidSection,
    parseDateFromString,
    setSegment,
    useFormatSections,
} from '../utils';

import {useBaseDateFieldState} from './useBaseDateFieldState';
import type {DateFieldState} from './useBaseDateFieldState';

export interface DateFieldStateOptions extends DateFieldBase {}

export function useDateFieldState(props: DateFieldStateOptions): DateFieldState {
    const [value, setDate] = useControlledState(
        props.value,
        props.defaultValue ?? null,
        props.onUpdate,
    );

    const inputTimeZone = useDefaultTimeZone(
        props.value || props.defaultValue || props.placeholderValue,
    );
    const timeZone = props.timeZone || inputTimeZone;

    const handleUpdateDate = (v: DateTime | null) => {
        setDate(v ? v.timeZone(inputTimeZone) : v);
    };

    const [placeholderDate, setPlaceholderDate] = React.useState(() => {
        return createPlaceholderValue({
            placeholderValue: props.placeholderValue,
            timeZone,
        });
    });

    const format = props.format || 'L';
    const sections = useFormatSections(format);
    const formatInfo = React.useMemo(() => getFormatInfo(sections), [sections]);
    const allSegments = formatInfo.availableUnits;

    const validSegmentsState = React.useState<AvailableSections>(() =>
        value ? {...allSegments} : {},
    );

    let validSegments = validSegmentsState[0];
    const setValidSegments = validSegmentsState[1];

    if (value && !isAllSegmentsValid(allSegments, validSegments)) {
        setValidSegments({...allSegments});
    }

    if (
        !value &&
        Object.keys(allSegments).length > 0 &&
        isAllSegmentsValid(allSegments, validSegments) &&
        Object.keys(validSegments).length === Object.keys(allSegments).length
    ) {
        validSegments = {};
        setValidSegments(validSegments);
        setPlaceholderDate(
            createPlaceholderValue({
                placeholderValue: props.placeholderValue,
                timeZone,
            }),
        );
    }

    const displayValue =
        value && value.isValid() && isAllSegmentsValid(allSegments, validSegments)
            ? value.timeZone(timeZone)
            : placeholderDate.timeZone(timeZone);
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

        if (isAllSegmentsValid(allSegments, validSegments)) {
            if (!value || !newValue.isSame(value)) {
                handleUpdateDate(adjustDateToFormat(newValue, formatInfo));
            }
        } else {
            if (value) {
                handleUpdateDate(null);
            }
            setPlaceholderDate(newValue);
        }
    }

    function markValid(part: DateFieldSectionType) {
        validSegments = markValidSection(allSegments, validSegments, part);
        setValidSegments({...validSegments});
    }

    function setSection(sectionIndex: number, amount: number) {
        const section = sectionsState.editableSections[sectionIndex];
        if (section) {
            markValid(section.type);
            setValue(setSegment(section, displayValue, amount));
        }
    }

    function adjustSection(sectionIndex: number, amount: number) {
        const section = sectionsState.editableSections[sectionIndex];
        if (section) {
            if (validSegments[section.type]) {
                setValue(addSegment(section, displayValue, amount));
            } else {
                markValid(section.type);
                if (Object.keys(validSegments).length >= Object.keys(allSegments).length) {
                    setValue(displayValue);
                }
            }
        }
    }

    function flushValidSection(sectionIndex: number) {
        const section = sectionsState.editableSections[sectionIndex];
        if (section) {
            delete validSegments[section.type];
        }
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
            timeZone,
        }).timeZone(timeZone);
    }

    function setValueFromString(str: string) {
        const parseDate = props.parseDateFromString ?? parseDateFromString;
        const date = parseDate(str, format, timeZone);
        if (date.isValid()) {
            handleUpdateDate(date);
            return true;
        }
        return false;
    }

    const validationState =
        props.validationState ||
        (isInvalid(value, props.minValue, props.maxValue) ? 'invalid' : undefined) ||
        (value && props.isDateUnavailable?.(value) ? 'invalid' : undefined);

    return useBaseDateFieldState({
        value,
        displayValue,
        placeholderValue: props.placeholderValue,
        timeZone,
        validationState,
        editableSections: sectionsState.editableSections,
        formatInfo,
        readOnly: props.readOnly,
        disabled: props.disabled,
        selectedSectionIndexes,
        selectedSections,
        isEmpty: Object.keys(validSegments).length === 0,
        flushAllValidSections,
        flushValidSection,
        setSelectedSections,
        setValue,
        setDate: handleUpdateDate,
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
    value: DateTime,
    validSegments: AvailableSections,
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
        !value.isSame(state.value) ||
        value.timeZone() !== state.value.timeZone()
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
