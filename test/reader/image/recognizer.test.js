import { recognize } from '../../../src/reader/image/recognizer';

describe('Puzzle recognizer tests', () => {
    test('Read puzzle 24919 from image', async () => {
        const { puzzle } = await recognize('./test/reader/image/samples/dailyKillerSudokuDotCom_24919.png', 24919);
        expect(puzzle.cages.length).toBe(26);
    });

    test('Read puzzle 24954 from image', async () => {
        const { puzzle } = await recognize('./test/reader/image/samples/dailyKillerSudokuDotCom_24954.png', 24954);
        expect(puzzle.cages.length).toBe(24);
    });
});
