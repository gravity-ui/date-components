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
import {cleanString} from '../utils';

import type {DateFieldState} from './useBaseDateFieldState';

export interface DateFieldProps<T = DateTime>
    extends DateFieldBase<T>,
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

    function setSelectedSections(section: 'all' | number) {
        state.setSelectedSections(section);
        setInnerState({});
    }

    React.useLayoutEffect(() => {
        const inputElement = inputRef.current;
        if (!inputElement) {
            return;
        }

        if (state.selectedSectionIndexes === null) {
            if (inputElement.scrollLeft) {
                // Ensure that input content is not marked as selected.
                // setting selection range to 0 causes issues in Safari.
                // https://bugs.webkit.org/show_bug.cgi?id=224425
                inputElement.scrollLeft = 0;
            }
            return;
        }

        const firstSelectedSection = state.sections[state.selectedSectionIndexes.startIndex];
        const lastSelectedSection = state.sections[state.selectedSectionIndexes.endIndex];
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
        if (state.readOnly) {
            setSelectedSections(-1);
            return;
        }
        state.focusSectionInPosition(inputRef.current?.selectionStart ?? 0);
        setInnerState({});
    }

    const inputMode = React.useMemo(() => {
        if (!state.selectedSectionIndexes) {
            return 'text';
        }

        const activeSection = state.sections[state.selectedSectionIndexes.startIndex];
        if (!activeSection || activeSection.contentType === 'letter') {
            return 'text';
        }

        return 'tel';
    }, [state.selectedSectionIndexes, state.sections]);

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

                if (state.selectedSectionIndexes !== null) {
                    return;
                }
                const input = e.target;
                const isAutofocus = !inputRef.current;
                setTimeout(() => {
                    if (!input || input !== inputRef.current) {
                        return;
                    }
                    if (isAutofocus) {
                        state.focusSectionInPosition(0);
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
            },
            onKeyDown(e) {
                props.onKeyDown?.(e);

                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    state.focusPreviousSection();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    state.focusNextSection();
                } else if (e.key === 'Home') {
                    e.preventDefault();
                    state.decrementToMin();
                } else if (e.key === 'End') {
                    e.preventDefault();
                    state.incrementToMax();
                } else if (e.key === 'ArrowUp' && !e.altKey) {
                    e.preventDefault();
                    state.increment();
                } else if (e.key === 'ArrowDown' && !e.altKey) {
                    e.preventDefault();
                    state.decrement();
                } else if (e.key === 'PageUp') {
                    e.preventDefault();
                    state.incrementPage();
                } else if (e.key === 'PageDown') {
                    e.preventDefault();
                    state.decrementPage();
                } else if (e.key === 'Backspace' || e.key === 'Delete') {
                    e.preventDefault();
                    state.clearSection();
                } else if (e.key === 'a' && (e['ctrlKey'] || e['metaKey'])) {
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
                inputMode,
                onClick() {
                    syncSelectionFromDOM();
                },
                onMouseUp(e: React.MouseEvent) {
                    e.preventDefault();
                },
                onBeforeInput(e) {
                    e.preventDefault();
                    // @ts-expect-error
                    const key = e.data;
                    if (key !== undefined && key !== null) {
                        state.onInput(key);
                    }
                },
                onPaste(e: React.ClipboardEvent) {
                    e.preventDefault();
                    if (state.readOnly) {
                        return;
                    }

                    const pastedValue = cleanString(e.clipboardData.getData('text'));
                    if (
                        state.selectedSectionIndexes &&
                        state.selectedSectionIndexes.startIndex ===
                            state.selectedSectionIndexes.endIndex
                    ) {
                        const activeSection =
                            state.sections[state.selectedSectionIndexes.startIndex];

                        const digitsOnly = /^\d+$/.test(pastedValue);
                        const lettersOnly = /^[a-zA-Z]+$/.test(pastedValue);

                        const isValidValue = Boolean(
                            activeSection &&
                                ((activeSection.contentType === 'digit' && digitsOnly) ||
                                    (activeSection.contentType === 'letter' && lettersOnly)),
                        );
                        if (isValidValue) {
                            state.onInput(pastedValue);
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
