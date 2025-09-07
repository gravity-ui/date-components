import React from 'react';

import {getThemeType} from '@gravity-ui/uikit';
import {DocsContainer} from '@storybook/addon-docs/blocks';
import type {DocsContainerProps} from '@storybook/addon-docs/blocks';

import {themes} from '../../../.storybook/theme';
import {block} from '../utils/cn';

import './DocsDecorator.scss';

export interface DocsDecoratorProps extends React.PropsWithChildren<DocsContainerProps> {}

const b = block('docs-decorator');

export function DocsDecorator({children, context}: DocsDecoratorProps) {
    const storyContext = context.getStoryContext(context.storyById());
    const theme = storyContext.globals.theme;

    return (
        <div className={b()}>
            <DocsContainer context={context} theme={themes[getThemeType(theme)]}>
                {children}
            </DocsContainer>
        </div>
    );
}
