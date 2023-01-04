import puppeteer from 'puppeteer';

describe('Read and solve puzzle', () => {
    test('Read and find solution for puzzle 24914 of difficulty 10 by DailyKillerSudoku.com', async () => {
        const browser = await puppeteer.launch({
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=egl']
        });
        const page = await browser.newPage();

        await page.goto('https://www.dailykillersudoku.com/puzzle/24914');
        await page.waitForSelector('.cc_banner-wrapper');
        await page.evaluate(() => {
            document.querySelector('.cc_banner-wrapper').remove();
        });

        await page.waitForSelector('.puzzle-canvas');
        const puzzleCanvasClientRect = await page.evaluate(() => {
            // document.querySelector('.puzzle-canvas').scrollIntoView();
            const rect = document.querySelector('.puzzle-canvas').getBoundingClientRect();
            return {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height
            };
        });
        await page.screenshot({
            path: './tmp/screenshot.png',
            captureBeyondViewport: true,
            clip: {
                x: puzzleCanvasClientRect.x,
                y: puzzleCanvasClientRect.y,
                width: puzzleCanvasClientRect.width,
                height: puzzleCanvasClientRect.height
            }
        });

        console.log('Opened');

        await browser.close();
    });
});
