import {defineMain} from '@storybook/react-webpack5/node';
import * as sass from 'sass';

export default defineMain({
    stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
    addons: [
        '@storybook/addon-docs',
        '@storybook/addon-a11y',
        import.meta.resolve('./theme-addon/theme-preset.ts'),
        '@storybook/addon-webpack5-compiler-babel',
        {
            name: '@storybook/addon-styling-webpack',
            options: {
                rules: [
                    {
                        test: /\.css$/,
                        sideEffects: true,
                        use: ['style-loader', 'css-loader'],
                    },
                    {
                        test: /\.scss$/,
                        sideEffects: true,
                        use: [
                            'style-loader',
                            {
                                loader: 'css-loader',
                                options: {importLoaders: 1},
                            },
                            {
                                loader: 'sass-loader',
                                options: {implementation: sass},
                            },
                        ],
                    },
                ],
            },
        },
    ],
    framework: '@storybook/react-webpack5',
    typescript: {
        check: false,
        checkOptions: {},
        reactDocgen: 'react-docgen-typescript',
    },
    core: {
        disableTelemetry: true,
    },
    babel: {
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
    },
});
