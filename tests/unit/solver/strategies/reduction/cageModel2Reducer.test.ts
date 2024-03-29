import { Combo } from '../../../../../src/solver/math';
import { CageModel } from '../../../../../src/solver/models/elements/cageModel';
import { CellModel } from '../../../../../src/solver/models/elements/cellModel';
import { CageModel2FullReducer } from '../../../../../src/solver/strategies/reduction/archive/cageModel2FullReducer';
import { CageModel2Reducer } from '../../../../../src/solver/strategies/reduction/cageModel2Reducer';
import { MasterModelReduction } from '../../../../../src/solver/strategies/reduction/masterModelReduction';
import { CageModelReducerTestConfig } from './cageModelReducerTestConfig';
import { createAndInitCageM } from '../../models/elements/cageModelBuilder';
import { CombosSet } from '../../../../../src/solver/sets';

describe('`CageModel2Reducer`s', () => {

    let cageM: CageModel;
    let cageMCombosSet: CombosSet;
    let cellMs: ReadonlyArray<CellModel>;
    let reduction: MasterModelReduction;

    beforeEach(() => {
        cageM = createAndInitCageM(2, 11);
        cageMCombosSet = cageM.combosSet;
        cellMs = cageM.cellMs;
        reduction = new MasterModelReduction();
    });

    const CONFIGS: ReadonlyArray<CageModelReducerTestConfig> = [
        {
            newReducer: (cageM: CageModel) => new CageModel2FullReducer(cageM),
            type: 'CageModel2FullReducer'
        },
        {
            newReducer: (cageM: CageModel) => new CageModel2Reducer(cageM),
            type: 'CageModel2Reducer'
        }
    ];

    for (const { newReducer, type } of CONFIGS) {

        describe(type, () => {

            test('Case 0: Does not reduce if all number options for a particular `Combo` are deleted -- but deletes `Combo`', () => {
                // Given:
                reduction.deleteComboNumOpts(cellMs[0], Combo.of(5, 6));
                reduction.deleteComboNumOpts(cellMs[1], Combo.of(5, 6));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(cellMs[1].numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
                    Combo.of(2, 9),
                    Combo.of(3, 8),
                    Combo.of(4, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toEqual([ 5, 6 ]);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toEqual([ 5, 6 ]);
            });

            test('Case 1: Reduces after deleting all but the 1-st number option of a particular `Combo` in the 1-st `Cell`', () => {
                // Given:
                reduction.deleteNumOpt(cellMs[0], 6);
                reduction.deleteComboNumOpts(cellMs[1], Combo.of(5, 6));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(cellMs[1].numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
                    Combo.of(2, 9),
                    Combo.of(3, 8),
                    Combo.of(4, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toEqual([ 5, 6 ]);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toEqual([ 5, 6 ]);
            });

            test('Case 2: Reduces after deleting all but the 2-nd number option of a particular `Combo` in the 1-st `Cell`', () => {
                // Given:
                reduction.deleteNumOpt(cellMs[0], 5);
                reduction.deleteComboNumOpts(cellMs[1], Combo.of(5, 6));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(cellMs[1].numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
                    Combo.of(2, 9),
                    Combo.of(3, 8),
                    Combo.of(4, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toEqual([ 5, 6 ]);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toEqual([ 5, 6 ]);
            });

            test('Case 3: Reduces after deleting all number options of a particular `Combo` in the 2-nd `Cell`', () => {
                // Given:
                reduction.deleteComboNumOpts(cellMs[1], Combo.of(5, 6));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(cellMs[1].numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
                    Combo.of(2, 9),
                    Combo.of(3, 8),
                    Combo.of(4, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toEqual([ 5, 6 ]);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toEqual([ 5, 6 ]);
            });

            test('Case 4: Reduces after deleting all but the 1-st number option of a particular `Combo` in the 2-nd `Cell`', () => {
                // Given:
                reduction.deleteComboNumOpts(cellMs[0], Combo.of(5, 6));
                reduction.deleteNumOpt(cellMs[1], 6);

                // When:
                newReducer(cageM).reduce(reduction);

                expect(cellMs[0].numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(cellMs[1].numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
                    Combo.of(2, 9),
                    Combo.of(3, 8),
                    Combo.of(4, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toEqual([ 5, 6 ]);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toEqual([ 5, 6 ]);
            });

            test('Case 5: Reduces after deleting the 2-nd number option of a particular `Combo` in both `Cell`s', () => {
                // Given:
                reduction.deleteNumOpt(cellMs[0], 6);
                reduction.deleteNumOpt(cellMs[1], 6);

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(cellMs[1].numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
                    Combo.of(2, 9),
                    Combo.of(3, 8),
                    Combo.of(4, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toEqual([ 5, 6 ]);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toEqual([ 5, 6 ]);
            });

            test('Case 6: Does not reduce after deleting the 1-st number option of a particular `Combo` in the 1-st `Cell` and deleting the 2-nd number option in the 2-nd `Cell`', () => {
                // Given:
                reduction.deleteNumOpt(cellMs[0], 5);
                reduction.deleteNumOpt(cellMs[1], 6);

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 2, 3, 4, 6, 7, 8, 9 ]);
                expect(cellMs[1].numOpts()).toEqual([ 2, 3, 4, 5, 7, 8, 9 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
                    Combo.of(2, 9),
                    Combo.of(3, 8),
                    Combo.of(4, 7),
                    Combo.of(5, 6)
                ]);
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toEqual([ 5 ]);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toEqual([ 6 ]);
            });

            test('Case 7: Reduces after deleting the 2-nd number option of a particular `Combo` in the 2-nd `Cell`', () => {
                // Given:
                reduction.deleteNumOpt(cellMs[1], 6);

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 2, 3, 4, 6, 7, 8, 9 ]);
                expect(cellMs[1].numOpts()).toEqual([ 2, 3, 4, 5, 7, 8, 9 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
                    Combo.of(2, 9),
                    Combo.of(3, 8),
                    Combo.of(4, 7),
                    Combo.of(5, 6)
                ]);
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toEqual([ 5 ]);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toEqual([ 6 ]);
            });

            test('Case 8: Reduces after deleting all but the 2-nd number option of a particular `Combo` in the 2-nd `Cell`', () => {
                // Given:
                reduction.deleteComboNumOpts(cellMs[0], Combo.of(5, 6));
                reduction.deleteNumOpt(cellMs[1], 5);

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(cellMs[1].numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
                    Combo.of(2, 9),
                    Combo.of(3, 8),
                    Combo.of(4, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toEqual([ 5, 6 ]);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toEqual([ 5, 6 ]);
            });

            test('Case 9: Does not reduce after deleting the 2-nd number option of a particular `Combo` in the 1-st `Cell` and deleting the 1-st number option in the 2-nd `Cell`', () => {
                // Given:
                reduction.deleteNumOpt(cellMs[0], 6);
                reduction.deleteNumOpt(cellMs[1], 5);

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 2, 3, 4, 5, 7, 8, 9 ]);
                expect(cellMs[1].numOpts()).toEqual([ 2, 3, 4, 6, 7, 8, 9 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
                    Combo.of(2, 9),
                    Combo.of(3, 8),
                    Combo.of(4, 7),
                    Combo.of(5, 6)
                ]);
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toEqual([ 6 ]);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toEqual([ 5 ]);
            });

            test('Case 10: Reduces after deleting the 1-st number option of a particular `Combo` in both `Cell`s', () => {
                // Given:
                reduction.deleteNumOpt(cellMs[0], 5);
                reduction.deleteNumOpt(cellMs[1], 5);

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(cellMs[1].numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
                    Combo.of(2, 9),
                    Combo.of(3, 8),
                    Combo.of(4, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toEqual([ 5, 6 ]);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toEqual([ 5, 6 ]);
            });

            test('Case 11: Reduces after deleting the 1-st number option of a particular `Combo` in the 2-nd `Cell`', () => {
                // Given:
                reduction.deleteNumOpt(cellMs[1], 5);

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 2, 3, 4, 5, 7, 8, 9 ]);
                expect(cellMs[1].numOpts()).toEqual([ 2, 3, 4, 6, 7, 8, 9 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
                    Combo.of(2, 9),
                    Combo.of(3, 8),
                    Combo.of(4, 7),
                    Combo.of(5, 6)
                ]);
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toEqual([ 6 ]);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toEqual([ 5 ]);
            });

            test('Case 12: Reduces after deleting all number options of a particular `Combo` in the 1-st `Cell`', () => {
                // Given:
                reduction.deleteComboNumOpts(cellMs[0], Combo.of(5, 6));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(cellMs[1].numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
                    Combo.of(2, 9),
                    Combo.of(3, 8),
                    Combo.of(4, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toEqual([ 5, 6 ]);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toEqual([ 5, 6 ]);
            });

            test('Case 13: Reduces after deleting all but the 2-nd number option of a particular `Combo` in the 1-st `Cell`', () => {
                // Given:
                reduction.deleteNumOpt(cellMs[0], 5);
                reduction.deleteComboNumOpts(cellMs[1], Combo.of(5, 6));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(cellMs[1].numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
                    Combo.of(2, 9),
                    Combo.of(3, 8),
                    Combo.of(4, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toEqual([ 5, 6 ]);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toEqual([ 5, 6 ]);
            });

            test('Case 14: Reduces after deleting all but the 1-st number option of a particular `Combo` in the 1-st `Cell`', () => {
                // Given:
                reduction.deleteNumOpt(cellMs[0], 6);
                reduction.deleteComboNumOpts(cellMs[1], Combo.of(5, 6));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(cellMs[1].numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
                    Combo.of(2, 9),
                    Combo.of(3, 8),
                    Combo.of(4, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toEqual([ 5, 6 ]);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toEqual([ 5, 6 ]);
            });

            test('Case 15: Does not reduce if there are no deletions for a particular `Combo`', () => {
                // Given:
                // ... initially reduced `CageModel` without extra deletions for its `CellModel`s.

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 2, 3, 4, 5, 6, 7, 8, 9 ]);
                expect(cellMs[1].numOpts()).toEqual([ 2, 3, 4, 5, 6, 7, 8, 9 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
                    Combo.of(2, 9),
                    Combo.of(3, 8),
                    Combo.of(4, 7),
                    Combo.of(5, 6)
                ]);
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toHaveLength(0);
            });

            test('Reduces after deleting number options from several `Combo`s', () => {
                // Given:
                reduction.deleteNumOpt(cellMs[0], 6);
                reduction.deleteComboNumOpts(cellMs[0], Combo.of(5, 6));
                reduction.deleteNumOpt(cellMs[0], 9);
                reduction.deleteComboNumOpts(cellMs[1], Combo.of(2, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 3, 4, 7, 8 ]);
                expect(cellMs[1].numOpts()).toEqual([ 3, 4, 7, 8 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
                    Combo.of(3, 8),
                    Combo.of(4, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toEqual([ 2, 5, 6, 9 ]);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toEqual([ 2, 5, 6, 9 ]);
            });

            test('Reflects impact on `MasterModelReduction` if reduction happened', () => {
                // Given:
                reduction.deleteNumOpt(cellMs[0], 5);

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(reduction.peek()).toEqual(cageM);
            });

            test('Does not reflect impact on `MasterModelReduction` if reduction did not happen', () => {
                // Given:
                // ... initially reduced `CageModel` without extra deletions for its `CellModel`s.

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(reduction.peek()).toBeUndefined();
            });

        });

    }

});
