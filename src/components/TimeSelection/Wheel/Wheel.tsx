import React from 'react';

import {Flex, Text} from '@gravity-ui/uikit';

import {block} from '../../../utils/cn';
import type {WheelProps, WheelValue} from '../TimeSelection.types';

import './Wheel.scss';

const b = block('time-selection-wheel');

export const Wheel = ({
    values,
    value,
    setValue,
    isActive,
    onActivate,
    onChange,
    disabled = false,
}: WheelProps) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const selectedRef = React.useRef<HTMLDivElement>(null);
    const [currentIndex, setCurrentIndex] = React.useState(() =>
        Math.max(
            values.findIndex((v) => v.value === value),
            0,
        ),
    );

    React.useEffect(() => {
        const newIndex = values.findIndex((v) => v.value === value);
        if (newIndex !== -1 && newIndex !== currentIndex) {
            setCurrentIndex(newIndex);
        }

        if (selectedRef.current && containerRef.current) {
            const container = containerRef.current;
            const selected = selectedRef.current;

            const containerHeight = container.clientHeight;
            const selectedHeight = selected.clientHeight;
            const selectedTop = selected.offsetTop;

            const scrollTop = selectedTop - containerHeight / 2 + selectedHeight / 2;

            container.scrollTo({
                top: scrollTop,
                behavior: 'smooth',
            });
        }
    }, [value, values, currentIndex]);

    React.useEffect(() => {
        if (selectedRef.current && containerRef.current) {
            const container = containerRef.current;
            const selected = selectedRef.current;

            const containerHeight = container.clientHeight;
            const selectedHeight = selected.clientHeight;
            const selectedTop = selected.offsetTop;

            const scrollTop = selectedTop - containerHeight / 2 + selectedHeight / 2;

            container.scrollTo({
                top: scrollTop,
                behavior: 'instant' as ScrollBehavior,
            });
        }
    }, []);

    const isItemDisabled = (val: WheelValue): boolean => !!val.disabled || disabled;

    const handleClick = (val: WheelValue, idx: number) => {
        if (isItemDisabled(val)) return;
        setCurrentIndex(idx);
        setValue(val.value);
        onChange?.(val.value);
        onActivate?.();
    };

    const findNextEnabledIndex = (startIndex: number, direction: 1 | -1): number => {
        let newIndex = startIndex;
        let attempts = 0;

        while (isItemDisabled(values[newIndex]) && attempts < values.length) {
            newIndex =
                direction === 1
                    ? (newIndex + 1) % values.length
                    : (newIndex - 1 + values.length) % values.length;
            attempts++;
        }

        return isItemDisabled(values[newIndex]) ? startIndex : newIndex;
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (disabled || !isActive) return;

        let newIndex = currentIndex;

        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                newIndex = findNextEnabledIndex(
                    currentIndex > 0 ? currentIndex - 1 : values.length - 1,
                    -1,
                );
                break;
            case 'ArrowDown':
                e.preventDefault();
                newIndex = findNextEnabledIndex(
                    currentIndex < values.length - 1 ? currentIndex + 1 : 0,
                    1,
                );
                break;
            case 'Home':
                e.preventDefault();
                newIndex = findNextEnabledIndex(0, 1);
                break;
            case 'End':
                e.preventDefault();
                newIndex = findNextEnabledIndex(values.length - 1, -1);
                break;
            default:
                return;
        }

        if (newIndex !== currentIndex) {
            handleClick(values[newIndex], newIndex);
        }
    };

    return (
        <div
            className={b({active: isActive, disabled})}
            role="listbox"
            tabIndex={disabled ? -1 : 0}
            aria-activedescendant={value}
            aria-label="time-section"
            ref={containerRef}
            onClick={onActivate}
            onKeyDown={handleKeyDown}
        >
            <Flex direction="column">
                {values.map((val, i) => {
                    const selected = val.value === value;
                    const itemDisabled = isItemDisabled(val);

                    return (
                        <Flex
                            justifyContent="center"
                            alignItems="center"
                            id={val.value}
                            role="option"
                            aria-selected={selected}
                            aria-disabled={itemDisabled}
                            className={b('cell', {selected, disabled: itemDisabled})}
                            key={val.value}
                            ref={selected ? selectedRef : null}
                            onClick={() => handleClick(val, i)}
                        >
                            <Text variant="body-1">{val.label}</Text>
                        </Flex>
                    );
                })}
            </Flex>
            <div className={b('highlight')} />
        </div>
    );
};
