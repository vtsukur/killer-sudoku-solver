import _ from 'lodash';
import open from 'open';
import puppeteer from 'puppeteer';
import { House } from '../../src/problem/house';
import { findCageContours } from '../../src/reader/image/cageContoursFinder';
import { PuzzleSolver } from '../../src/solver/puzzleSolver';
import { logFactory } from '../../src/util/logFactory';

const log = logFactory.of('E2E Puzzle Reader & Solver');

const SELECTOR_BANNER = '.cc_banner-wrapper';
const SELECTOR_PUZZLE_CANVAS = '.puzzle-canvas';

const PUZZLE_SOURCE_IMAGE_TMP_PATH = './tmp/screenshot-source-puzzle.png';
const PAGE_WITH_PUZZLE_SOLVED_IMAGE_TMP_PATH = './tmp/screenshot-solved-puzzle-page.png';

const openSolvedPuzzleAtCompletion = false;

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
    };

    const detectAndSavePuzzleCanvasImage = async function(page) {
        log.info('Detecting placement of puzzle canvas ...');
        await page.waitForSelector(SELECTOR_PUZZLE_CANVAS);
        const captureRect = await page.evaluate((selector) => {
            const rect = document.querySelector(selector).getBoundingClientRect();
            return {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height
            };
        }, SELECTOR_PUZZLE_CANVAS);
        log.info(`Detected puzzle canvas client rect: (x: ${captureRect.x}, y: ${captureRect.y}, width: ${captureRect.width}, height: ${captureRect.height})`);

        log.info('Taking screenshot of detected puzzle canvas ...');
        await page.screenshot({
            path: PUZZLE_SOURCE_IMAGE_TMP_PATH,
            captureBeyondViewport: true,
            clip: {
                x: captureRect.x,
                y: captureRect.y,
                width: captureRect.width,
                height: captureRect.height
            }
        });
        log.info(`Puzzle canvas saved to ${PUZZLE_SOURCE_IMAGE_TMP_PATH}`);

        return PUZZLE_SOURCE_IMAGE_TMP_PATH;
    };

    const detectProblemFromImage = async function(puzzleSourceImagePath) {
        log.info('Detecting puzzle problem from puzzle canvas image ...');
        const problem = await findCageContours(puzzleSourceImagePath);
        log.info('Puzzle problem detected successfully');
        return problem;
    };

    const solvePuzzle = function(problem) {
        log.info('Solving puzzle ...');
        const solution = new PuzzleSolver(problem).solve();
        log.info('Solution for puzzle found!');
        return solution;
    };

    const reflectSolutionOnThePage = async function(page, solution) {
        log.info('Reflection solution of the puzzle on the page by sending input commands ...');

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
    };

    const saveSolvedPuzzlePageImage = async function(page, saveTo) {
        log.info('Taking screenshot of the page to enable manual verification');
        await page.screenshot({
            path: saveTo,
            fullPage: true
        });
        log.info(`Solved puzzle page saved to ${saveTo}`);
    };

    test('Puzzle 24914 of difficulty 10', async () => {
        const page = await openCleanPuzzlePage(24914);
        const puzzleSourceImagePath = await detectAndSavePuzzleCanvasImage(page);
        const problem = await detectProblemFromImage(puzzleSourceImagePath);
        const solution = solvePuzzle(problem);
        await reflectSolutionOnThePage(page, solution);
        await saveSolvedPuzzlePageImage(page, PAGE_WITH_PUZZLE_SOLVED_IMAGE_TMP_PATH);

        if (openSolvedPuzzleAtCompletion) {
            open(PAGE_WITH_PUZZLE_SOLVED_IMAGE_TMP_PATH);
        }
    });
});
