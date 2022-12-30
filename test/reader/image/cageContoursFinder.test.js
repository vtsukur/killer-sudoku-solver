import { findCageContours } from '../../../src/reader/image/cageContoursFinder';

describe('Cage contours finder tests', () => {
    test('Read problem from image', async () => {
        const contours = await findCageContours('./test/reader/image/samples/dailyKillerSudokuDotCom_24919.png');
        expect(contours.length).toBeGreaterThan(0);
    });
});
