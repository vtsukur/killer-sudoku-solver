import open from 'open';
import puppeteer from 'puppeteer';
import { findCageContours } from '../../src/reader/image/cageContoursFinder';
import { PuzzleSolver } from '../../src/solver/puzzleSolver';
import { logFactory } from '../../src/util/logFactory';
import { DailyKillerSudokuPuzzlePage } from './dailyKillerSudokuPuzzlePage';

const log = logFactory.of('E2E Puzzle Reader & Solver');

const PUZZLE_SOURCE_IMAGE_PATH = './tmp/screenshot-source-puzzle.png';
const PAGE_WITH_PUZZLE_SOLVED_IMAGE_PATH = './tmp/screenshot-solved-puzzle-page.png';

const OPEN_SOLVED_PUZZLE_AT_COMPLETION = false;

let browser;

describe('E2E puzzle reader and solver tests for DailyKillerSudoku.com', () => {
    test('Puzzle 24914 of difficulty 10', async () => {
        const page = new DailyKillerSudokuPuzzlePage(browser);
        await page.open(24914);
        await page.detectAndSavePuzzleImage(PUZZLE_SOURCE_IMAGE_PATH);
        const problem = await transformPuzzleImageToStructuredPuzzle(PUZZLE_SOURCE_IMAGE_PATH);
        const solution = solvePuzzle(problem);
        await page.reflectSolution(solution);
        await page.saveSolvedPuzzleImage(PAGE_WITH_PUZZLE_SOLVED_IMAGE_PATH);
        openPageWithSolvedPuzzleIfNecessary(PAGE_WITH_PUZZLE_SOLVED_IMAGE_PATH);
    });
    
    beforeEach(async () => {
        log.info('Launching Puppeteer with headless Chrome');
        browser = await puppeteer.launch();
    });

    afterEach(() => {
        log.info('Closing browser');
        browser.close();
    });

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

    const openPageWithSolvedPuzzleIfNecessary = function(path) {
        if (OPEN_SOLVED_PUZZLE_AT_COMPLETION) {
            open(path);
        }
    };
});
