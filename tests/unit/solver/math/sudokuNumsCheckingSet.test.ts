import { NumCheckingSet } from '../../../../src/solver/math/numCheckingSet';
import { SudokuNumsCheckingSet } from '../../../../src/solver/math/sudokuNumsCheckingSet';

describe('Unit tests for `SudokuNumsCheckingSet`', () => {
    test('Remaining numbers of `NumsCheckingSet`', () => {
        expect(SudokuNumsCheckingSet.remainingOf(NumCheckingSet.of()).bitStore).toBe(
            NumCheckingSet.of(1, 2, 3, 4, 5, 6, 7, 8, 9).bitStore
        );
        expect(SudokuNumsCheckingSet.remainingOf(NumCheckingSet.of(1, 2, 3)).bitStore).toBe(
            NumCheckingSet.of(4, 5, 6, 7, 8, 9).bitStore
        );
        expect(SudokuNumsCheckingSet.remainingOf(NumCheckingSet.of(1, 2, 3, 4, 5, 6, 7, 8, 9)).bitStore).toBe(
            NumCheckingSet.of().bitStore
        );
    });
});
