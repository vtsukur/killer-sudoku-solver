import { recognizePuzzle } from '../../../src/reader/image/puzzleRecognizer';

describe('Puzzle recognizer tests', () => {
    test('Read problem 24919 from image', async () => {
        const { problem } = await recognizePuzzle('./test/reader/image/samples/dailyKillerSudokuDotCom_24919.png', 24919);
        expect(problem.cages.length).toBe(26);
    });

    test('Read problem 24954 from image', async () => {
        const { problem } = await recognizePuzzle('./test/reader/image/samples/dailyKillerSudokuDotCom_24954.png', 24954);
        expect(problem.cages.length).toBe(24);
    });
});
