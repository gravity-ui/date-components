import type {DateTime} from '@gravity-ui/date-utils';

import type {ValidationState} from '../../types';
import type {IncompleteDate} from '../IncompleteDate';
import type {DateFieldSection, FormatInfo} from '../types';
import {PAGE_STEP, formatSections} from '../utils';

interface BaseDateFieldStateOptions<T = DateTime, V = IncompleteDate> {
    value: T | null;
    displayValue: T;
    validationState?: ValidationState;
    editableSections: DateFieldSection[];
    formatInfo: FormatInfo;
    readOnly?: boolean;
    disabled?: boolean;
    isEmpty: boolean;
    setValue: (value: T | V | null) => void;
    adjustSection: (sectionIndex: number, amount: number) => void;
    setSection: (sectionIndex: number, amount: number) => void;
    clearSection: (sectionIndex: number) => void;
    setValueFromString: (str: string) => boolean;
    confirmPlaceholder: () => void;
}

export interface DateFieldState<T = DateTime> {
    /** The current field value. */
    value: T | null;
    /** Is no part of value is filled. */
    isEmpty: boolean;
    /** The current used value. value or placeholderValue */
    displayValue: T;
    /** Sets the field's value. */
    setValue: (value: T | null) => void;
    /** Updates the remaining unfilled sections with the placeholder value. */
    confirmPlaceholder: () => void;
    /** Formatted value */
    text: string;
    /** Whether the field is read only. */
    readOnly?: boolean;
    /** Whether the field is disabled. */
    disabled?: boolean;
    /** A list of sections for the current value. */
    sections: DateFieldSection[];
    /** Some info about available sections */
    formatInfo: FormatInfo;
    /** The current validation state of the date field, based on the `validationState`, `minValue`, and `maxValue` props. */
    validationState?: ValidationState;
    /** Increments the currently selected section. Upon reaching the minimum or maximum value, the value wraps around to the opposite limit. */
    increment: (sectionIndex: number) => void;
    /** Decrements the currently selected section. Upon reaching the minimum or maximum value, the value wraps around to the opposite limit. */
    decrement: (sectionIndex: number) => void;
    /**
     * Increments the currently selected section by a larger amount, rounding it to the nearest increment.
     * The amount to increment by depends on the field, for example 15 minutes, 7 days, and 5 years.
     * Upon reaching the minimum or maximum value, the value wraps around to the opposite limit.
     */
    incrementPage: (sectionIndex: number) => void;
    /**
     * Decrements the currently selected section by a larger amount, rounding it to the nearest decrement.
     * The amount to increment by depends on the field, for example 15 minutes, 7 days, and 5 years.
     * Upon reaching the minimum or maximum value, the value wraps around to the opposite limit.
     */
    decrementPage: (sectionIndex: number) => void;
    incrementToMax: (sectionIndex: number) => void;
    decrementToMin: (sectionIndex: number) => void;
    /** Clears the value of the currently selected section, reverting it to the placeholder. */
    clearSection: (sectionIndex: number) => void;
    /** Clears all sections, reverting them to the placeholder. */
    clearAll: () => void;
    /** Sets the value of the given section. */
    setSection: (sectionIndex: number, amount: number) => void;
    //** Tries to set value from str. Supports date in input format or ISO */
    setValueFromString: (str: string) => boolean;
}

export function useBaseDateFieldState<T = DateTime, V = IncompleteDate>(
    props: BaseDateFieldStateOptions<T, V>,
): DateFieldState<T> {
    const {
        value,
        validationState,
        displayValue,
        editableSections,
        formatInfo,
        isEmpty,
        setValue,
        adjustSection,
        setSection,
        clearSection,
        setValueFromString,
        confirmPlaceholder,
    } = props;

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
        validationState,
        setSection,
        increment(sectionIndex) {
            if (this.readOnly || this.disabled) {
                return;
            }

            if (sectionIndex !== -1) {
                adjustSection(sectionIndex, 1);
            }
        },
        decrement(sectionIndex) {
            if (this.readOnly || this.disabled) {
                return;
            }

            if (sectionIndex !== -1) {
                adjustSection(sectionIndex, -1);
            }
        },
        incrementPage(sectionIndex) {
            if (this.readOnly || this.disabled) {
                return;
            }

            if (sectionIndex !== -1) {
                adjustSection(sectionIndex, PAGE_STEP[this.sections[sectionIndex].type] || 1);
            }
        },
        decrementPage(sectionIndex) {
            if (this.readOnly || this.disabled) {
                return;
            }

            if (sectionIndex !== -1) {
                adjustSection(sectionIndex, -(PAGE_STEP[this.sections[sectionIndex].type] || 1));
            }
        },
        incrementToMax(sectionIndex) {
            if (this.readOnly || this.disabled) {
                return;
            }
            if (sectionIndex !== -1) {
                const section = this.sections[sectionIndex];
                if (typeof section.maxValue === 'number') {
                    setSection(sectionIndex, section.maxValue);
                }
            }
        },
        decrementToMin(sectionIndex) {
            if (this.readOnly || this.disabled) {
                return;
            }
            if (sectionIndex !== -1) {
                const section = this.sections[sectionIndex];
                if (typeof section.minValue === 'number') {
                    setSection(sectionIndex, section.minValue);
                }
            }
        },
        clearSection(sectionIndex) {
            if (this.readOnly || this.disabled) {
                return;
            }

            if (sectionIndex === -1) {
                return;
            }

            clearSection(sectionIndex);
        },
        clearAll() {
            if (this.readOnly || this.disabled) {
                return;
            }

            setValue(null);
        },
        setValueFromString,
    };
}
