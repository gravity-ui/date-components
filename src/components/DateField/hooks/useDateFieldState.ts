import React from 'react';

import {dateTime, isValid} from '@gravity-ui/date-utils';
import type {DateTime} from '@gravity-ui/date-utils';

import {useControlledState} from '../../hooks/useControlledState.js';
import type {DateFieldBase} from '../../types/datePicker.js';
import type {ValidationState} from '../../types/inputs.js';
import {createPlaceholderValue, isInvalid, mergeDateTime} from '../../utils/dates.js';
import type {
    DateFieldSection,
    DateFieldSectionType,
    DateFieldSectionWithoutPosition,
} from '../types.js';
import {splitFormatIntoSections} from '../utils.js';

export interface DateFieldStateOptions extends DateFieldBase {}

const EDITABLE_SEGMENTS: Partial<Record<DateFieldSectionType, boolean>> = {
    year: true,
    month: true,
    day: true,
    hour: true,
    minute: true,
    second: true,
    dayPeriod: true,
    weekday: true,
};

const TYPE_MAPPING = {
    weekday: 'day',
    day: 'date',
    dayPeriod: 'hour',
} as const;

const PAGE_STEP: Partial<Record<DateFieldSectionType, number>> = {
    year: 5,
    month: 2,
    weekday: 3,
    day: 7,
    hour: 2,
    minute: 15,
    second: 15,
};

export type DateFieldState = {
    /** The current field value. */
    value: DateTime | null;
    /** Is no part of value is filled. */
    isEmpty: boolean;
    /** The current used value. value or placeholderValue */
    displayValue: DateTime;
    /** Sets the field's value. */
    setValue: (value: DateTime) => void;
    /** Formatted value */
    text: string;
    /** Whether the field is read only. */
    readOnly?: boolean;
    /** Whether the field is disabled. */
    disabled?: boolean;
    /** A list of segments for the current value. */
    sections: DateFieldSection[];
    /** Selected sections */
    selectedSectionIndexes: {startIndex: number; endIndex: number} | null;
    /** The current validation state of the date field, based on the `validationState`, `minValue`, and `maxValue` props. */
    validationState?: ValidationState;
    /** Sets selection for segment in position. */
    setSelectedSections: (position: number | 'all') => void;
    /** Focuses segment in position */
    focusSectionInPosition: (position: number) => void;
    /** Focuses the next segment if present */
    focusNextSection: () => void;
    /** Focuses the previous segment if present */
    focusPreviousSection: () => void;
    /** Focuses the first segment */
    focusFirstSection: () => void;
    /** Focuses the last segment */
    focusLastSection: () => void;
    /** Increments the currently selected segment. Upon reaching the minimum or maximum value, the value wraps around to the opposite limit. */
    increment: () => void;
    /** Decrements the currently selected segment. Upon reaching the minimum or maximum value, the value wraps around to the opposite limit. */
    decrement: () => void;
    /**
     * Increments the currently selected segment by a larger amount, rounding it to the nearest increment.
     * The amount to increment by depends on the field, for example 15 minutes, 7 days, and 5 years.
     * Upon reaching the minimum or maximum value, the value wraps around to the opposite limit.
     */
    incrementPage: () => void;
    /**
     * Decrements the currently selected segment by a larger amount, rounding it to the nearest decrement.
     * The amount to increment by depends on the field, for example 15 minutes, 7 days, and 5 years.
     * Upon reaching the minimum or maximum value, the value wraps around to the opposite limit.
     */
    decrementPage: () => void;
    /** Clears the value of the currently selected segment, reverting it to the placeholder. */
    clearSection: () => void;
    /** Clears all segments, reverting them to the placeholder. */
    clearAll: () => void;
    /** Handles input key in the currently selected segment */
    onInput: (key: string) => void;
    //** Tries to set value from str. Supports date in input format or ISO */
    setValueFromString: (str: string) => boolean;
};

