import { findCageContours } from '../../../src/reader/image/cageContoursFinder';

describe('Cage contours finder tests', () => {
    test('Read problem from image', async () => {
        const problem = await findCageContours('./test/reader/image/samples/dailyKillerSudokuDotCom_24954.png');
        expect(problem.cages.length).toBe(24);
    });
});
