import {addons} from 'storybook/manager-api';

import {themes} from './theme.js';

addons.setConfig({
    theme: themes.light,
});
