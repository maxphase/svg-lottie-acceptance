// playwright.config.ts
import { PlaywrightTestConfig } from '@playwright/test';
import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

const config: PlaywrightTestConfig = {
    workers: parseInt(process.env.MAX_WORKERS || '1', 10),
    testDir: './',
    testMatch: '**/*.spec.ts',
    projects: [
        {
            name: 'chrome',
            use: {
                // ...devices['Desktop Chrome'],
                channel: 'chrome',
                headless: true,
                deviceScaleFactor: 1,
            }
        }
    ]
};

export default config;

