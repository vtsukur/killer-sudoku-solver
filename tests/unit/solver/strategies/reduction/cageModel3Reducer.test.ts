import { Combo } from '../../../../../src/solver/math';
import { CageModel } from '../../../../../src/solver/models/elements/cageModel';
import { CellModel } from '../../../../../src/solver/models/elements/cellModel';
import { CombosSet, SudokuNumsSet } from '../../../../../src/solver/sets';
import { CageModel3FullReducer } from '../../../../../src/solver/strategies/reduction/archive/cageModel3FullReducer';
import { CageModel3Reducer } from '../../../../../src/solver/strategies/reduction/cageModel3Reducer';
import { MasterModelReduction } from '../../../../../src/solver/strategies/reduction/masterModelReduction';
import { createAndInitCageM } from '../../models/elements/cageModelBuilder';
import { CageModelReducerTestConfig } from './cageModelReducerTestConfig';

describe('CageModel3Reducers', () => {

    let cageM: CageModel;
    let cageMCombosSet: CombosSet;
    let cellMs: ReadonlyArray<CellModel>;
    let reduction: MasterModelReduction;

    const createAndInitCageMAndReduction = (sum: number) => {
        cageM = createAndInitCageM(3, sum);
        cageMCombosSet = cageM.comboSet;
        cellMs = cageM.cellMs;

        reduction = new MasterModelReduction();

        return cageM;
    };

    const CONFIGS: ReadonlyArray<CageModelReducerTestConfig> = [
        {
            newReducer: (cageM: CageModel) => new CageModel3FullReducer(cageM),
            type: 'CageModel3FullReducer'
        },
        {
            newReducer: (cageM: CageModel) => new CageModel3Reducer(cageM),
            type: 'CageModel3Reducer'
        }
    ];

    for (const { newReducer, type } of CONFIGS) {

        describe(type, () => {

            test('Reduces case from real production scenario #1', () => {
                // Given:
                createAndInitCageMAndReduction(13);
                cageMCombosSet.clear();
                cageMCombosSet.addCombo(Combo.of(1, 3, 9));
                cageMCombosSet.addCombo(Combo.of(1, 4, 8));
                cageMCombosSet.addCombo(Combo.of(2, 4, 7));
                cageMCombosSet.addCombo(Combo.of(3, 4, 6));
                cellMs[0].reduceNumOpts(SudokuNumsSet.of(3, 6));
                cellMs[1].reduceNumOpts(SudokuNumsSet.of(1, 7, 8, 9));
                cellMs[2].reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 8, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 3 ]);
                expect(cellMs[1].numOpts()).toEqual([ 1, 9 ]);
                expect(cellMs[2].numOpts()).toEqual([ 1, 9 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
                    Combo.of(1, 3, 9)
                ]);
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toEqual([ 6 ]);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toEqual([ 7, 8 ]);
                expect(reduction.deletedNumOptsOf(cellMs[2]).nums).toEqual([ 2, 3, 8 ]);
            });

            test('Does not reduce if there are no deletions for a particular `Combo`', () => {
                // Given:
                // ... initially reduced `CageModel` without extra deletions for its `CellModel`s.
                createAndInitCageMAndReduction(9);

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 1, 2, 3, 4, 5, 6 ]);
                expect(cellMs[1].numOpts()).toEqual([ 1, 2, 3, 4, 5, 6 ]);
                expect(cellMs[2].numOpts()).toEqual([ 1, 2, 3, 4, 5, 6 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
                    Combo.of(1, 2, 6),
                    Combo.of(1, 3, 5),
                    Combo.of(2, 3, 4)
                ]);
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[2]).nums).toHaveLength(0);
            });

        });

    }

});
