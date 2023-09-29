import type {StorybookConfig} from '@storybook/react-webpack5';

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.@(ts|tsx)'],
    addons: [
        {name: '@storybook/addon-essentials', options: {backgrounds: false}},
        '@storybook/addon-a11y',
        './theme-addon/register.tsx',
        {
            name: '@storybook/addon-styling-webpack',
            options: {
                rules: [
                    {
                        test: /\.css$/,
                        use: [require.resolve('style-loader'), require.resolve('css-loader')],
                    },
                    {
                        test: /\.scss$/,
                        use: [
                            require.resolve('style-loader'),
                            require.resolve('css-loader'),
                            {
                                loader: require.resolve('sass-loader'),
                                options: {
                                    implementation: require.resolve('sass'),
                                },
                            },
                        ],
                    },
                ],
            },
        },
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
    webpackFinal(config) {
        config.resolve = {
            ...config.resolve,
            extensionAlias: {
                '.js': ['.ts', '.tsx', '.js'],
            },
        };
        return config;
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
