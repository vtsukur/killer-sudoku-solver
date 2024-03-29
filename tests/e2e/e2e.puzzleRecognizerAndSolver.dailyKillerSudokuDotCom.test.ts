import * as config from 'config';
import * as open from 'open';
import puppeteer, { Browser } from 'puppeteer';
import { Puzzle } from '../../src/puzzle/puzzle';
import { recognize } from '../../src/recognizer/recognizer';
import { Solver } from '../../src/solver/solver';
import { logFactory } from '../../src/util/logFactory';
import { TempFilePaths } from '../../src/util/tempFilePaths';
import { DailyKillerSudokuDotComPuzzlePage } from './dailyKillerSudokuDotComPuzzlePage';

const log = logFactory.withLabel('E2E Puzzle Reader & Solver');

const OPEN_IMAGE_FILES = config.get('openImageFiles');

describe('E2E puzzle reader and solver tests for DailyKillerSudoku.com', () => {
    let browser: Browser;

    const puzzleIds = [
        24914
    ];

    puzzleIds.forEach(puzzleId => {
        test(`Puzzle ${puzzleId}`, async () => {
            // Initiating context.
            const paths = new Paths(puzzleId).recreateBaseDirSync();
            const page = new DailyKillerSudokuDotComPuzzlePage(browser);
            await page.open(puzzleId);

            // Detecting and recognizing puzzle.
            await page.detectAndSavePuzzleImage(paths.imageOfUnsolvedPuzzle);
            openImageIfNecessary(paths.imageOfUnsolvedPuzzle);
            const recognitionResult = await recognizePuzzle(paths.imageOfUnsolvedPuzzle, puzzleId);
            openImageIfNecessary(recognitionResult.paths.puzzleImageSignificantContoursFilePath);

            // Solving puzzle.
            const solution = solvePuzzle(recognitionResult.puzzle);
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

const recognizePuzzle = async (puzzleSourceImagePath: string, taskId: number) => {
    log.info('Recognizing puzzle ...');
    const result = await recognize(puzzleSourceImagePath, taskId);
    log.info('Puzzle recognized successfully');
    return result;
};

const solvePuzzle = (puzzle: Puzzle) => {
    log.info('Solving puzzle ...');
    const solution = new Solver().solve(puzzle);
    log.info('Solution for puzzle found!');
    return solution;
};

const openImageIfNecessary = (path: string) => {
    if (OPEN_IMAGE_FILES) {
        open(path);
    }
};

class Paths extends TempFilePaths {

    constructor(taskId: number) {
        super(`./tmp/e2e-tests/${taskId}`);
    }

    get imageOfUnsolvedPuzzle() {
        return this.screenshotFilePath('unsolved-puzzle');
    }

    get imageOfPageWithSolvedPuzzle() {
        return this.screenshotFilePath('solved-puzzle-page');
    }

    private screenshotFilePath(classifier: string) {
        return this.filePath(`screeshot-of-${classifier}.png`);
    }

}
