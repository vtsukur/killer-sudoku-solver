import { Cage } from '../../../../../src/puzzle/cage';
import { Cell } from '../../../../../src/puzzle/cell';
import { Combo } from '../../../../../src/solver/math';
import { CageModel } from '../../../../../src/solver/models/elements/cageModel';
import { CellModel } from '../../../../../src/solver/models/elements/cellModel';
import { CageModelOfSize2FullReducer } from '../../../../../src/solver/strategies/reduction/archive/cageModelOfSize2FullReducer';
import { CageModelOfSize2Reducer } from '../../../../../src/solver/strategies/reduction/cageModelOfSize2Reducer';
import { CageModelOfSize2PartialReducer } from '../../../../../src/solver/strategies/reduction/archive/cageModelOfSize2PartialReducer';
import { MasterModelReduction } from '../../../../../src/solver/strategies/reduction/masterModelReduction';
import { CageModelReducerTestConfig } from './cageModelReducerTestConfig';

describe('CageModelOfSize2Reducers', () => {

    const cell1 = Cell.at(0, 0);
    const cell2 = Cell.at(0, 1);
    const cage = Cage.ofSum(11).withCell(cell1).withCell(cell2).new();

    let cellM1: CellModel;
    let cellM2: CellModel;
    let cageM: CageModel;
    let reduction: MasterModelReduction;

    beforeEach(() => {
        cellM1 = new CellModel(cell1);
        cellM2 = new CellModel(cell2);
        cageM = new CageModel(cage, [ cellM1, cellM2 ]);

        cellM1.addWithinCageModel(cageM);
        cellM2.addWithinCageModel(cageM);

        cageM.initialReduce();

        reduction = new MasterModelReduction();
    });

    const CONFIGS: ReadonlyArray<CageModelReducerTestConfig> = [
        {
            newReducer: (cageM: CageModel) => new CageModelOfSize2FullReducer(cageM),
            type: 'CageModelOfSize2FullReducer'
        },
        {
            newReducer: (cageM: CageModel) => new CageModelOfSize2PartialReducer(cageM),
            type: 'CageModelOfSize2PartialReducer'
        },
        {
            newReducer: (cageM: CageModel) => new CageModelOfSize2Reducer(cageM),
            type: 'CageModelOfSize2Reducer'
        }
    ];

    for (const { newReducer, type } of CONFIGS) {

        describe(type, () => {

            test('Case 0: Does not reduce if all number options for a particular `Combo` are deleted -- but deletes `Combo`', () => {
                // Given:
                reduction.deleteComboNumOpts(cellM1, Combo.of(5, 6));
                reduction.deleteComboNumOpts(cellM2, Combo.of(5, 6));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(cellM2.numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(2, 9),
                    Combo.of(3, 8),
                    Combo.of(4, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toEqual([ 5, 6 ]);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toEqual([ 5, 6 ]);
            });

            test('Case 1: Reduces after deleting all but the 1-st number option of a particular `Combo` in the 1-st `Cell`', () => {
                // Given:
                reduction.deleteNumOpt(cellM1, 6);
                reduction.deleteComboNumOpts(cellM2, Combo.of(5, 6));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(cellM2.numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(2, 9),
                    Combo.of(3, 8),
                    Combo.of(4, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toEqual([ 5, 6 ]);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toEqual([ 5, 6 ]);
            });

            test('Case 2: Reduces after deleting all but the 2-nd number option of a particular `Combo` in the 1-st `Cell`', () => {
                // Given:
                reduction.deleteNumOpt(cellM1, 5);
                reduction.deleteComboNumOpts(cellM2, Combo.of(5, 6));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(cellM2.numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(2, 9),
                    Combo.of(3, 8),
                    Combo.of(4, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toEqual([ 5, 6 ]);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toEqual([ 5, 6 ]);
            });

            test('Case 3: Reduces after deleting all number options of a particular `Combo` in the 2-nd `Cell`', () => {
                // Given:
                reduction.deleteComboNumOpts(cellM2, Combo.of(5, 6));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(cellM2.numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(2, 9),
                    Combo.of(3, 8),
                    Combo.of(4, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toEqual([ 5, 6 ]);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toEqual([ 5, 6 ]);
            });

            test('Case 4: Reduces after deleting all but the 1-st number option of a particular `Combo` in the 2-nd `Cell`', () => {
                // Given:
                reduction.deleteComboNumOpts(cellM1, Combo.of(5, 6));
                reduction.deleteNumOpt(cellM2, 6);

                // When:
                newReducer(cageM).reduce(reduction);

                expect(cellM1.numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(cellM2.numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(2, 9),
                    Combo.of(3, 8),
                    Combo.of(4, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toEqual([ 5, 6 ]);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toEqual([ 5, 6 ]);
            });

            test('Case 5: Reduces after deleting the 2-nd number option of a particular `Combo` in both `Cell`s', () => {
                // Given:
                reduction.deleteNumOpt(cellM1, 6);
                reduction.deleteNumOpt(cellM2, 6);

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(cellM2.numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(2, 9),
                    Combo.of(3, 8),
                    Combo.of(4, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toEqual([ 5, 6 ]);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toEqual([ 5, 6 ]);
            });

            test('Case 6: Does not reduce after deleting the 1-st number option of a particular `Combo` in the 1-st `Cell` and deleting the 2-nd number option in the 2-nd `Cell`', () => {
                // Given:
                reduction.deleteNumOpt(cellM1, 5);
                reduction.deleteNumOpt(cellM2, 6);

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 2, 3, 4, 6, 7, 8, 9 ]);
                expect(cellM2.numOpts()).toEqual([ 2, 3, 4, 5, 7, 8, 9 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(2, 9),
                    Combo.of(3, 8),
                    Combo.of(4, 7),
                    Combo.of(5, 6)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toEqual([ 5 ]);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toEqual([ 6 ]);
            });

            test('Case 7: Reduces after deleting the 2-nd number option of a particular `Combo` in the 2-nd `Cell`', () => {
                // Given:
                reduction.deleteNumOpt(cellM2, 6);

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 2, 3, 4, 6, 7, 8, 9 ]);
                expect(cellM2.numOpts()).toEqual([ 2, 3, 4, 5, 7, 8, 9 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(2, 9),
                    Combo.of(3, 8),
                    Combo.of(4, 7),
                    Combo.of(5, 6)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toEqual([ 5 ]);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toEqual([ 6 ]);
            });

            test('Case 8: Reduces after deleting all but the 2-nd number option of a particular `Combo` in the 2-nd `Cell`', () => {
                // Given:
                reduction.deleteComboNumOpts(cellM1, Combo.of(5, 6));
                reduction.deleteNumOpt(cellM2, 5);

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(cellM2.numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(2, 9),
                    Combo.of(3, 8),
                    Combo.of(4, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toEqual([ 5, 6 ]);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toEqual([ 5, 6 ]);
            });

            test('Case 9: Does not reduce after deleting the 2-nd number option of a particular `Combo` in the 1-st `Cell` and deleting the 1-st number option in the 2-nd `Cell`', () => {
                // Given:
                reduction.deleteNumOpt(cellM1, 6);
                reduction.deleteNumOpt(cellM2, 5);

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 2, 3, 4, 5, 7, 8, 9 ]);
                expect(cellM2.numOpts()).toEqual([ 2, 3, 4, 6, 7, 8, 9 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(2, 9),
                    Combo.of(3, 8),
                    Combo.of(4, 7),
                    Combo.of(5, 6)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toEqual([ 6 ]);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toEqual([ 5 ]);
            });

            test('Case 10: Reduces after deleting the 1-st number option of a particular `Combo` in both `Cell`s', () => {
                // Given:
                reduction.deleteNumOpt(cellM1, 5);
                reduction.deleteNumOpt(cellM2, 5);

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(cellM2.numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(2, 9),
                    Combo.of(3, 8),
                    Combo.of(4, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toEqual([ 5, 6 ]);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toEqual([ 5, 6 ]);
            });

            test('Case 11: Reduces after deleting the 1-st number option of a particular `Combo` in the 2-nd `Cell`', () => {
                // Given:
                reduction.deleteNumOpt(cellM2, 5);

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 2, 3, 4, 5, 7, 8, 9 ]);
                expect(cellM2.numOpts()).toEqual([ 2, 3, 4, 6, 7, 8, 9 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(2, 9),
                    Combo.of(3, 8),
                    Combo.of(4, 7),
                    Combo.of(5, 6)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toEqual([ 6 ]);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toEqual([ 5 ]);
            });

            test('Case 12: Reduces after deleting all number options of a particular `Combo` in the 1-st `Cell`', () => {
                // Given:
                reduction.deleteComboNumOpts(cellM1, Combo.of(5, 6));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(cellM2.numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(2, 9),
                    Combo.of(3, 8),
                    Combo.of(4, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toEqual([ 5, 6 ]);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toEqual([ 5, 6 ]);
            });

            test('Case 13: Reduces after deleting all but the 2-nd number option of a particular `Combo` in the 1-st `Cell`', () => {
                // Given:
                reduction.deleteNumOpt(cellM1, 5);
                reduction.deleteComboNumOpts(cellM2, Combo.of(5, 6));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(cellM2.numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(2, 9),
                    Combo.of(3, 8),
                    Combo.of(4, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toEqual([ 5, 6 ]);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toEqual([ 5, 6 ]);
            });

            test('Case 14: Reduces after deleting all but the 1-st number option of a particular `Combo` in the 1-st `Cell`', () => {
                // Given:
                reduction.deleteNumOpt(cellM1, 6);
                reduction.deleteComboNumOpts(cellM2, Combo.of(5, 6));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(cellM2.numOpts()).toEqual([ 2, 3, 4, 7, 8, 9 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(2, 9),
                    Combo.of(3, 8),
                    Combo.of(4, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toEqual([ 5, 6 ]);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toEqual([ 5, 6 ]);
            });

            test('Case 15: Does not reduce if there are no deletions for a particular `Combo`', () => {
                // Given:
                // ... initially reduced `CageModel` without extra deletions for its `CellModel`s.

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 2, 3, 4, 5, 6, 7, 8, 9 ]);
                expect(cellM2.numOpts()).toEqual([ 2, 3, 4, 5, 6, 7, 8, 9 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(2, 9),
                    Combo.of(3, 8),
                    Combo.of(4, 7),
                    Combo.of(5, 6)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toHaveLength(0);
            });

            test('Reduces after deleting number options from several `Combo`s', () => {
                // Given:
                reduction.deleteNumOpt(cellM1, 6);
                reduction.deleteComboNumOpts(cellM1, Combo.of(5, 6));
                reduction.deleteNumOpt(cellM1, 9);
                reduction.deleteComboNumOpts(cellM2, Combo.of(2, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 3, 4, 7, 8 ]);
                expect(cellM2.numOpts()).toEqual([ 3, 4, 7, 8 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(3, 8),
                    Combo.of(4, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toEqual([ 2, 5, 6, 9 ]);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toEqual([ 2, 5, 6, 9 ]);
            });

            test('Reflects impact on `MasterModelReduction` if reduction happened', () => {
                // Given:
                reduction.deleteNumOpt(cellM1, 5);

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
