import config from 'config';
import * as fs from 'node:fs';
import open from 'open';
import puppeteer from 'puppeteer';
import { findCageContours } from '../../src/reader/image/cageContoursFinder';
import { PuzzleSolver } from '../../src/solver/puzzleSolver';
import { logFactory } from '../../src/util/logFactory';
import { DailyKillerSudokuPuzzlePage } from './dailyKillerSudokuPuzzlePage';

const log = logFactory.of('E2E Puzzle Reader & Solver');

const IMAGE_PATH_BASE = './tmp/e2e';
const PUZZLE_SOURCE_IMAGE_PATH = `${IMAGE_PATH_BASE}/screenshot-source-puzzle.png`;
const PAGE_WITH_PUZZLE_SOLVED_IMAGE_PATH = `${IMAGE_PATH_BASE}/screenshot-solved-puzzle-page.png`;

const OPEN_IMAGE_FILES = config.get('openImageFiles');

let browser;

describe('E2E puzzle reader and solver tests for DailyKillerSudoku.com', () => {
    fs.mkdirSync(IMAGE_PATH_BASE, { recursive: true });
    
    test('Puzzle 24914 of difficulty 10', async () => {
        const page = new DailyKillerSudokuPuzzlePage(browser);
        await page.open(24914);
        await page.detectAndSavePuzzleImage(PUZZLE_SOURCE_IMAGE_PATH);
        openImageIfNecessary(PUZZLE_SOURCE_IMAGE_PATH);
        const { problem, tempFilePaths } = await transformPuzzleImageToStructuredPuzzle(PUZZLE_SOURCE_IMAGE_PATH, 24914);
        openImageIfNecessary(tempFilePaths.puzzleImageSignificantContoursFilePath);
        const solution = solvePuzzle(problem);
        await page.reflectSolution(solution);
        await page.saveSolvedPuzzleImage(PAGE_WITH_PUZZLE_SOLVED_IMAGE_PATH);
        openImageIfNecessary(PAGE_WITH_PUZZLE_SOLVED_IMAGE_PATH);
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
        const result = await findCageContours(puzzleSourceImagePath);
        log.info('Puzzle problem constructed successfully');
        return result;
    };

    const solvePuzzle = (problem) => {
        log.info('Solving puzzle ...');
        const solution = new PuzzleSolver(problem).solve();
        log.info('Solution for puzzle found!');
        return solution;
    };

    const openImageIfNecessary = (path) => {
        if (OPEN_IMAGE_FILES) {
            open(path);
        }
    };
});
