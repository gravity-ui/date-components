import React from 'react';

import type {TextInputProps} from '@gravity-ui/uikit';

import type {DateFieldProps} from '../DateField';
import {CtrlCmd} from '../utils';

import type {DateFieldState} from './useDateFieldState';

export function useDateFieldProps(
    state: DateFieldState,
    props: DateFieldProps,
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
        const selectionStart = firstSelectedSection.start;
        const selectionEnd = lastSelectedSection.end;

        if (
            selectionStart !== inputElement.selectionStart ||
            selectionEnd !== inputElement.selectionEnd
        ) {
            inputElement.setSelectionRange(selectionStart, selectionEnd);
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
            leftContent: props.leftContent,
            rightContent: props.rightContent,
            pin: props.pin,
            tabIndex: props.tabIndex,
            autoFocus: props.autoFocus,
            controlRef: inputRef,
            autoComplete: 'off',
            type: 'text',
            error: props.error ?? state.validationState === 'invalid',
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
                const input = inputRef.current;
                setTimeout(() => {
                    if (!input || input !== inputRef.current) {
                        return;
                    }

                    if (
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
                    state.focusFirstSection();
                } else if (e.key === 'End') {
                    e.preventDefault();
                    state.focusLastSection();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    state.increment();
                } else if (e.key === 'ArrowDown') {
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
                } else if (e.key === 'a' && e[CtrlCmd]) {
                    e.preventDefault();
                    setSelectedSections('all');
                }
            },
            onKeyPress: props.onKeyPress,
            onKeyUp: props.onKeyUp,
            controlProps: {
                inputMode: 'tel',
                onClick() {
                    syncSelectionFromDOM();
                },
                onMouseUp(e: React.MouseEvent) {
                    e.preventDefault();
                },
                onBeforeInput(e: React.FormEvent) {
                    e.preventDefault();
                    // @ts-expect-error
                    const key = e.nativeEvent.data;
                    // eslint-disable-next-line no-eq-null, eqeqeq
                    if (key != null) {
                        state.onInput(key);
                    }
                },
            },
        },
    };
}
