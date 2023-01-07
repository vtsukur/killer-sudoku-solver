/* istanbul ignore file */
import { logFactory } from '../../src/util/logFactory';

const log = logFactory.of('DailyKillerSudoku.com Puzzle Page');

const PAGE_VIEWPORT_WIDTH = 1680;
const PAGE_VIEWPORT_HEIGHT = 1050;
const PAGE_VIEWPORT_DEVICE_SCALE_FACTOR = 2;

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

        // viewport size and device scale factor should be big enough for image recognition techniques to work
        this.#browserPage.setViewport({
            width: PAGE_VIEWPORT_WIDTH,
            height: PAGE_VIEWPORT_HEIGHT,
            deviceScaleFactor: PAGE_VIEWPORT_DEVICE_SCALE_FACTOR
        });

        const url = this.#puzzleUrl(puzzleId);
        log.info(`Opening page ${url} ...`);
        await this.#browserPage.goto(url);
        log.info('Page loaded');

        log.info('Removing cookie banner so that it doesn\'t overlap with puzzle canvas to enable proper puzzle detection');
        await this.#browserPage.waitForSelector(SELECTOR_BANNER);
        await this.#browserPage.evaluate(function() {
            document.querySelector('.cc_banner-wrapper').remove();
        });

        return this.#browserPage;
    }

    #puzzleUrl(puzzleId) {
        return `https://www.dailykillersudoku.com/puzzle/${puzzleId}`;
    }
}
