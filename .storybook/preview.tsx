// eslint-disable-next-line import/order
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';

import {
    Lang,
    MobileProvider,
    ThemeProvider,
    ToasterComponent,
    ToasterProvider,
    configure,
} from '@gravity-ui/uikit';
import {toaster} from '@gravity-ui/uikit/toaster-singleton';
import {MINIMAL_VIEWPORTS} from '@storybook/addon-viewport';
import type {Decorator, Preview} from '@storybook/react';

import {DocsDecorator} from '../src/demo/DocsDecorator/DocsDecorator';

import {WithLang} from './decorators/withLang';
import {themes} from './theme';

configure({
    lang: Lang.En,
});

const WithContextProvider: Decorator = (Story, context) => {
    return (
        <React.StrictMode>
            <ThemeProvider theme={context.globals.theme} direction={context.globals.direction}>
                <MobileProvider mobile={context.globals.platform === 'mobile'}>
                    <ToasterProvider toaster={toaster}>
                        <Story {...context} />
                        <ToasterComponent />
                    </ToasterProvider>
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
        jsx: {showFunctions: false}, // Do not show functions in sources
        viewport: {
            viewports: MINIMAL_VIEWPORTS,
        },
        options: {
            storySort: {
                method: 'alphabetical',
            },
        },
    },
    decorators: [WithLang, WithContextProvider],
    globalTypes: {
        theme: {
            defaultValue: 'light',
            toolbar: {
                title: 'Theme',
                icon: 'mirror',
                items: [
                    {value: 'light', right: '☼', title: 'Light'},
                    {value: 'dark', right: '☾', title: 'Dark'},
                    {value: 'light-hc', right: '☼', title: 'High Contrast Light (beta)'},
                    {value: 'dark-hc', right: '☾', title: 'High Contrast Dark (beta)'},
                ],
                dynamicTitle: true,
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
                dynamicTitle: true,
            },
        },
        direction: {
            defaultValue: 'ltr',
            toolbar: {
                title: 'Direction',
                icon: 'menu',
                items: [
                    {value: 'ltr', title: 'Left to Right', icon: 'arrowrightalt'},
                    {value: 'rtl', title: 'Right to Left', icon: 'arrowleftalt'},
                ],
                dynamicTitle: true,
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
                dynamicTitle: true,
            },
        },
    },
};

export default preview;
