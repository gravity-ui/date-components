// eslint-disable-next-line import/order
import '@gravity-ui/uikit/styles/styles.scss';

import React from 'react';

import {Lang, MobileProvider, ThemeProvider, configure} from '@gravity-ui/uikit';
import {MINIMAL_VIEWPORTS} from '@storybook/addon-viewport';
import type {Decorator, Preview} from '@storybook/react';

import {DocsDecorator} from '../src/demo/DocsDecorator/DocsDecorator.js';

import {WithLang} from './decorators/withLang.js';
import {WithMobile} from './decorators/withMobile.js';
import {themes} from './theme.js';

configure({
    lang: Lang.En,
});

const WithContextProvider: Decorator = (Story, context) => {
    return (
        <React.StrictMode>
            <ThemeProvider theme={context.globals.theme}>
                <MobileProvider>
                    <Story {...context} />
                </MobileProvider>
            </ThemeProvider>
        </React.StrictMode>
    );
};

const preview: Preview = {
    parameters: {
        docs: {
            theme: themes.light,
            container: DocsDecorator,
            canvas: {
                className: 'g-storybook-docs-decorator__canvas',
            },
        },
        // FIXME: Disabled due to performance reasons. See https://github.com/storybookjs/storybook/issues/5551
        // actions: {
        //     argTypesRegex: '^on.*',
        // },
        jsx: {showFunctions: false}, // To show functions in sources
        viewport: {
            viewports: MINIMAL_VIEWPORTS,
        },
        options: {
            storySort: {
                method: 'alphabetical',
            },
        },
    },
    decorators: [WithMobile, WithLang, WithContextProvider],
    globalTypes: {
        theme: {
            defaultValue: 'light',
            toolbar: {
                title: 'Theme',
                icon: 'mirror',
                items: [
                    {value: 'light', right: '☼', title: 'Light'},
                    {value: 'dark', right: '☾', title: 'Dark'},
                    {value: 'light-hc', right: '☼', title: 'High Contrast Light'},
                    {value: 'dark-hc', right: '☾', title: 'High Contrast Dark'},
                ],
            },
        },
        lang: {
            defaultValue: 'en',
            toolbar: {
                title: 'Language',
                icon: 'globe',
                items: [
                    {value: 'en', right: '🇬🇧', title: 'En'},
                    {value: 'ru', right: '🇷🇺', title: 'Ru'},
                ],
            },
        },
        platform: {
            defaultValue: 'desktop',
            toolbar: {
                title: 'Platform',
                items: [
                    {value: 'desktop', title: 'Desktop', icon: 'browser'},
                    {value: 'mobile', title: 'Mobile', icon: 'mobile'},
                ],
            },
        },
    },
};

export default preview;
