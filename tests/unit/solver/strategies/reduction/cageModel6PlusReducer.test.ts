import { Combo } from '../../../../../src/solver/math';
import { CageModel } from '../../../../../src/solver/models/elements/cageModel';
import { CellModel } from '../../../../../src/solver/models/elements/cellModel';
import { CombosSet, SudokuNumsSet } from '../../../../../src/solver/sets';
import { CageModel6PlusReducer } from '../../../../../src/solver/strategies/reduction/cageModel6PlusReducer';
import { MasterModelReduction } from '../../../../../src/solver/strategies/reduction/masterModelReduction';
import { createAndInitCageM } from '../../../../perf/solver/models/elements/cageModelBuilders';

describe('CageModel6PlusReducer', () => {

    let cageM: CageModel;
    let cageMCombosSet: CombosSet;
    let cellMs: Array<CellModel>;
    let reduction: MasterModelReduction;

    const createAndInitCageMAndReduction = (cellCount: number, sum: number) => {
        cageM = createAndInitCageM(cellCount, sum);
        cageMCombosSet = cageM.comboSet;
        cellMs = cageM.cellMs;

        reduction = new MasterModelReduction();

        return cageM;
    };

    test('Reduces case from real production scenario #1', () => {
        // Given:
        createAndInitCageMAndReduction(6, 27);
        cellMs[0].reduceNumOpts(SudokuNumsSet.of(8));
        cellMs[1].reduceNumOpts(SudokuNumsSet.of(1));
        cellMs[2].reduceNumOpts(SudokuNumsSet.of(5, 7));
        cellMs[3].reduceNumOpts(SudokuNumsSet.of(1, 2, 7, 8, 9));
        cellMs[4].reduceNumOpts(SudokuNumsSet.of(1, 2, 7, 8, 9));
        cellMs[5].reduceNumOpts(SudokuNumsSet.of(1, 2, 4, 5, 7));

        // When:
        new CageModel6PlusReducer(cageM).reduce(reduction);

        // Then:
        expect(cellMs[0].numOpts()).toEqual([ 8 ]);
        expect(cellMs[1].numOpts()).toEqual([ 1 ]);
        expect(cellMs[2].numOpts()).toEqual([ 5, 7 ]);
        expect(cellMs[3].numOpts()).toEqual([ 1, 2, 7, 8 ]);
        expect(cellMs[4].numOpts()).toEqual([ 1, 2, 7, 8 ]);
        expect(cellMs[5].numOpts()).toEqual([ 1, 2, 4, 5, 7 ]);
        expect(Array.from(cageMCombosSet.combos)).toEqual([
            // Deleted: Combo.of(1, 2, 3, 4, 8, 9),
            // Deleted: Combo.of(1, 2, 3, 5, 7, 9),
            Combo.of(1, 2, 4, 5, 7, 8)
        ]);
        expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toHaveLength(0);
        expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toHaveLength(0);
        expect(reduction.deletedNumOptsOf(cellMs[2]).nums).toHaveLength(0);
        expect(reduction.deletedNumOptsOf(cellMs[3]).nums).toEqual([ 9 ]);
        expect(reduction.deletedNumOptsOf(cellMs[4]).nums).toEqual([ 9 ]);
        expect(reduction.deletedNumOptsOf(cellMs[5]).nums).toHaveLength(0);
    });

    test('Reduces case from real production scenario #2', () => {
        // Given:
        createAndInitCageMAndReduction(7, 32);
        cellMs[0].reduceNumOpts(SudokuNumsSet.of(9));
        cellMs[1].reduceNumOpts(SudokuNumsSet.of(2, 7));
        cellMs[2].reduceNumOpts(SudokuNumsSet.of(3, 4));
        cellMs[3].reduceNumOpts(SudokuNumsSet.of(1, 9));
        cellMs[4].reduceNumOpts(SudokuNumsSet.of(3, 5));
        cellMs[5].reduceNumOpts(SudokuNumsSet.of(1, 6));
        cellMs[6].reduceNumOpts(SudokuNumsSet.of(4, 7));

        // When:
        new CageModel6PlusReducer(cageM).reduce(reduction);

        // Then:
        expect(cellMs[0].numOpts()).toEqual([ 9 ]);
        expect(cellMs[1].numOpts()).toEqual([ 2, 7 ]);
        expect(cellMs[2].numOpts()).toEqual([ 3, 4 ]);
        expect(cellMs[3].numOpts()).toEqual([ 1, 9 ]);
        expect(cellMs[4].numOpts()).toEqual([ 3 ]);
        expect(cellMs[5].numOpts()).toEqual([ 1, 6 ]);
        expect(cellMs[6].numOpts()).toEqual([ 4, 7 ]);
        expect(Array.from(cageMCombosSet.combos)).toEqual([
            // Deleted: Combo.of(1, 2, 3, 4, 5, 8, 9),
            Combo.of(1, 2, 3, 4, 6, 7, 9),
            // Deleted: Combo.of(1, 2, 3, 5, 6, 7, 8)
        ]);
        expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toHaveLength(0);
        expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toHaveLength(0);
        expect(reduction.deletedNumOptsOf(cellMs[2]).nums).toHaveLength(0);
        expect(reduction.deletedNumOptsOf(cellMs[3]).nums).toHaveLength(0);
        expect(reduction.deletedNumOptsOf(cellMs[4]).nums).toEqual([ 5 ]);
        expect(reduction.deletedNumOptsOf(cellMs[5]).nums).toHaveLength(0);
        expect(reduction.deletedNumOptsOf(cellMs[6]).nums).toHaveLength(0);
    });

});
