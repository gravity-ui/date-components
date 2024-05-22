import React from 'react';

import {Button} from '@gravity-ui/uikit';

import {useReferentiallyConstantObject} from '../../../hooks/useReferentiallyConstantObject';

interface PresetButtonProps {
    value: string;
    selected: string | undefined;
    onClick?: (preset: string) => void;
}

export function PresetButton({value, selected, onClick}: PresetButtonProps) {
    const nonReactiveProps = useReferentiallyConstantObject({value});
    const handleClick = React.useMemo(
        () => onClick && (() => onClick(nonReactiveProps.value)),
        [onClick, nonReactiveProps],
    );

    const isSelected = value === selected;

    return (
        <Button
            size="s"
            onClick={handleClick}
            view={isSelected ? 'normal' : 'flat'}
            selected={isSelected}
        >
            {value}
        </Button>
    );
}
