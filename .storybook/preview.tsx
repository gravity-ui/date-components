// eslint-disable-next-line import/order
import '@gravity-ui/uikit/styles/fonts.scss';
// eslint-disable-next-line import/order
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';

import {settings} from '@gravity-ui/date-utils';
import {MobileProvider, ThemeProvider, ToasterComponent, ToasterProvider} from '@gravity-ui/uikit';
import {toaster} from '@gravity-ui/uikit/toaster-singleton';
import type {Decorator, Preview} from '@storybook/react-webpack5';
import {MINIMAL_VIEWPORTS} from 'storybook/viewport';

import {DocsDecorator} from '../src/demo/DocsDecorator/DocsDecorator';

import {themes} from './theme';

settings.loadLocale('ru');

const WithContextProvider: Decorator = (Story, context) => {
    return (
        <React.StrictMode>
            <ThemeProvider
                theme={context.globals.theme}
                direction={context.globals.direction}
                lang={context.globals.lang}
            >
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
            codePanel: true,
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
    decorators: [WithContextProvider],
    globalTypes: {
        theme: {
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
    initialGlobals: {
        theme: 'light',
        lang: 'en',
        direction: 'ltr',
        platform: 'desktop',
    },
};

export default preview;
