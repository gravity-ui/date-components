import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';

import type {ValidationState} from '../../types';
import type {IncompleteDate} from '../IncompleteDate';
import type {DateFieldSection, FormatInfo} from '../types';
import {
    PAGE_STEP,
    formatSections,
    getCurrentEditableSectionIndex,
    isEditableSectionType,
} from '../utils';

export type BaseDateFieldStateOptions<T = DateTime, V = IncompleteDate> = {
    value: T | null;
    displayValue: T;
    placeholderValue?: DateTime;
    timeZone: string;
    validationState?: ValidationState;
    editableSections: DateFieldSection[];
    formatInfo: FormatInfo;
    readOnly?: boolean;
    disabled?: boolean;
    selectedSectionIndexes: {startIndex: number; endIndex: number} | null;
    selectedSections: number | 'all';
    isEmpty: boolean;
    setSelectedSections: (position: number | 'all') => void;
    setValue: (value: T | V | null) => void;
    adjustSection: (sectionIndex: number, amount: number) => void;
    setSection: (sectionIndex: number, amount: number) => void;
    getSectionValue: (sectionIndex: number) => IncompleteDate;
    setSectionValue: (sectionIndex: number, currentValue: IncompleteDate) => void;
    setValueFromString: (str: string) => boolean;
    confirmPlaceholder: () => void;
};

export type DateFieldState<T = DateTime> = {
    /** The current field value. */
    value: T | null;
    /** Is no part of value is filled. */
    isEmpty: boolean;
    /** The current used value. value or placeholderValue */
    displayValue: T;
    /** Sets the field's value. */
    setValue: (value: T | null) => void;
    /** Updates the remaining unfilled segments with the placeholder value. */
    confirmPlaceholder: () => void;
    /** Formatted value */
    text: string;
    /** Whether the field is read only. */
    readOnly?: boolean;
    /** Whether the field is disabled. */
    disabled?: boolean;
    /** A list of segments for the current value. */
    sections: DateFieldSection[];
    /** Some info about available sections */
    formatInfo: FormatInfo;
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

export function useBaseDateFieldState<T = DateTime, V = IncompleteDate>(
    props: BaseDateFieldStateOptions<T, V>,
): DateFieldState<T> {
    const {
        value,
        validationState,
        displayValue,
        editableSections,
        formatInfo,
        selectedSectionIndexes,
        selectedSections,
        isEmpty,
        setSelectedSections,
        setValue,
        adjustSection,
        setSection,
        getSectionValue,
        setSectionValue,
        setValueFromString,
        confirmPlaceholder,
    } = props;

    const enteredKeys = React.useRef('');

    return {
        value,
        isEmpty,
        displayValue,
        setValue,
        confirmPlaceholder,
        text: formatSections(editableSections),
        readOnly: props.readOnly,
        disabled: props.disabled,
        sections: editableSections,
        formatInfo,
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
                    isEditableSectionType(nextSection.type)
                        ? index
                        : nextSection.nextEditableSection,
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

            const section = this.sections[sectionIndex];

            const displayPortion = getSectionValue(sectionIndex);
            if (isEditableSectionType(section.type)) {
                setSectionValue(sectionIndex, displayPortion.clear(section.type));
            }
        },
        clearAll() {
            if (this.readOnly || this.disabled) {
                return;
            }

            enteredKeys.current = '';
            setValue(null);
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
            const isLastSection = section.nextEditableSection === sectionIndex;
            let newValue = enteredKeys.current + key;

            const onInputNumber = (numberValue: number) => {
                let sectionValue = numberValue;
                const sectionMaxValue = section.maxValue ?? 0;
                const allowsZero = section.minValue === 0;
                let shouldResetUserInput;
                if (
                    // 12-hour clock format with AM/PM
                    section.type === 'hour' &&
                    (sectionMaxValue === 11 || section.minValue === 12)
                ) {
                    if (sectionValue > 12) {
                        sectionValue = Number(key);
                        newValue = key;
                    }
                    if (sectionValue === 0) {
                        sectionValue = -Infinity;
                    }
                    if (sectionValue === 12) {
                        sectionValue = 0;
                    }
                    if (section.minValue === 12) {
                        sectionValue += 12;
                    }
                    shouldResetUserInput = Number(newValue + '0') > 12;
                } else if (sectionValue > sectionMaxValue) {
                    sectionValue = Number(key);
                    newValue = key;
                    if (sectionValue > sectionMaxValue) {
                        enteredKeys.current = '';
                        return;
                    }
                }

                const shouldSetValue = sectionValue > 0 || (sectionValue === 0 && allowsZero);
                if (shouldSetValue) {
                    setSection(sectionIndex, sectionValue);
                }

                if (shouldResetUserInput === undefined) {
                    shouldResetUserInput = Number(newValue + '0') > sectionMaxValue;
                }
                const isMaxLength = newValue.length >= String(sectionMaxValue).length;
                if (shouldResetUserInput) {
                    enteredKeys.current = '';
                    if (shouldSetValue) {
                        this.focusNextSection();
                    }
                } else if (isMaxLength && shouldSetValue && !isLastSection) {
                    this.focusNextSection();
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

                if (section.type === 'month') {
                    setSection(sectionIndex, index + 1);
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
                case 'quarter':
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
