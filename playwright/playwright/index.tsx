import React from 'react';

import {settings} from '@gravity-ui/date-utils';
import {MobileProvider, ThemeProvider} from '@gravity-ui/uikit';
import {beforeMount} from '@playwright/experimental-ct-react/hooks';

import '@gravity-ui/uikit/styles/fonts.scss';
import '@gravity-ui/uikit/styles/styles.scss';

settings.loadLocale('en');

beforeMount(async ({App}) => {
    return (
        <React.StrictMode>
            <ThemeProvider>
                <MobileProvider>
                    <App />
                </MobileProvider>
            </ThemeProvider>
        </React.StrictMode>
    );
});
