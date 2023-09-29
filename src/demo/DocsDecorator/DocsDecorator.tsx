import React from 'react';

import {MobileProvider, ThemeProvider, getThemeType} from '@gravity-ui/uikit';
import {DocsContainer} from '@storybook/blocks';
import type {DocsContainerProps} from '@storybook/blocks';

import {themes} from '../../../.storybook/theme.js';
import {block} from '../utils/cn.js';

import './DocsDecorator.scss';

export interface DocsDecoratorProps extends React.PropsWithChildren<DocsContainerProps> {}

const b = block('docs-decorator');

export function DocsDecorator({children, context}: DocsDecoratorProps) {
    const storyContext = context.getStoryContext(context.storyById());
    const theme = storyContext.globals.theme;
    return (
        <div className={b()}>
            <DocsContainer context={context} theme={themes[getThemeType(theme)]}>
                <ThemeProvider theme={theme}>
                    <MobileProvider mobile={false}>{children}</MobileProvider>
                </ThemeProvider>
            </DocsContainer>
        </div>
    );
}
