/* istanbul ignore file */
import _ from 'lodash';
import { House } from '../../src/problem/house';
import { Rect } from '../../src/reader/image/rect';
import { logFactory } from '../../src/util/logFactory';

const log = logFactory.of('DailyKillerSudoku.com Puzzle Page');

const BIG_ENOUGH_PAGE_VIEWPORT = {
    width: 1680,
    height: 1050,
    deviceScaleFactor: 2
};

const SELECTOR_BANNER = '.cc_banner-wrapper';
const SELECTOR_PUZZLE_CANVAS = '.puzzle-canvas';
const SELECTOR_NTH_CELL = (n) => {
    return `.cell:nth-of-type(${n})`;
};
const SELECTOR_SHOWN_MODAL = '#modal.show';
const XPATH_SOLVED_TEXT = '//*[text()="Solved!"]';

const STATIC_WAIT_FOR_SOLVED_ANIMATION_TIMEOUT = 1000;

export class DailyKillerSudokuPuzzlePage {
    #browser;
    #browserPage;

    constructor(browser) {
        this.#browser = browser;
    }

    async open(puzzleId) {
        this.#browserPage = await this.#browser.newPage();

        // setting viewport size and device scale factor to be big enough for image recognition techniques to work
        this.#browserPage.setViewport(BIG_ENOUGH_PAGE_VIEWPORT);

        // opening page
        const url = this.#puzzleUrl(puzzleId);
        log.info(`Opening page ${url} ...`);
        await this.#browserPage.goto(url);
        log.info('Page loaded');
        
        await this.#removeCookieBanner();

        return this.#browserPage;
    }

    async #removeCookieBanner() {
        log.info('Removing cookie banner so that it doesn\'t overlap with puzzle canvas to enable proper puzzle detection');
        await this.#waitForSelectorAndRemove(SELECTOR_BANNER);
    }

    async #waitForSelectorAndRemove(selector) {
        await this.#browserPage.waitForSelector(selector);
        await this.#browserPage.evaluate(function($) {
            document.querySelector($).remove();
        }, selector);
    }

    #puzzleUrl(puzzleId) {
        return `https://www.dailykillersudoku.com/puzzle/${puzzleId}`;
    }

    async detectAndSavePuzzleImage(puzzleSourceImagePath) {
        log.info('Detecting placement of puzzle canvas ...');
        await this.#browserPage.waitForSelector(SELECTOR_PUZZLE_CANVAS);
        const captureRect = Rect.from(await this.#browserPage.evaluate(($) => {
            const rect = document.querySelector($).getBoundingClientRect();
            return {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height
            };
        }, SELECTOR_PUZZLE_CANVAS));
        log.info(`Detected puzzle canvas client rect ${captureRect}`);

        log.info('Taking screenshot of detected puzzle canvas area ...');
        await this.#browserPage.screenshot({
            path: puzzleSourceImagePath,
            captureBeyondViewport: true,
            clip: captureRect
        });
        log.info(`Screenshot of puzzle canvas area saved to ${puzzleSourceImagePath}`);
    };

    async reflectSolution(solution) {
        log.info('Reflecting puzzle solution by sending input commands ...');

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
            await this.#browserPage.click(cmd.selector);
            await this.#browserPage.keyboard.press(cmd.press);
        }

        log.info('Check that "Solved!" modal is displayed');
        await this.#browserPage.waitForXPath(XPATH_SOLVED_TEXT);
        await this.#browserPage.waitForSelector(SELECTOR_SHOWN_MODAL);
        log.info('Page confirms that puzzle is solved successfully!');

        log.info('Waiting for puzzle solved animation to complete');
        await new Promise(resolve => setTimeout(resolve, STATIC_WAIT_FOR_SOLVED_ANIMATION_TIMEOUT));
    };
}
