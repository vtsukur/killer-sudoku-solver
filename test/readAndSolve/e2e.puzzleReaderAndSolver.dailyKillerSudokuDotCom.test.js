import open from 'open';
import puppeteer from 'puppeteer';
import { findCageContours } from '../../src/reader/image/cageContoursFinder';
import { PuzzleSolver } from '../../src/solver/puzzleSolver';
import { logFactory } from '../../src/util/logFactory';
import { DailyKillerSudokuPuzzlePage } from './dailyKillerSudokuPuzzlePage';

const log = logFactory.of('E2E Puzzle Reader & Solver');

const PUZZLE_SOURCE_IMAGE_PATH = './tmp/screenshot-source-puzzle.png';
const PAGE_WITH_PUZZLE_SOLVED_IMAGE_PATH = './tmp/screenshot-solved-puzzle-page.png';

const OPEN_SOURCE_PUZZLE_IMAGE = false;
const OPEN_CONTOURS_PUZZLE_IMAGE = false;
const OPEN_SOLVED_PUZZLE_AT_COMPLETION = false;

let browser;

describe('E2E puzzle reader and solver tests for DailyKillerSudoku.com', () => {
    test('Puzzle 24914 of difficulty 10', async () => {
        const page = new DailyKillerSudokuPuzzlePage(browser);
        await page.open(24914);
        await page.detectAndSavePuzzleImage(PUZZLE_SOURCE_IMAGE_PATH);
        openSourcePuzzleImageIfNecessary(PUZZLE_SOURCE_IMAGE_PATH);
        const problem = await transformPuzzleImageToStructuredPuzzle(PUZZLE_SOURCE_IMAGE_PATH);
        openContoursPuzzleImageIfNecessary('./tmp/cv/contours.png');
        const solution = solvePuzzle(problem);
        await page.reflectSolution(solution);
        await page.saveSolvedPuzzleImage(PAGE_WITH_PUZZLE_SOLVED_IMAGE_PATH);
        openPageImageWithSolvedPuzzleIfNecessary(PAGE_WITH_PUZZLE_SOLVED_IMAGE_PATH);
    });
    
    beforeEach(async () => {
        log.info('Launching Puppeteer with headless Chrome');
        browser = await puppeteer.launch();
    });

    afterEach(() => {
        log.info('Closing browser');
        browser.close();
    });

    const transformPuzzleImageToStructuredPuzzle = async (puzzleSourceImagePath) => {
        log.info('Transforming puzzle image to structured problem ...');
        const problem = await findCageContours(puzzleSourceImagePath);
        log.info('Puzzle problem constructed successfully');
        return problem;
    };

    const solvePuzzle = (problem) => {
        log.info('Solving puzzle ...');
        const solution = new PuzzleSolver(problem).solve();
        log.info('Solution for puzzle found!');
        return solution;
    };

    const openSourcePuzzleImageIfNecessary = (path) => {
        openImageIfNecessary(OPEN_SOURCE_PUZZLE_IMAGE, path);
    };

    const openContoursPuzzleImageIfNecessary = (path) => {
        openImageIfNecessary(OPEN_CONTOURS_PUZZLE_IMAGE, path);
    };

    const openPageImageWithSolvedPuzzleIfNecessary = (path) => {
        openImageIfNecessary(OPEN_SOLVED_PUZZLE_AT_COMPLETION, path);
    };

    const openImageIfNecessary = (doOpen, path) => {
        if (doOpen) {
            open(path);
        }
    };
});
