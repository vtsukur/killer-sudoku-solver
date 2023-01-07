/* istanbul ignore file */
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
        
        // removing cookie banner and ads
        await this.#removeClutter();

        return this.#browserPage;
    }

    async #removeClutter() {
        await this.#removeCookieBanner();
    }

    async #removeCookieBanner() {
        log.info('Removing cookie banner so that it doesn\'t overlap with puzzle canvas to enable proper puzzle detection');
        await this.#browserPage.waitForSelector(SELECTOR_BANNER);
        await this.#browserPage.evaluate(function(selector) {
            document.querySelector(selector).remove();
        }, SELECTOR_BANNER);
    }

    #puzzleUrl(puzzleId) {
        return `https://www.dailykillersudoku.com/puzzle/${puzzleId}`;
    }
}
