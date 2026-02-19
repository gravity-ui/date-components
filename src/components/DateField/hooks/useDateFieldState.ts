import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';
import {useControlledState, useLang} from '@gravity-ui/uikit';

import type {InputBase, Validation, ValueBase} from '../../types';
import {createPlaceholderValue, isInvalid} from '../../utils/dates';
import {useDefaultTimeZone} from '../../utils/useDefaultTimeZone';
import {IncompleteDate} from '../IncompleteDate';
import type {DateFieldSectionWithoutPosition} from '../types';
import {
    addSegment,
    adjustDateToFormat,
    getEditableSections,
    getFormatInfo,
    parseDateFromString,
    setSegment,
    useFormatSections,
} from '../utils';

import {useBaseDateFieldState} from './useBaseDateFieldState';
import type {DateFieldState} from './useBaseDateFieldState';

export interface DateFieldStateOptions extends ValueBase<DateTime | null>, InputBase, Validation {
    /** The minimum allowed date that a user may select. */
    minValue?: DateTime;
    /** The maximum allowed date that a user may select. */
    maxValue?: DateTime;
    /** Callback that is called for each date of the calendar. If it returns true, then the date is unavailable. */
    isDateUnavailable?: (date: DateTime) => boolean;
    /** Format of the date when rendered in the input. [Available formats](https://day.js.org/docs/en/display/format) */
    format?: string;
    /** A placeholder date that controls the default values of each segment when the user first interacts with them. Defaults to today's date at midnight. */
    placeholderValue?: DateTime;
    /**
     * Which timezone use to show values. Example: 'default', 'system', 'Europe/Amsterdam'.
     * @default The timezone of the `value` or `defaultValue` or `placeholderValue`, 'default' otherwise.
     */
    timeZone?: string;
    /** Custom parser function for parsing pasted date strings. If not provided, the default parser will be used. */
    parseDateFromString?: (dateStr: string, format: string, timeZone?: string) => DateTime;
}

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

    const [lastPlaceholder, setLastPlaceholder] = React.useState(props.placeholderValue);
    if (
        (props.placeholderValue && !props.placeholderValue.isSame(lastPlaceholder)) ||
        (!props.placeholderValue && lastPlaceholder)
    ) {
        setLastPlaceholder(props.placeholderValue);
    }
    const placeholder = React.useMemo(
        () =>
            createPlaceholderValue({
                placeholderValue: lastPlaceholder,
                timeZone,
            }),
        [lastPlaceholder, timeZone],
    );

    const format = props.format || 'L';
    const sections = useFormatSections(format);
    const formatInfo = React.useMemo(() => getFormatInfo(sections), [sections]);
    const allSegments = formatInfo.availableUnits;

    const [displayValue, setDisplayValue] = React.useState(() => {
        return new IncompleteDate(value && value.isValid() ? value.timeZone(timeZone) : null);
    });

    const [lastValue, setLastValue] = React.useState(value);
    const [lastTimezone, setLastTimezone] = React.useState(timeZone);
    if (
        (value && !value.isSame(lastValue)) ||
        (value && lastTimezone !== timeZone) ||
        (value === null && lastValue !== null)
    ) {
        setLastValue(value);
        setLastTimezone(timeZone);
        setDisplayValue(new IncompleteDate(value?.timeZone(timeZone)));
    }

    const {lang} = useLang();
    const dateValue = React.useMemo(() => {
        return displayValue
            .toDateTime(value?.timeZone(timeZone) ?? placeholder, {
                setDate: formatInfo.hasDate,
                setTime: formatInfo.hasTime,
            })
            .locale(lang);
    }, [displayValue, value, placeholder, formatInfo, timeZone, lang]);

    const sectionsState = useSectionsState(sections, displayValue, dateValue);

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

    function setValue(newValue: DateTime | IncompleteDate | null) {
        if (props.disabled || props.readOnly) {
            return;
        }

        if (
            newValue === null ||
            (newValue instanceof IncompleteDate && newValue.isCleared(allSegments))
        ) {
            setDate(null);
            setDisplayValue(new IncompleteDate());
        } else if (newValue instanceof IncompleteDate) {
            if (newValue.isComplete(allSegments)) {
                const newDate = newValue.toDateTime(dateValue, {
                    setDate: formatInfo.hasDate,
                    setTime: formatInfo.hasTime,
                });
                if (newValue.validate(newDate, allSegments)) {
                    if (!value || !newDate.isSame(value)) {
                        handleUpdateDate(adjustDateToFormat(newDate, formatInfo));
                    }
                }
            }
            setDisplayValue(newValue);
        } else if (!value || !newValue.isSame(value)) {
            handleUpdateDate(newValue);
        }
    }

    function setSection(sectionIndex: number, amount: number) {
        const section = sectionsState.editableSections[sectionIndex];
        if (section) {
            setValue(setSegment(section, displayValue, amount, dateValue));
        }
    }

    function adjustSection(sectionIndex: number, amount: number) {
        const section = sectionsState.editableSections[sectionIndex];
        if (section) {
            setValue(addSegment(section, displayValue, amount, dateValue));
        }
    }

    function getSectionValue(_sectionIndex: number) {
        return displayValue;
    }

    function setSectionValue(_sectionIndex: number, newValue: IncompleteDate) {
        setValue(newValue);
    }

    function setValueFromString(str: string) {
        const parseDate = props.parseDateFromString ?? parseDateFromString;
        const date = parseDate(str, format, timeZone);
        if (date.isValid()) {
            setValue(date);
            return true;
        }
        return false;
    }

    function confirmPlaceholder() {
        if (props.disabled || props.readOnly) {
            return;
        }

        // If the display value is complete but invalid, we need to constrain it and emit onChange on blur.
        if (displayValue.isComplete(allSegments)) {
            const newValue = displayValue.toDateTime(dateValue, {
                setDate: formatInfo.hasDate,
                setTime: formatInfo.hasTime,
            });
            setValue(adjustDateToFormat(newValue, formatInfo, 'startOf'));
        }
    }

    const validationState =
        props.validationState ||
        (isInvalid(value, props.minValue, props.maxValue) ? 'invalid' : undefined) ||
        (value && props.isDateUnavailable?.(value) ? 'invalid' : undefined);

    return useBaseDateFieldState({
        value,
        displayValue: dateValue,
        placeholderValue: props.placeholderValue,
        timeZone,
        validationState,
        editableSections: sectionsState.editableSections,
        formatInfo,
        readOnly: props.readOnly,
        disabled: props.disabled,
        selectedSectionIndexes,
        selectedSections,
        isEmpty: displayValue.isCleared(allSegments),
        setSelectedSections,
        setValue,
        adjustSection,
        setSection,
        getSectionValue,
        setSectionValue,
        setValueFromString,
        confirmPlaceholder,
    });
}

function useSectionsState(
    sections: DateFieldSectionWithoutPosition[],
    value: IncompleteDate,
    placeholder: DateTime,
) {
    const [state, setState] = React.useState(() => {
        return {
            value,
            sections,
            placeholder,
            editableSections: getEditableSections(sections, value, placeholder),
        };
    });

    if (sections !== state.sections || placeholder !== state.placeholder || value !== state.value) {
        setState({
            value,
            sections,
            placeholder,
            editableSections: getEditableSections(sections, value, placeholder),
        });
    }

    return state;
}
