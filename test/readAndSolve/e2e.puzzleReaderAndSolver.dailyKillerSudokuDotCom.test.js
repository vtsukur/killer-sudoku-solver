import _ from 'lodash';
import open from 'open';
import puppeteer from 'puppeteer';
import { House } from '../../src/problem/house';
import { findCageContours } from '../../src/reader/image/cageContoursFinder';
import { PuzzleSolver } from '../../src/solver/puzzleSolver';
import { logFactory } from '../../src/util/logFactory';

const log = logFactory.of('E2E Puzzle Reader & Solver');
const openSolvedPuzzleAtCompletion = false;

const SELECTOR_BANNER = '.cc_banner-wrapper';

let browser;

describe('E2E puzzle reader and solver tests for DailyKillerSudoku.com', () => {
    beforeEach(async () => {
        log.info('Launching Puppeteer with headless Chrome');
        browser = await puppeteer.launch();
    });

    afterEach(() => {
        log.info('Closing browser');
        browser.close();
    });

    const openCleanPuzzlePage = async (puzzleNumber) => {
        const puzzlePage = `https://www.dailykillersudoku.com/puzzle/${puzzleNumber}`;
        log.info(`Opening DailyKillerSudoku puzzle page ${puzzlePage} ...`);

        const page = await browser.newPage();

        // viewport and scale factor should be big enough for image recognition techniques to work
        page.setViewport({
            width: 1680,
            height: 1050,
            deviceScaleFactor: 2
        });

        await page.goto(puzzlePage);
        log.info('Puzzle page loaded');

        log.info('Removing cookie banner so that it doesn\'t overlap with puzzle canvas to enable proper problem detection');
        await page.waitForSelector(SELECTOR_BANNER);
        await page.evaluate((selector) => {
            document.querySelector(selector).remove();
        }, SELECTOR_BANNER);        

        return page;
    }

    test('Read and find solution for puzzle 24914 of difficulty 10 by DailyKillerSudoku.com', async () => {
        const page = await openCleanPuzzlePage(24914);

        log.info('Detecting placement of puzzle canvas ...');
        await page.waitForSelector('.puzzle-canvas');
        const puzzleCanvasClientRect = await page.evaluate(() => {
            const rect = document.querySelector('.puzzle-canvas').getBoundingClientRect();
            return {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height
            };
        });
        log.info(`Detected puzzle canvas client rect: (x: ${puzzleCanvasClientRect.x}, y: ${puzzleCanvasClientRect.y}, width: ${puzzleCanvasClientRect.width}, height: ${puzzleCanvasClientRect.height})`);

        const puzzleSourceImageSavePath = './tmp/screenshot-puzzle.png';
        log.info(`Taking screenshot of detected puzzle canvas ...`);
        await page.screenshot({
            path: puzzleSourceImageSavePath,
            captureBeyondViewport: true,
            clip: {
                x: puzzleCanvasClientRect.x,
                y: puzzleCanvasClientRect.y,
                width: puzzleCanvasClientRect.width,
                height: puzzleCanvasClientRect.height
            }
        });
        log.info(`Puzzle canvas saved to ${puzzleSourceImageSavePath}`);

        log.info('Detecting puzzle problem from puzzle canvas image ...');
        const problem = await findCageContours(puzzleSourceImageSavePath);
        log.info('Puzzle problem detected successfully');

        log.info('Solving puzzle ...');
        const solver = new PuzzleSolver(problem);
        const solution = solver.solve();
        log.info('Solution for puzzle found!');

        log.info('Completing puzzle on the page with the solution by sending input commands ...');
        const solutionCommands = Array();
        _.range(House.SIZE).forEach(row => {
            _.range(House.SIZE).forEach(col => {
                const num = solution[row][col];
                const idx = row * House.SIZE + col + 1;
                solutionCommands.push({
                    cls: `.cell:nth-of-type(${idx})`,
                    press: `${num}`
                });
            });
        });

        for (const cmd of solutionCommands) {
            await page.click(cmd.cls);
            await page.keyboard.press(cmd.press);
        }

        log.info('Check that "Solved!" modal is displayed');
        await page.waitForXPath('//*[text()="Solved!"]');
        await page.waitForSelector('#modal.show');
        log.info('Yes, we are good!');

        const puzzleSolvedPageImageSavePath = './tmp/screenshot-solved.png';
        log.info('Taking screenshot of the page to enable manual verification');
        await page.screenshot({
            path: puzzleSolvedPageImageSavePath,
            fullPage: true
        });
        log.info(`Solved puzzle page saved to ${puzzleSolvedPageImageSavePath}`);

        if (openSolvedPuzzleAtCompletion) open(puzzleSolvedPageImageSavePath);
    });
});
