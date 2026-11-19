import {defineMain} from '@storybook/react-vite/node';

export default defineMain({
    stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
    addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest'],
    framework: {name: '@storybook/react-vite', options: {strictMode: true}},
    typescript: {
        reactDocgen: 'react-docgen-typescript',
    },
    core: {
        disableTelemetry: true,
    },
});
