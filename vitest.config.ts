import path from 'node:path';

import {storybookTest} from '@storybook/addon-vitest/vitest-plugin';
import react from '@vitejs/plugin-react';
import {playwright} from '@vitest/browser-playwright';
import {defineConfig} from 'vitest/config';

process.env.VITE_CI = process.env.CI || '';

export default defineConfig({
    test: {
        reporters: ['default', ['html', {outputFile: './reports/html/index.html'}]],
        coverage: {
            reporter: ['text', 'json', 'json-summary', 'lcov'],
            reportsDirectory: './reports/coverage',
            include: ['src/**/*.ts?(x)'],
            exclude: ['**/__stories__', '**/__tests__', 'src/demo/**'],
        },
        browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [
                {
                    browser: 'chromium',
                    viewport: {width: 1280, height: 720},
                },
            ],
            locators: {testIdAttribute: 'data-qa'},
            screenshotDirectory: 'reports/screenshots',
            expect: {
                toMatchScreenshot: {
                    resolveScreenshotPath: ({
                        root,
                        testFileDirectory,
                        testFileName,
                        arg,
                        browserName,
                        platform,
                        ext,
                    }) => {
                        return `${root}/${testFileDirectory}/../__screenshots__/${testFileName}-screenshots/${arg}-${browserName}-${platform}${ext}`;
                    },
                },
            },
        },
        projects: [
            {
                extends: true,
                plugins: [
                    // The plugin will run tests for the stories defined in your Storybook config
                    // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
                    storybookTest({
                        configDir: path.join(import.meta.dirname, '.storybook'),
                        storybookUrl: process.env.SB_URL || 'http://localhost:7070',
                    }),
                ],
                optimizeDeps: {
                    // https://github.com/storybookjs/storybook/issues/32049
                    include: ['react/jsx-dev-runtime'],
                },
                test: {
                    name: 'storybook',
                    setupFiles: ['.storybook/vitest.setup.ts'],
                },
            },
            {
                extends: true,
                plugins: [react()],
                test: {
                    name: 'unit',
                    include: ['**/*.test.ts?(x)'],
                    setupFiles: [path.join(import.meta.dirname, './test-utils/setup-tests.ts')],
                },
            },
        ],
    },
});
