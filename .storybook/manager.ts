import {GLOBALS_UPDATED, UPDATE_GLOBALS} from 'storybook/internal/core-events';
import {addons} from 'storybook/manager-api';

import {themes} from './theme.js';

addons.setConfig({
    theme: themes.light,
});

addons.register('date-components/theme', (api) => {
    const updateTheme = (theme: unknown) => {
        addons.setConfig({theme: `${theme}`.startsWith('dark') ? themes.dark : themes.light});
    };

    const onGlobalsChanged = ({globals}: {globals: {theme?: string}}) => {
        updateTheme(globals.theme);
    };

    api.on(UPDATE_GLOBALS, onGlobalsChanged);
    api.on(GLOBALS_UPDATED, onGlobalsChanged);
    updateTheme(api.getGlobals().theme);
});
