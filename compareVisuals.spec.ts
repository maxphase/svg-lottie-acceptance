declare module 'resemblejs';

import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';
import { test, expect, chromium } from '@playwright/test';
const resemble = require('resemblejs');
// Load environment variables
config();

const SVG_FOLDER_PATH = process.env.SVG_FOLDER_PATH || '';
const LOTTIE_FOLDER_PATH = process.env.LOTTIE_FOLDER_PATH || '';

const svgViewerPath = 'html/svg-viewer.html';
const lottieViewerPath = 'html/lottie-player.html';

test.describe.configure({ mode: 'parallel' });
test.describe('Lottie export visual comparison', () => {
    // Dynamically generate tests based on the number of SVG files
    let svgFiles = fs.readdirSync(SVG_FOLDER_PATH).filter(file => path.extname(file) === '.svg');

    // //for debug, slice out some files
    // svgFiles = svgFiles.slice(800, 830);

    for (const svgFile of svgFiles) {
        test(`Compare ${svgFile} with Lottie`, async ({ page }) => {
            const svgFilePath = path.join(SVG_FOLDER_PATH, svgFile);
            const lottieFilePath = path.join(LOTTIE_FOLDER_PATH, svgFile.replace('.svg', '.json'));
            // check if lottie file exists
            if (!fs.existsSync(lottieFilePath)) {
                throw new Error(`Lottie file not found for ${svgFile}`);
            }

            // load the svg html into browser
            const svgViewerHTML = fs.readFileSync(path.join(__dirname, svgViewerPath), 'utf-8');
            await page.setContent(svgViewerHTML);

            // Load the SVG file into the SVG viewer
            await page.locator('input[type="file"]').setInputFiles(svgFilePath);
            // await page.waitForTimeout(2000);

            // Find the SVG container
            const svgContainer = await page.locator('#svg-container');
            const svgScrName = `svg-${svgFile}.png`;
            const svgScrPath = path.join('screenshots', svgScrName);

            // Take a screenshot of the SVG container
            await svgContainer.screenshot({ path: svgScrPath });

            // Load the Lottie viewer
            const newBrowser = await chromium.launch();
            const lottiePage = await newBrowser.newPage();
            const lottieViewerHTML = fs.readFileSync(path.join(__dirname, lottieViewerPath), 'utf-8');
            await lottiePage.setContent(lottieViewerHTML);

            // Load the Lottie file into the Lottie viewer
            await lottiePage.locator('input[type="file"]').setInputFiles(lottieFilePath);
            // await lottiePage.waitForTimeout(2000);
            const lottiePlayer = await lottiePage.locator('#lottie-player');
            const lottieScrName = `lottie-${svgFile}.png`;
            const lottieScrPath = path.join('screenshots', lottieScrName);

            // Take a screenshot of the Lottie player
            await lottiePlayer.screenshot({ path: lottieScrPath });

            const ACCEPTABLE_MISMATCH_THRESHOLD = 5.0;

            interface ComparisonResult {
                pass: boolean;
                misMatchPercentage: number;
                diffImagePath?: string;
                result?: any; // You can replace 'any' with a more specific type if you know the structure of 'result'
            }

            const comparisonResult = await new Promise<ComparisonResult>((resolve, reject) => {
                resemble(svgScrPath)
                .compareTo(lottieScrPath)
                .ignoreAntialiasing()
                .scaleToSameSize()
                .onComplete((result: any) => {
                    if (result.misMatchPercentage <= ACCEPTABLE_MISMATCH_THRESHOLD) {
                        resolve({ pass: true, misMatchPercentage: result.misMatchPercentage });
                    } else {
                        // Check if a diff image can be accessed directly from the result
                        if (result.getImageDataUrl) {
                            const diffImageBase64 = result.getImageDataUrl();
                            const diffImageData = diffImageBase64.split(';base64,').pop();

                            const diffImagePath = `screenshots/diff-${path.basename(svgScrPath)}.png`;
                            fs.writeFileSync(diffImagePath, diffImageData, { encoding: 'base64' });

                            resolve({
                                pass: false,
                                misMatchPercentage: result.misMatchPercentage,
                                diffImagePath: diffImagePath // Include the diff image path in the result
                            });
                        } else {
                            resolve({ pass: false, misMatchPercentage: result.misMatchPercentage });
                        }
                    }
                });

            });
            
            if (!comparisonResult.pass && comparisonResult.diffImagePath) {
                console.log(`Diff image saved at: ${comparisonResult.diffImagePath}`);
            }
            // console.log(comparisonResult);

            expect(comparisonResult.pass).toBe(true);

            // Close the browser
            await newBrowser.close();
            // Clean up the screenshot
            fs.unlinkSync(path.join('screenshots', svgScrName));
        });
    }
});