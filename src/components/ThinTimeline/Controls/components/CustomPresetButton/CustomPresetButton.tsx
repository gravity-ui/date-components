import React from 'react';

import {Button, List, Popup, TextInput} from '@gravity-ui/uikit';

import {block} from '../../../../../utils/cn';
import {useReferentiallyConstantObject} from '../../../hooks/useReferentiallyConstantObject';
import {isRangeLikeString} from '../../presets';

import {createSuggestValues} from './utils/createSuggestValues';

import './CustomPresetButton.scss';

interface CustomPresetButtonProps {
    value?: string;
    suggestLimit?: string;
    onUpdate: (value: string) => void;
}

const b = block('thin-timeline-custom-btn');

export function CustomPresetButton({
    value,
    suggestLimit = '2y',
    onUpdate,
}: CustomPresetButtonProps) {
    const [isActive, setIsActive] = React.useState(false);
    const [inputText, setInputText] = React.useState('');

    const [hasError, setHasError] = React.useState(false);

    const isSelected = Boolean(value);
    const lateBoundValues = useReferentiallyConstantObject({value, hasError});

    const activate = React.useCallback(() => {
        setIsActive(true);
        setHasError(false);
    }, [lateBoundValues]);
    const deactivate = React.useCallback(() => {
        setIsActive(false);
        setHasError(false);
        setInputText('');
    }, []);

    const listRef = React.useRef<List<string>>(null);
    const anchorRef = React.useRef<HTMLDivElement>(null);
    const textInputRef = React.useRef<HTMLInputElement>(null);

    const handleKeyDown = React.useCallback(
        (ev: React.KeyboardEvent<HTMLInputElement>) => {
            listRef.current?.onKeyDown(ev);
            if (ev.defaultPrevented) {
                return;
            }

            const newValue = ev.currentTarget.value;
            switch (ev.key) {
                case 'Enter':
                    if (!newValue) {
                        deactivate();
                        ev.preventDefault();
                        return;
                    }

                    if (isRangeLikeString(newValue)) {
                        onUpdate(newValue);
                        deactivate();
                    } else {
                        setHasError(true);
                    }

                    ev.preventDefault();
                    return;

                case 'Escape':
                    deactivate();
                    return;
            }

            if (lateBoundValues.hasError) {
                setHasError(false);
            }
        },
        [deactivate, lateBoundValues, onUpdate],
    );

    const handleBlur = React.useCallback(
        (ev: React.FocusEvent<HTMLInputElement>) => {
            if (document.activeElement === ev.target) {
                // the whole page lost its focus, ignore
                return;
            }

            if (ev.target === textInputRef.current) {
                // Prevent blur if autocomplete item was clicked
                return;
            }

            deactivate();
        },
        [deactivate],
    );

    const autocompleteItems = React.useMemo(() => {
        if (!inputText) {
            return [];
        }

        return createSuggestValues(suggestLimit, inputText);
    }, [inputText]);

    const renderItem = React.useCallback(
        (item: string) => <div className={b('completion-item')}>{item}</div>,
        [],
    );
    const pickItem = React.useCallback(
        (item: string) => {
            onUpdate(item);
            deactivate();
        },
        [deactivate, onUpdate],
    );

    return (
        <div ref={anchorRef} className={b()}>
            {isSelected && !isActive && (
                <Button
                    size="s"
                    view={isSelected ? 'normal' : 'flat'}
                    selected={isSelected}
                    onClick={activate}
                    className={b('button', {hidden: isActive})}
                >
                    {value || '...'}
                </Button>
            )}
            {(isActive || !isSelected) && (
                <TextInput
                    size="s"
                    controlRef={textInputRef}
                    value={inputText}
                    onUpdate={setInputText}
                    onKeyDown={handleKeyDown}
                    onBlur={handleBlur}
                    autoFocus={isActive}
                    error={hasError}
                    placeholder="6h"
                    className={b('text')}
                />
            )}
            <Popup
                open={(!isSelected || isActive) && Boolean(autocompleteItems.length)}
                anchorRef={anchorRef}
            >
                <List
                    ref={listRef}
                    filterable={false}
                    virtualized={false}
                    itemHeight={28}
                    renderItem={renderItem}
                    items={autocompleteItems}
                    onItemClick={pickItem}
                    className={b('completion')}
                />
            </Popup>
        </div>
    );
}
