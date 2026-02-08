import React from 'react';

import type {DateTime} from '@gravity-ui/date-utils';
import type {TextInputProps} from '@gravity-ui/uikit';

import type {
    AccessibilityProps,
    DateFieldBase,
    TextInputProps as DateFieldTextInputProps,
    DomProps,
    FocusableProps,
    InputDOMProps,
    KeyboardEvents,
    StyleProps,
    TextInputExtendProps,
} from '../../types';
import {CtrlCmd} from '../../utils/constants.js';
import {cleanString} from '../utils';

import type {DateFieldState} from './useBaseDateFieldState';
import {useFocusManager} from './useFocusManager';

export interface DateFieldProps<T = DateTime>
    extends
        DateFieldBase<T>,
        DateFieldTextInputProps,
        TextInputExtendProps,
        DomProps,
        InputDOMProps,
        FocusableProps,
        KeyboardEvents,
        StyleProps,
        AccessibilityProps {}

export function useDateFieldProps<T = DateTime>(
    state: DateFieldState<T>,
    props: DateFieldProps<T>,
): {inputProps: TextInputProps} {
    const inputRef = React.useRef<HTMLInputElement>(null);

    const [, setInnerState] = React.useState({});

    const enteredKeys = React.useRef('');

    const focusManager = useFocusManager({sections: state.sections});

    function setSelectedSections(section: 'all' | number) {
        enteredKeys.current = '';
        focusManager.setSelectedSections(section);
        setInnerState({});
    }

    React.useLayoutEffect(() => {
        const inputElement = inputRef.current;
        if (!inputElement) {
            return;
        }

        if (focusManager.selectedSectionIndexes === null) {
            if (inputElement.scrollLeft) {
                // Ensure that input content is not marked as selected.
                // setting selection range to 0 causes issues in Safari.
                // https://bugs.webkit.org/show_bug.cgi?id=224425
                inputElement.scrollLeft = 0;
            }
            return;
        }

        const firstSelectedSection = state.sections[focusManager.selectedSectionIndexes.startIndex];
        const lastSelectedSection = state.sections[focusManager.selectedSectionIndexes.endIndex];
        if (firstSelectedSection && lastSelectedSection) {
            const selectionStart = firstSelectedSection.start;
            const selectionEnd = lastSelectedSection.end;

            if (
                selectionStart !== inputElement.selectionStart ||
                selectionEnd !== inputElement.selectionEnd
            ) {
                inputElement.setSelectionRange(selectionStart, selectionEnd);
            }
        }
    });

    function syncSelectionFromDOM() {
        enteredKeys.current = '';
        focusManager.focusSectionInPosition(inputRef.current?.selectionStart ?? 0);
        setInnerState({});
    }

    const inputMode = React.useMemo(() => {
        if (!focusManager.selectedSectionIndexes) {
            return 'text';
        }

        const activeSection = state.sections[focusManager.selectedSectionIndexes.startIndex];
        if (!activeSection || activeSection.contentType === 'letter') {
            return 'text';
        }

        return 'tel';
    }, [focusManager.selectedSectionIndexes, state.sections]);

    function onInput(key: string) {
        if (state.readOnly || state.disabled) {
            return;
        }

        const sectionIndex = focusManager.activeSectionIndex;
        if (sectionIndex === -1) {
            return;
        }

        const section = state.sections[sectionIndex];
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
                state.setSection(sectionIndex, sectionValue);
            }

            if (shouldResetUserInput === undefined) {
                shouldResetUserInput = Number(newValue + '0') > sectionMaxValue;
            }
            const isMaxLength = newValue.length >= String(sectionMaxValue).length;
            if (shouldResetUserInput) {
                enteredKeys.current = '';
                if (shouldSetValue) {
                    focusManager.focusNextSection();
                }
            } else if (isMaxLength && shouldSetValue && !isLastSection) {
                focusManager.focusNextSection();
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
                state.setSection(sectionIndex, index + 1);
            } else {
                state.setSection(sectionIndex, index);
            }

            if (foundOptions.length > 1) {
                enteredKeys.current = newValue;
            } else {
                enteredKeys.current = '';
                focusManager.focusNextSection();
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
    }

    function backspace() {
        if (focusManager.selectedSectionIndexes === null) {
            return;
        }
        if (
            focusManager.selectedSectionIndexes.startIndex ===
            focusManager.selectedSectionIndexes.endIndex
        ) {
            state.clearSection(focusManager.activeSectionIndex);
        } else {
            state.clearAll();
        }
    }

    return {
        inputProps: {
            value: state.text,
            view: props.view,
            size: props.size,
            disabled: state.disabled,
            hasClear: !state.readOnly && !state.isEmpty && props.hasClear,
            placeholder: props.placeholder,
            id: props.id,
            label: props.label,
            startContent: props.startContent,
            endContent: props.endContent,
            pin: props.pin,
            autoFocus: props.autoFocus,
            controlRef: inputRef,
            autoComplete: 'off',
            type: 'text',
            validationState: state.validationState,
            errorMessage: props.errorMessage,
            errorPlacement: props.errorPlacement,
            onUpdate(value) {
                if (!value) {
                    state.clearAll();
                }
            },
            onFocus(e) {
                props.onFocus?.(e);

                if (focusManager.selectedSectionIndexes !== null) {
                    return;
                }
                const input = e.target;
                const isAutofocus = !inputRef.current;
                setTimeout(() => {
                    if (!input || input !== inputRef.current) {
                        return;
                    }
                    if (isAutofocus) {
                        focusManager.focusSectionInPosition(0);
                    } else if (
                        // avoid selecting all sections when focusing empty field without value
                        input.value.length &&
                        Number(input.selectionEnd) - Number(input.selectionStart) ===
                            input.value.length
                    ) {
                        setSelectedSections('all');
                    } else {
                        syncSelectionFromDOM();
                    }
                });
            },
            onBlur(e) {
                props.onBlur?.(e);
                setSelectedSections(-1);
                state.confirmPlaceholder();
            },
            onKeyDown(e) {
                props.onKeyDown?.(e);

                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    enteredKeys.current = '';
                    focusManager.focusPreviousSection();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    enteredKeys.current = '';
                    focusManager.focusNextSection();
                } else if (e.key === 'Home') {
                    e.preventDefault();
                    enteredKeys.current = '';
                    state.decrementToMin(focusManager.activeSectionIndex);
                } else if (e.key === 'End') {
                    e.preventDefault();
                    enteredKeys.current = '';
                    state.incrementToMax(focusManager.activeSectionIndex);
                } else if (e.key === 'ArrowUp' && !e.altKey) {
                    e.preventDefault();
                    enteredKeys.current = '';
                    state.increment(focusManager.activeSectionIndex);
                } else if (e.key === 'ArrowDown' && !e.altKey) {
                    e.preventDefault();
                    enteredKeys.current = '';
                    state.decrement(focusManager.activeSectionIndex);
                } else if (e.key === 'PageUp') {
                    e.preventDefault();
                    enteredKeys.current = '';
                    state.incrementPage(focusManager.activeSectionIndex);
                } else if (e.key === 'PageDown') {
                    e.preventDefault();
                    enteredKeys.current = '';
                    state.decrementPage(focusManager.activeSectionIndex);
                } else if (e.key === 'Backspace' || e.key === 'Delete') {
                    e.preventDefault();
                    enteredKeys.current = '';
                    backspace();
                } else if (e.key === 'a' && e[CtrlCmd]) {
                    e.preventDefault();
                    setSelectedSections('all');
                }
            },
            onKeyUp: props.onKeyUp,
            controlProps: {
                'aria-label': props['aria-label'] || undefined,
                'aria-labelledby': props['aria-labelledby'] || undefined,
                'aria-describedby': props['aria-describedby'] || undefined,
                'aria-details': props['aria-details'] || undefined,
                'aria-disabled': state.disabled || undefined,
                readOnly: state.readOnly,
                inputMode,
                onClick() {
                    syncSelectionFromDOM();
                },
                onMouseUp(e: React.MouseEvent) {
                    e.preventDefault();
                },
                onBeforeInput(e) {
                    e.preventDefault();
                    switch (e.nativeEvent.inputType) {
                        case 'deleteContentBackward':
                        case 'deleteContentForward': {
                            enteredKeys.current = '';
                            backspace();
                            break;
                        }
                        default: {
                            const key = e.data;
                            if (key !== undefined && key !== null) {
                                onInput(key);
                            }
                        }
                    }
                },
                onPaste(e: React.ClipboardEvent) {
                    e.preventDefault();
                    if (state.readOnly) {
                        return;
                    }

                    enteredKeys.current = '';
                    const pastedValue = cleanString(e.clipboardData.getData('text'));
                    if (
                        focusManager.selectedSectionIndexes &&
                        focusManager.selectedSectionIndexes.startIndex ===
                            focusManager.selectedSectionIndexes.endIndex
                    ) {
                        const activeSection = state.sections[focusManager.activeSectionIndex];

                        const digitsOnly = /^\d+$/.test(pastedValue);
                        const lettersOnly = /^[a-zA-Z]+$/.test(pastedValue);

                        const isValidValue = Boolean(
                            activeSection &&
                            ((activeSection.contentType === 'digit' && digitsOnly) ||
                                (activeSection.contentType === 'letter' && lettersOnly)),
                        );
                        if (isValidValue) {
                            onInput(pastedValue);
                            return;
                        }
                        if (digitsOnly || lettersOnly) {
                            return;
                        }
                    }

                    state.setValueFromString(pastedValue);
                },
            },
        },
    };
}