export function useDateFieldState(props: DateFieldStateOptions): DateFieldState {
    const [value, setDate] = useControlledState(props.value, props.defaultValue, props.onUpdate);

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
                .reduce<typeof EDITABLE_SEGMENTS>((p, seg) => {
                    p[seg.type] = true;
                    return p;
                }, {}),
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

    const [selectedSections, setSelectedSections] = React.useState<number | 'all'>(() => {
        return sectionsState.editableSections[0]?.previousEditableSection ?? -1;
    });

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
            setDate(newValue);
        } else {
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

    function setSection(section: DateFieldSection, amount: number) {
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

    const enteredKeys = React.useRef('');

    const validationState =
        props.validationState ||
        (isInvalid(value, props.minValue, props.maxValue) ? 'invalid' : undefined) ||
        (value && props.isDateUnavailable?.(value) ? 'invalid' : undefined);

    return {
        value: value ?? null,
        isEmpty: Object.keys(validSegments).length === 0,
        displayValue,
        setValue,
        text: sectionsState.editableSections.map((s) => s.textValue).join(''),
        readOnly: props.readOnly,
        disabled: props.disabled,
        sections: sectionsState.editableSections,
        selectedSectionIndexes,
        validationState,
        setSelectedSections(position) {
            enteredKeys.current = '';
            setSelectedSections(position);
        },
        focusSectionInPosition(position) {
            const nextSectionIndex = this.sections.findIndex((s) => s.end >= position);
            const index = nextSectionIndex === -1 ? 0 : nextSectionIndex;
            const nextSection = this.sections[index];
            if (nextSection) {
                this.setSelectedSections(
                    EDITABLE_SEGMENTS[nextSection.type] ? index : nextSection.nextEditableSection,
                );
            }
        },
        focusNextSection() {
            const currentIndex = selectedSections === 'all' ? 0 : selectedSections;
            const newIndex = this.sections[currentIndex]?.nextEditableSection ?? -1;
            if (newIndex !== -1) {
                this.setSelectedSections(newIndex);
            }
        },
        focusPreviousSection() {
            const currentIndex = selectedSections === 'all' ? 0 : selectedSections;
            const newIndex = this.sections[currentIndex]?.previousEditableSection ?? -1;
            if (newIndex !== -1) {
                this.setSelectedSections(newIndex);
            }
        },
        focusFirstSection() {
            const newIndex = this.sections[0]?.previousEditableSection ?? -1;
            if (newIndex !== -1) {
                setSelectedSections(newIndex);
            }
        },
        focusLastSection() {
            const newIndex = this.sections[this.sections.length - 1]?.nextEditableSection ?? -1;
            if (newIndex !== -1) {
                this.setSelectedSections(newIndex);
            }
        },
        increment() {
            if (this.readOnly || this.disabled) {
                return;
            }

            enteredKeys.current = '';
            const sectionIndex = getCurrentEditableSectionIndex(this.sections, selectedSections);
            if (sectionIndex !== -1) {
                adjustSection(sectionIndex, 1);
            }
        },
        decrement() {
            if (this.readOnly || this.disabled) {
                return;
            }

            enteredKeys.current = '';
            const sectionIndex = getCurrentEditableSectionIndex(this.sections, selectedSections);
            if (sectionIndex !== -1) {
                adjustSection(sectionIndex, -1);
            }
        },
        incrementPage() {
            if (this.readOnly || this.disabled) {
                return;
            }

            enteredKeys.current = '';
            const sectionIndex = getCurrentEditableSectionIndex(this.sections, selectedSections);
            if (sectionIndex !== -1) {
                adjustSection(sectionIndex, PAGE_STEP[this.sections[sectionIndex].type] || 1);
            }
        },
        decrementPage() {
            if (this.readOnly || this.disabled) {
                return;
            }

            enteredKeys.current = '';
            const sectionIndex = getCurrentEditableSectionIndex(this.sections, selectedSections);
            if (sectionIndex !== -1) {
                adjustSection(sectionIndex, -(PAGE_STEP[this.sections[sectionIndex].type] || 1));
            }
        },
        clearSection() {
            if (this.readOnly || this.disabled) {
                return;
            }

            enteredKeys.current = '';
            if (selectedSections === 'all') {
                this.clearAll();
                return;
            }

            const sectionIndex = getCurrentEditableSectionIndex(this.sections, selectedSections);
            if (sectionIndex === -1) {
                return;
            }

            const section = this.sections[sectionIndex];
            delete validSegments[section.type];
            setValidSegments({...validSegments});

            const placeholder = createPlaceholderValue({
                placeholderValue: props.placeholderValue,
                timeZone: props.timeZone,
            });
            let currentValue = displayValue;

            // Reset day period to default without changing the hour.
            if (section.type === 'dayPeriod') {
                const isPM = displayValue.hour() >= 12;
                const shouldBePM = placeholder.hour() >= 12;
                if (isPM && !shouldBePM) {
                    currentValue = displayValue.set('hour', displayValue.hour() - 12);
                } else if (!isPM && shouldBePM) {
                    currentValue = displayValue.set('hour', displayValue.hour() + 12);
                }
            } else {
                const type = getDurationUnitFromSectionType(section.type);
                currentValue = displayValue.set(type, placeholder[type]());
            }

            if (value) {
                setDate(null);
            }
            setValue(currentValue);
        },
        clearAll() {
            if (this.readOnly || this.disabled) {
                return;
            }

            enteredKeys.current = '';
            validSegments = {};
            setValidSegments({});
            if (value !== null) {
                setDate(null);
            }
            setValue(
                createPlaceholderValue({
                    placeholderValue: props.placeholderValue,
                    timeZone: props.timeZone,
                }),
            );
        },
        onInput(key: string) {
            if (this.readOnly || this.disabled) {
                return;
            }

            const sectionIndex = getCurrentEditableSectionIndex(this.sections, selectedSections);
            if (sectionIndex === -1) {
                return;
            }

            const section = this.sections[sectionIndex];
            let newValue = enteredKeys.current + key;

            const onInputNumber = (numberValue: number) => {
                let sectionValue = section.type === 'month' ? numberValue - 1 : numberValue;
                const allowsZero = section.minValue === 0;
                if (
                    section.type === 'hour' &&
                    (section.minValue === 12 || section.maxValue === 11)
                ) {
                    if (numberValue > 12) {
                        sectionValue = Number(key);
                    }
                    if (section.minValue === 12 && sectionValue > 1) {
                        sectionValue += 12;
                    }
                } else if (sectionValue > (section.maxValue ?? 0)) {
                    sectionValue = Number(key) - (section.type === 'month' ? 1 : 0);
                    newValue = key;
                    if (sectionValue > (section.maxValue ?? 0)) {
                        enteredKeys.current = '';
                        return;
                    }
                }

                const shouldSetValue = sectionValue > 0 || (sectionValue === 0 && allowsZero);
                if (shouldSetValue) {
                    setSection(section, sectionValue);
                }

                if (
                    Number(numberValue + '0') > (section.maxValue ?? 0) ||
                    newValue.length >= String(section.maxValue).length
                ) {
                    enteredKeys.current = '';
                    if (shouldSetValue) {
                        this.focusNextSection();
                    }
                } else {
                    enteredKeys.current = newValue;
                }
            };

            const onInputString = (stringValue: string) => {
                const options = section.options ?? [];
                let sectionValue = stringValue.toLocaleUpperCase();
                let foundOptions = options.filter((v) => v.startsWith(sectionValue));
                if (foundOptions.length === 0) {
                    if (stringValue !== key) {
                        sectionValue = key.toLocaleUpperCase();
                        foundOptions = options.filter((v) => v.startsWith(sectionValue));
                    }
                    if (foundOptions.length === 0) {
                        enteredKeys.current = '';
                        return;
                    }
                }
                const foundValue = foundOptions[0];
                const index = options.indexOf(foundValue);

                if (section.type === 'dayPeriod') {
                    setSection(section, index === 1 ? 12 : 0);
                } else {
                    setSection(section, index);
                }

                if (foundOptions.length > 1) {
                    enteredKeys.current = newValue;
                } else {
                    enteredKeys.current = '';
                    this.focusNextSection();
                }
            };

            switch (section.type) {
                case 'day':
                case 'hour':
                case 'minute':
                case 'second':
                case 'year': {
                    if (!Number.isInteger(Number(newValue))) {
                        return;
                    }
                    const numberValue = Number(newValue);
                    onInputNumber(numberValue);
                    break;
                }
                case 'dayPeriod': {
                    onInputString(newValue);
                    break;
                }
                case 'weekday':
                case 'month': {
                    if (Number.isInteger(Number(newValue))) {
                        const numberValue = Number(newValue);
                        onInputNumber(numberValue);
                    } else {
                        onInputString(newValue);
                    }
                    break;
                }
            }
        },
        setValueFromString(str: string) {
            let date = parseDate({input: str, format, timeZone: props.timeZone});
            if (isValid(date)) {
                if (props.timeZone && !isDateStringWithTimeZone(str)) {
                    const time = parseDate({input: str, format});
                    date = mergeDateTime(date, time);
                }
                setDate(date);
                return true;
            }
            return false;
        },
    };
}

function parseDate(options: {input: string; format: string; timeZone?: string}) {
    let date = dateTime(options);
    if (!isValid(date)) {
        date = dateTime({...options, format: undefined});
    }
    return date;
}

function isDateStringWithTimeZone(str: string) {
    return /z$/i.test(str) || /[+-]\d\d:\d\d$/.test(str);
}

function addSegment(section: DateFieldSection, date: DateTime, amount: number) {
    let val = section.value ?? 0;
    if (section.type === 'dayPeriod') {
        val = date.hour() + (date.hour() > 12 ? -12 : 12);
    } else {
        val = val + amount;
        const min = section.minValue;
        const max = section.maxValue;
        if (typeof min === 'number' && typeof max === 'number') {
            const length = max - min + 1;
            val = ((val - min + length) % length) + min;
        }
    }
    const type = getDurationUnitFromSectionType(section.type);
    return date.set(type, val);
}

function setSegment(section: DateFieldSection, date: DateTime, amount: number) {
    const type = section.type;
    switch (type) {
        case 'day':
        case 'weekday':
        case 'month':
        case 'year': {
            return date.set(getDurationUnitFromSectionType(type), amount);
        }
        case 'dayPeriod': {
            const hours = date.hour();
            const wasPM = hours >= 12;
            const isPM = amount >= 12;
            if (isPM === wasPM) {
                return date;
            }
            return date.set('hour', wasPM ? hours - 12 : hours + 12);
        }
        case 'hour': {
            // In 12 hour time, ensure that AM/PM does not change
            let sectionAmount = amount;
            if (section.minValue === 12 || section.maxValue === 11) {
                const hours = date.hour();
                const wasPM = hours >= 12;
                if (!wasPM && sectionAmount === 12) {
                    sectionAmount = 0;
                }
                if (wasPM && sectionAmount < 12) {
                    sectionAmount += 12;
                }
            }
            return date.set('hour', sectionAmount);
        }
        case 'minute':
        case 'second': {
            return date.set(type, amount);
        }
    }

    return date;
}

function getCurrentEditableSectionIndex(
    sections: DateFieldSection[],
    selectedSections: 'all' | number,
) {
    const currentIndex =
        selectedSections === 'all' || selectedSections === -1 ? 0 : selectedSections;
    const section = sections[currentIndex];
    if (section && !EDITABLE_SEGMENTS[section.type]) {
        return section.nextEditableSection;
    }
    return section ? currentIndex : -1;
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

function getEditableSections(
    sections: DateFieldSectionWithoutPosition[],
    value: DateTime,
    validSegments: typeof EDITABLE_SEGMENTS,
) {
    let position = 0;
    const newSections: DateFieldSection[] = [];
    let previousEditableSection = -1;
    for (let i = 0; i < sections.length; i++) {
        const section = sections[i];

        const isEditable = EDITABLE_SEGMENTS[section.type];
        let renderedValue = section.placeholder;
        if ((isEditable && validSegments[section.type]) || section.type === 'timeZoneName') {
            renderedValue = value.format(section.format);
        }

        const sectionLength = renderedValue.length;

        const newSection = {
            ...section,
            value: getValue(value, section.type),
            textValue: renderedValue,
            start: position,
            end: position + sectionLength,
            modified: false,
            previousEditableSection,
            nextEditableSection: previousEditableSection,
            ...getSectionLimits(value, section.type, {hour12: isHour12(section)}),
        };

        newSections.push(newSection);

        if (isEditable) {
            for (let j = Math.max(0, previousEditableSection); j <= i; j++) {
                const prevSection = newSections[j];
                if (prevSection) {
                    prevSection.nextEditableSection = i;
                    if (prevSection.previousEditableSection === -1) {
                        prevSection.previousEditableSection = i;
                    }
                }
            }
            previousEditableSection = i;
        }

        position += sectionLength;
    }

    return newSections;
}

function getValue(date: DateTime, type: DateFieldSectionType) {
    switch (type) {
        case 'year':
        case 'month':
        case 'hour':
        case 'minute':
        case 'second': {
            return date[type]();
        }
        case 'day': {
            return date.date();
        }
        case 'weekday': {
            return date.day();
        }
        case 'dayPeriod': {
            return date.hour() >= 12 ? 12 : 0;
        }
    }
    return undefined;
}

function isHour12(section: DateFieldSectionWithoutPosition) {
    if (section.type === 'hour') {
        return dateTime().set('hour', 15).format(section.format) !== '15';
    }
    return false;
}

function getSectionLimits(date: DateTime, type: DateFieldSectionType, options: {hour12: boolean}) {
    switch (type) {
        case 'year': {
            return {
                minValue: 1,
                maxValue: 9999,
            };
        }
        case 'month': {
            return {
                minValue: 0,
                maxValue: 11,
            };
        }
        case 'weekday': {
            return {
                minValue: 0,
                maxValue: 6,
            };
        }
        case 'day': {
            return {
                minValue: 1,
                maxValue: date ? date.daysInMonth() : 31,
            };
        }
        case 'hour': {
            if (options.hour12) {
                const isPM = date.hour() >= 12;
                return {
                    minValue: isPM ? 12 : 0,
                    maxValue: isPM ? 23 : 11,
                };
            }
            return {
                minValue: 0,
                maxValue: 23,
            };
        }
        case 'minute':
        case 'second': {
            return {
                minValue: 0,
                maxValue: 59,
            };
        }
    }
    return {};
}

function getDurationUnitFromSectionType(type: DateFieldSectionType) {
    if (type === 'literal' || type === 'timeZoneName' || type === 'unknown') {
        throw new Error(`${type} section does not have duration unit.`);
    }

    if (type in TYPE_MAPPING) {
        return TYPE_MAPPING[type as keyof typeof TYPE_MAPPING];
    }

    return type as Exclude<
        DateFieldSectionType,
        keyof typeof TYPE_MAPPING | 'literal' | 'timeZoneName' | 'unknown'
    >;
}
