import { Combo } from '../../../../../src/solver/math';
import { SudokuNumsSet } from '../../../../../src/solver/sets';
import { MasterModelReduction } from '../../../../../src/solver/strategies/reduction/masterModelReduction';
import { createAndInitCageM } from './cageModelBuilder';

describe('Unit tests for `CageModel`', () => {

    let reduction: MasterModelReduction;

    beforeEach(() => {
        reduction = new MasterModelReduction();
    });

    test('Initial reduction for `CageModel` of size 2 with a single `Combo`', () => {
        const cageM = createAndInitCageM(2, 17, reduction);

        expect(cageM.cellMs[0].numOpts()).toEqual([ 8, 9 ]);
        expect(cageM.cellMs[1].numOpts()).toEqual([ 8, 9 ]);
        expect(Array.from(cageM.combos)).toEqual([
            Combo.of(8, 9)
        ]);
    });

    test('Initial reduction for `CageModel` of size 2 with several `Combo`s', () => {
        const cageM = createAndInitCageM(2, 13, reduction);

        expect(cageM.cellMs[0].numOpts()).toEqual([ 4, 5, 6, 7, 8, 9 ]);
        expect(cageM.cellMs[1].numOpts()).toEqual([ 4, 5, 6, 7, 8, 9 ]);
        expect(Array.from(cageM.combos)).toEqual([
            Combo.of(4, 9),
            Combo.of(5, 8),
            Combo.of(6, 7)
        ]);
    });

    test('Initial reduction for `CageModel` of size 3 with a single `Combo`', () => {
        const cageM = createAndInitCageM(3, 24, reduction);

        expect(cageM.cellMs[0].numOpts()).toEqual([ 7, 8, 9 ]);
        expect(cageM.cellMs[1].numOpts()).toEqual([ 7, 8, 9 ]);
        expect(cageM.cellMs[2].numOpts()).toEqual([ 7, 8, 9 ]);
        expect(Array.from(cageM.combos)).toEqual([
            Combo.of(7, 8, 9)
        ]);
    });

    test('Reduction of `CageModel` with 2 `Cell`s having several `Combo`s', () => {
        // Given:
        const cageM = createAndInitCageM(2, 11);

        reduction.deleteNumOpt(cageM.cellMs[0], 5);

        // When:
        cageM.reduce(reduction);

        // Then:
        expect(reduction.peek()).toEqual(cageM);
        expect(cageM.cellMs[0].numOpts()).toEqual([ 2, 3, 4, 6, 7, 8, 9 ]);
        expect(cageM.cellMs[1].numOpts()).toEqual([ 2, 3, 4, 5, 7, 8, 9 ]);
        expect(Array.from(cageM.combos)).toEqual([
            Combo.of(2, 9),
            Combo.of(3, 8),
            Combo.of(4, 7),
            Combo.of(5, 6)
        ]);
    });

    test('Reduction for `CageModel` of size 7 and sum 31 with 2 `Combo`s after partial reduce (real case from `dailyKillerSudokuDotCom_puzzle24789_difficulty10`)', () => {
        const cageM = createAndInitCageM(7, 31, reduction);

        const initialCombos = Array.from(cageM.combos);
        expect(initialCombos).toEqual([
            Combo.of(1, 2, 3, 4, 5, 7, 9),
            Combo.of(1, 2, 3, 4, 6, 7, 8)
        ]);

        cageM.cellMs[0].deleteNumOpts(SudokuNumsSet.of(3, 9));
        cageM.cellMs[1].deleteNumOpts(SudokuNumsSet.of(3, 9));
        cageM.cellMs[2].deleteNumOpts(SudokuNumsSet.of(3, 9));
        cageM.cellMs[3].deleteNumOpts(SudokuNumsSet.of(4, 8, 9));
        cageM.cellMs[4].deleteNumOpts(SudokuNumsSet.of(4, 8, 9));
        cageM.cellMs[5].deleteNumOpts(SudokuNumsSet.of(4, 8, 9));
        cageM.cellMs[6].deleteNumOpts(SudokuNumsSet.of(4, 7, 8, 9));

        cageM.reduce(reduction);

        expect(cageM.combos).toEqual([
            Combo.of(1, 2, 3, 4, 6, 7, 8)
        ]);
    });

});
