import type {StorybookConfig} from '@storybook/react-webpack5';

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(ts|tsx)'],
    addons: [
        '@storybook/preset-scss',
        {name: '@storybook/addon-essentials', options: {backgrounds: false}},
        '@storybook/addon-a11y',
        './theme-addon/register.tsx',
    ],
    framework: {
        name: '@storybook/react-webpack5',
        options: {},
    },
    typescript: {
        check: false,
        checkOptions: {},
        reactDocgen: 'react-docgen-typescript',
    },
    core: {
        disableTelemetry: true,
    },
    babel: (transformOptions) => {
        return {
            ...transformOptions,
            presets: [
                [
                    '@babel/preset-env',
                    {
                        targets: {
                            chrome: 100,
                        },
                    },
                ],
                '@babel/preset-typescript',
                ['@babel/preset-react', {runtime: 'automatic'}],
            ],
        };
    },
};

export default config;
