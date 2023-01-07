import _ from 'lodash';
import open from 'open';
import puppeteer from 'puppeteer';
import { House } from '../../src/problem/house';
import { findCageContours } from '../../src/reader/image/cageContoursFinder';
import { Rect } from '../../src/reader/image/rect';
import { PuzzleSolver } from '../../src/solver/puzzleSolver';
import { logFactory } from '../../src/util/logFactory';
import { DailyKillerSudokuPuzzlePage } from './dailyKillerSudokuPuzzlePage';

const log = logFactory.of('E2E Puzzle Reader & Solver');

const SELECTOR_PUZZLE_CANVAS = '.puzzle-canvas';
const SELECTOR_NTH_CELL = (n) => {
    return `.cell:nth-of-type(${n})`;
};
const SELECTOR_SHOWN_MODAL = '#modal.show';
const XPATH_SOLVED_TEXT = '//*[text()="Solved!"]';

const STATIC_WAIT_FOR_SOLVED_ANIMATION_TIMEOUT = 1000;

const PUZZLE_SOURCE_IMAGE_PATH = './tmp/screenshot-source-puzzle.png';
const PAGE_WITH_PUZZLE_SOLVED_IMAGE_PATH = './tmp/screenshot-solved-puzzle-page.png';

const OPEN_SOLVED_PUZZLE_AT_COMPLETION = false;

let browser;

describe('E2E puzzle reader and solver tests for DailyKillerSudoku.com', () => {
    test('Puzzle 24914 of difficulty 10', async () => {
        const page = new DailyKillerSudokuPuzzlePage(browser);
        const browserPage = await page.open(24914);
        const originalPuzzleSourceImagePath = await detectAndSavePuzzleImage(browserPage);
        const problem = await transformPuzzleImageToStructuredPuzzle(originalPuzzleSourceImagePath);
        const solution = solvePuzzle(problem);
        await reflectSolutionOnThePage(browserPage, solution);
        await saveSolvedPuzzleImageAndOpenIfNeccessary(browserPage);
    });
    
    beforeEach(async () => {
        log.info('Launching Puppeteer with headless Chrome');
        browser = await puppeteer.launch();
    });

    afterEach(() => {
        log.info('Closing browser');
        browser.close();
    });

    const detectAndSavePuzzleImage = async function(page) {
        log.info('Detecting placement of puzzle canvas ...');
        await page.waitForSelector(SELECTOR_PUZZLE_CANVAS);
        const captureRect = Rect.from(await page.evaluate((selector) => {
            const rect = document.querySelector(selector).getBoundingClientRect();
            return {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height
            };
        }, SELECTOR_PUZZLE_CANVAS));
        log.info(`Detected puzzle canvas client rect ${captureRect}`);

        log.info('Taking screenshot of detected puzzle canvas area ...');
        await page.screenshot({
            path: PUZZLE_SOURCE_IMAGE_PATH,
            captureBeyondViewport: true,
            clip: captureRect
        });
        log.info(`Puzzle canvas saved to ${PUZZLE_SOURCE_IMAGE_PATH}`);

        return PUZZLE_SOURCE_IMAGE_PATH;
    };

    const transformPuzzleImageToStructuredPuzzle = async function(puzzleSourceImagePath) {
        log.info('Transforming puzzle image to structured problem ...');
        const problem = await findCageContours(puzzleSourceImagePath);
        log.info('Puzzle problem constructed successfully');
        return problem;
    };

    const solvePuzzle = function(problem) {
        log.info('Solving puzzle ...');
        const solution = new PuzzleSolver(problem).solve();
        log.info('Solution for puzzle found!');
        return solution;
    };

    const reflectSolutionOnThePage = async function(page, solution) {
        log.info('Reflecting solution of the puzzle on the page by sending input commands ...');

        const solutionCommands = Array();
        _.range(House.SIZE).forEach(row => {
            _.range(House.SIZE).forEach(col => {
                const num = solution[row][col];
                const n = row * House.SIZE + col + 1;
                solutionCommands.push({
                    selector: SELECTOR_NTH_CELL(n),
                    press: `${num}`
                });
            });
        });

        for (const cmd of solutionCommands) {
            await page.click(cmd.selector);
            await page.keyboard.press(cmd.press);
        }

        log.info('Check that "Solved!" modal is displayed');
        await page.waitForXPath(XPATH_SOLVED_TEXT);
        await page.waitForSelector(SELECTOR_SHOWN_MODAL);
        log.info('Page confirms that puzzle is solved successfully!');

        log.info('Waiting for puzzle solved animation to complete');
        await new Promise(resolve => setTimeout(resolve, STATIC_WAIT_FOR_SOLVED_ANIMATION_TIMEOUT));
    };

    const saveSolvedPuzzleImageAndOpenIfNeccessary = async function(page) {
        log.info('Taking screenshot of the page to enable manual visual verification');
        await page.screenshot({
            path: PAGE_WITH_PUZZLE_SOLVED_IMAGE_PATH,
            fullPage: true
        });
        log.info(`Page with solved puzzle saved to ${PAGE_WITH_PUZZLE_SOLVED_IMAGE_PATH}`);

        if (OPEN_SOLVED_PUZZLE_AT_COMPLETION) {
            open(PAGE_WITH_PUZZLE_SOLVED_IMAGE_PATH);
        }
    };
});
