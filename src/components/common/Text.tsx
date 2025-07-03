import React from 'react';

import {Text as TextBase} from '@gravity-ui/uikit';
import type {TextProps as TextPropsBase} from '@gravity-ui/uikit';

import {useContextProps} from '../../utils/providers';
import type {ContextValue, SlotProps} from '../../utils/providers';

type TextPropsName =
    | 'color'
    | 'ellipsis'
    | 'ellipsisLines'
    | 'variant'
    | 'whiteSpace'
    | 'wordBreak'
    | 'style';

export interface TextProps
    extends Pick<TextPropsBase, TextPropsName>,
        Omit<React.HTMLAttributes<HTMLElement>, TextPropsName | 'slot'>,
        SlotProps {
    as?: React.ElementType;
}

export const TextContext = React.createContext<ContextValue<TextProps, HTMLElement>>({});

export const Text = React.forwardRef<HTMLElement, TextProps>(function Text(props, forwardedRef) {
    const [mergedProps, ref] = useContextProps(props, forwardedRef, TextContext);
    return <TextBase {...mergedProps} ref={ref} />;
});
