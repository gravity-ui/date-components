import React from 'react';

import {Button as ButtonBase} from '@gravity-ui/uikit';
import type {ButtonButtonProps, DOMProps} from '@gravity-ui/uikit';

import {useContextProps} from '../../utils/providers';
import type {ContextValue, SlotProps} from '../../utils/providers';

export interface ButtonProps
    extends Omit<ButtonButtonProps, 'slot' | 'style'>,
        DOMProps,
        SlotProps {}

export const ButtonContext = React.createContext<ContextValue<ButtonProps, HTMLButtonElement>>({});

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    function Button(props, forwardedRef) {
        const [mergedProps, ref] = useContextProps(props, forwardedRef, ButtonContext);
        return <ButtonBase {...mergedProps} slot={props.slot ?? undefined} ref={ref} />;
    },
);
