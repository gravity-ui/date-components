import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';

import type {ValidationState} from '../../types';
import {createPlaceholderValue} from '../../utils/dates';
import type {DateFieldSection, DateFieldSectionType} from '../types';
import {
    EDITABLE_SEGMENTS,
    formatSections,
    getCurrentEditableSectionIndex,
    getDurationUnitFromSectionType,
} from '../utils';

const PAGE_STEP: Partial<Record<DateFieldSectionType, number>> = {
    year: 5,
    month: 2,
    weekday: 3,
    day: 7,
    hour: 2,
    minute: 15,
    second: 15,
};

export type BaseDateFieldStateOptions<T = DateTime> = {
    value: T | null;
    displayValue: T;
    placeholderValue?: DateTime;
    timeZone: string;
    validationState?: ValidationState;
    editableSections: DateFieldSection[];
    readOnly?: boolean;
    disabled?: boolean;
    selectedSectionIndexes: {startIndex: number; endIndex: number} | null;
    selectedSections: number | 'all';
    isEmpty: boolean;
    flushAllValidSections: () => void;
    flushValidSection: (sectionIndex: number) => void;
    setSelectedSections: (position: number | 'all') => void;
    setValue: (value: T) => void;
    setDate: (value: T | null) => void;
    adjustSection: (sectionIndex: number, amount: number) => void;
    setSection: (sectionIndex: number, amount: number) => void;
    getSectionValue: (sectionIndex: number) => DateTime;
    setSectionValue: (sectionIndex: number, currentValue: DateTime) => void;
    createPlaceholder: () => T;
    setValueFromString: (str: string) => boolean;
};

export type DateFieldState<T = DateTime> = {
    /** The current field value. */
    value: T | null;
    /** Is no part of value is filled. */
    isEmpty: boolean;
    /** The current used value. value or placeholderValue */
    displayValue: T;
    /** Sets the field's value. */
    setValue: (value: T) => void;
    /** Formatted value */
    text: string;
    /** Whether the field is read only. */
    readOnly?: boolean;
    /** Whether the field is disabled. */
    disabled?: boolean;
    /** A list of segments for the current value. */
    sections: DateFieldSection[];
    /** Whether the the format is containing date parts */
    hasDate: boolean;
    /** Whether the the format is containing time parts */
    hasTime: boolean;
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
    incrementToMax: () => void;
    decrementToMin: () => void;
    /** Clears the value of the currently selected segment, reverting it to the placeholder. */
    clearSection: () => void;
    /** Clears all segments, reverting them to the placeholder. */
    clearAll: () => void;
    /** Handles input key in the currently selected segment */
    onInput: (key: string) => void;
    //** Tries to set value from str. Supports date in input format or ISO */
    setValueFromString: (str: string) => boolean;
};

export function useBaseDateFieldState<T = DateTime>(
    props: BaseDateFieldStateOptions<T>,
): DateFieldState<T> {
    const {
        value,
        validationState,
        displayValue,
        editableSections,
        selectedSectionIndexes,
        selectedSections,
        isEmpty,
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
    } = props;

    const enteredKeys = React.useRef('');

    const {hasDate, hasTime} = React.useMemo(() => {
        let hasDateInner = false;
        let hasTimeInner = false;
        for (const s of editableSections) {
            hasTimeInner ||= ['hour', 'minute', 'second'].includes(s.type);
            hasDateInner ||= ['day', 'month', 'year'].includes(s.type);
        }
        return {
            hasTime: hasTimeInner,
            hasDate: hasDateInner,
        };
    }, [editableSections]);

    return {
        value,
        isEmpty,
        displayValue,
        setValue,
        text: formatSections(editableSections),
        readOnly: props.readOnly,
        disabled: props.disabled,
        sections: editableSections,
        hasDate,
        hasTime,
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
        incrementToMax() {
            if (this.readOnly || this.disabled) {
                return;
            }
            enteredKeys.current = '';
            const sectionIndex = getCurrentEditableSectionIndex(this.sections, selectedSections);
            if (sectionIndex !== -1) {
                const section = this.sections[sectionIndex];
                if (typeof section.maxValue === 'number') {
                    setSection(sectionIndex, section.maxValue);
                }
            }
        },
        decrementToMin() {
            if (this.readOnly || this.disabled) {
                return;
            }
            enteredKeys.current = '';
            const sectionIndex = getCurrentEditableSectionIndex(this.sections, selectedSections);
            if (sectionIndex !== -1) {
                const section = this.sections[sectionIndex];
                if (typeof section.minValue === 'number') {
                    setSection(sectionIndex, section.minValue);
                }
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

            flushValidSection(sectionIndex);

            const section = this.sections[sectionIndex];

            const placeholder = createPlaceholderValue({
                placeholderValue: props.placeholderValue,
                timeZone: props.timeZone,
            }).timeZone(props.timeZone);

            const displayPortion = getSectionValue(sectionIndex);
            let currentValue = displayPortion;

            // Reset day period to default without changing the hour.
            if (section.type === 'dayPeriod') {
                const isPM = displayPortion.hour() >= 12;
                const shouldBePM = placeholder.hour() >= 12;
                if (isPM && !shouldBePM) {
                    currentValue = displayPortion.set('hour', displayPortion.hour() - 12);
                } else if (!isPM && shouldBePM) {
                    currentValue = displayPortion.set('hour', displayPortion.hour() + 12);
                }
            } else {
                const type = getDurationUnitFromSectionType(section.type);
                currentValue = displayPortion.set(type, placeholder[type]());
            }

            setSectionValue(sectionIndex, currentValue);
        },
        clearAll() {
            if (this.readOnly || this.disabled) {
                return;
            }

            enteredKeys.current = '';
            flushAllValidSections();
            if (value !== null) {
                setDate(null);
            }

            const date = createPlaceholder();

            setValue(date);
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
                    setSection(sectionIndex, sectionValue);
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
                    setSection(sectionIndex, index === 1 ? 12 : 0);
                } else {
                    setSection(sectionIndex, index);
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
            enteredKeys.current = '';
            return setValueFromString(str);
        },
    };
}
