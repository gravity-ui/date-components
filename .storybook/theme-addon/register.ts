import React from 'react';

import {addons, types, useGlobals} from 'storybook/manager-api';

import {themes} from '../theme.js';

const ADDON_ID = 'gravity-theme-addon';
const TOOL_ID = `${ADDON_ID}tool`;

addons.register(ADDON_ID, (api) => {
    addons.add(TOOL_ID, {
        type: types.TOOL,
        title: 'Theme',
        render: function Tool() {
            const [{theme = 'light'}] = useGlobals();

            React.useEffect(() => {
                api.setOptions({theme: themes[theme.includes('dark') ? 'dark' : 'light']});
            }, [theme]);

            return null;
        },
    });
});
