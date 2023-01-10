import config from 'config';
import * as fs from 'node:fs';
import open from 'open';
import puppeteer from 'puppeteer';
import { recognizePuzzle } from '../../src/reader/image/puzzleRecognizer';
import { PuzzleSolver } from '../../src/solver/puzzleSolver';
import { logFactory } from '../../src/util/logFactory';
import { DailyKillerSudokuPuzzlePage } from './dailyKillerSudokuPuzzlePage';

const log = logFactory.of('E2E Puzzle Reader & Solver');

const OPEN_IMAGE_FILES = config.get('openImageFiles');

let browser;

describe('E2E puzzle reader and solver tests for DailyKillerSudoku.com', () => {
    const puzzleIds = [
        24914
    ];

    puzzleIds.forEach(puzzleId => {
        test(`Puzzle ${puzzleId}`, async () => {
            const paths = new TempFilePaths(puzzleId).recreateDir();
            const page = new DailyKillerSudokuPuzzlePage(browser);
            await page.open(puzzleId);
            await page.detectAndSavePuzzleImage(paths.imageOfUnsolvedPuzzle);
            openImageIfNecessary(paths.imageOfUnsolvedPuzzle);
            const recognitionResult = await doRecognizePuzzle(paths.imageOfUnsolvedPuzzle, puzzleId);
            openImageIfNecessary(recognitionResult.paths.puzzleImageSignificantContoursFilePath);
            const solution = solvePuzzle(recognitionResult.problem);
            await page.reflectSolution(solution);
            await page.saveSolvedPuzzleImage(paths.imageOfPageWithSolvedPuzzle);
            openImageIfNecessary(paths.imageOfPageWithSolvedPuzzle);
        });
    });
    
    beforeEach(async () => {
        log.info('Launching Puppeteer with headless Chrome');
        browser = await puppeteer.launch();
    });

    afterEach(() => {
        log.info('Closing browser');
        browser.close();
    });
});

const doRecognizePuzzle = async (puzzleSourceImagePath, taskId) => {
    log.info('Recognizing puzzle ...');
    const result = await recognizePuzzle(puzzleSourceImagePath, taskId);
    log.info('Puzzle recognized successfully');
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

class TempFilePaths {
    #dirPath;

    constructor(taskId) {
        this.#dirPath = `./tmp/e2e/${taskId}`;
    }

    recreateDir() {
        fs.rmSync(this.#dirPath, { recursive: true, force: true });
        fs.mkdirSync(this.#dirPath, { recursive: true });   
        return this; 
    }

    get imageOfUnsolvedPuzzle() {
        return this.#screenshotFilePath('unsolved-puzzle');
    }

    get imageOfPageWithSolvedPuzzle() {
        return this.#screenshotFilePath('solved-puzzle-page');
    }

    #screenshotFilePath(classifier) {
        return `${this.#dirPath}/screeshot-of-${classifier}.png`;
    }
}
