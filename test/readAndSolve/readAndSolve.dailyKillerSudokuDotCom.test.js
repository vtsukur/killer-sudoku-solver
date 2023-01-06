import _ from 'lodash';
import puppeteer from 'puppeteer';
import { House } from '../../src/problem/house';
import { findCageContours } from '../../src/reader/image/cageContoursFinder';
import { PuzzleSolver } from '../../src/solver/puzzleSolver';
import { logFactory } from '../../src/util/logFactory';

const log = logFactory.of('E2E puzzle reader and solver');

describe('Read and solve puzzle', () => {
    test('Read and find solution for puzzle 24914 of difficulty 10 by DailyKillerSudoku.com', async () => {
        log.info('Launching Puppeteer with headless Chrome');
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=egl', '--max_old_space_size=4096']
        });

        const puzzlePage = 'https://www.dailykillersudoku.com/puzzle/24914';
        log.info(`Navigating to DailyKillerSudoku puzzle page ${puzzlePage} ...`);

        const page = await browser.newPage();
        page.setViewport({
            width: 3360,
            height: 2100,
            deviceScaleFactor: 1
        });
        await page.goto(puzzlePage);
        log.info('Puzzle page loaded');

        log.info('Removing cookie banner so that it doesn\'t overlap with puzzle canvas to enable proper problem detection');
        await page.waitForSelector('.cc_banner-wrapper');
        await page.evaluate(() => {
            document.querySelector('.cc_banner-wrapper').remove();
        });

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
        log.info(`Detected puzzle canvas client rect: ${puzzleCanvasClientRect}`);

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

        await browser.close();
    });
});
