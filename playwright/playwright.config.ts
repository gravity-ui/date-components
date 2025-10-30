import {resolve} from 'path';

import {defineConfig, devices} from '@playwright/experimental-ct-react';
import type {PlaywrightTestConfig} from '@playwright/experimental-ct-react';

function pathFromRoot(p: string) {
    return resolve(__dirname, '../', p);
}

const reporter: PlaywrightTestConfig['reporter'] = [];

reporter.push(
    ['list'],
    [
        'html',
        {
            open: process.env.CI ? 'never' : 'on-failure',
            outputFolder: resolve(
                process.cwd(),
                process.env.IS_DOCKER ? 'playwright-report-docker' : 'playwright-report',
            ),
        },
    ],
);

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: pathFromRoot('src'),
    testMatch: '**/__tests__/*.visual.test.tsx',
    updateSnapshots: process.env.UPDATE_REQUEST ? 'all' : 'missing',
    snapshotPathTemplate:
        '{testDir}/{testFileDir}/../__snapshots__/{testFileName}-snapshots/{arg}{-projectName}-linux{ext}',
    timeout: 10 * 1000,
    fullyParallel: true,
    forbidOnly: Boolean(process.env.CI),
    retries: process.env.CI ? 1 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter,
    use: {
        testIdAttribute: 'data-qa',
        trace: 'on',
        headless: true,
        screenshot: 'only-on-failure',
        timezoneId: 'UTC',
        ctCacheDir: process.env.IS_DOCKER ? '.cache-docker' : '.cache',
    },
    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                deviceScaleFactor: 2,
                launchOptions: {
                    ignoreDefaultArgs: ['--hide-scrollbars'],
                },
            },
        },
    ],
});
