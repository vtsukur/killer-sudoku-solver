import _ from 'lodash';
import puppeteer from 'puppeteer';
import { House } from '../../src/problem/house';
import { findCageContours } from '../../src/reader/image/cageContoursFinder';
import { PuzzleSolver } from '../../src/solver/puzzleSolver';

describe('Read and solve puzzle', () => {
    test('Read and find solution for puzzle 24914 of difficulty 10 by DailyKillerSudoku.com', async () => {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=egl', '--max_old_space_size=4096']
        });
        const page = await browser.newPage();
        page.setViewport({
            width: 3360,
            height: 2100,
            deviceScaleFactor: 1
        });

        await page.goto('https://www.dailykillersudoku.com/puzzle/24914');
        await page.waitForSelector('.cc_banner-wrapper');
        await page.evaluate(() => {
            document.querySelector('.cc_banner-wrapper').remove();
        });

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
        await page.screenshot({
            path: './tmp/screenshot-puzzle.png',
            captureBeyondViewport: true,
            clip: {
                x: puzzleCanvasClientRect.x,
                y: puzzleCanvasClientRect.y,
                width: puzzleCanvasClientRect.width,
                height: puzzleCanvasClientRect.height
            }
        });

        const problem = await findCageContours('./tmp/screenshot-puzzle.png');
        console.log(problem);
        const solver = new PuzzleSolver(problem);
        const solution = solver.solve();

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

        await page.waitForXPath('//*[text()="Solved!"]');
        await page.waitForSelector('#modal.show');
        // await new Promise((resolve) => setTimeout(resolve, 1000));

        await page.screenshot({
            path: './tmp/screenshot-solved.png',
            fullPage: true
        });

        await browser.close();
    });
});
