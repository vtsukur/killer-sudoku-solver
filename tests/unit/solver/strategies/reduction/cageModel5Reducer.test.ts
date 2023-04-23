import { Cage } from '../../../../../src/puzzle/cage';
import { Cell } from '../../../../../src/puzzle/cell';
import { Combo } from '../../../../../src/solver/math';
import { CageModel } from '../../../../../src/solver/models/elements/cageModel';
import { CellModel } from '../../../../../src/solver/models/elements/cellModel';
import { SudokuNumsSet } from '../../../../../src/solver/sets';
import { CageModel5Reducer } from '../../../../../src/solver/strategies/reduction/cageModel5Reducer';
import { MasterModelReduction } from '../../../../../src/solver/strategies/reduction/masterModelReduction';
import { CageModelReducerTestConfig } from './cageModelReducerTestConfig';

describe('CageModel5Reducer', () => {

    const cell1 = Cell.at(0, 0);
    const cell2 = Cell.at(0, 1);
    const cell3 = Cell.at(0, 2);
    const cell4 = Cell.at(0, 3);
    const cell5 = Cell.at(0, 4);

    let cellM1: CellModel;
    let cellM2: CellModel;
    let cellM3: CellModel;
    let cellM4: CellModel;
    let cellM5: CellModel;
    let cageM: CageModel;
    let reduction: MasterModelReduction;

    const createCageM = (sum: number) => {
        const cage = Cage.ofSum(sum).withCell(cell1).withCell(cell2).withCell(cell3).withCell(cell4).withCell(cell5).new();

        cellM1 = new CellModel(cell1);
        cellM2 = new CellModel(cell2);
        cellM3 = new CellModel(cell3);
        cellM4 = new CellModel(cell4);
        cellM5 = new CellModel(cell5);
        cageM = new CageModel(cage, [ cellM1, cellM2, cellM3, cellM4, cellM5 ]);

        cellM1.addWithinCageModel(cageM);
        cellM2.addWithinCageModel(cageM);
        cellM3.addWithinCageModel(cageM);
        cellM4.addWithinCageModel(cageM);
        cellM5.addWithinCageModel(cageM);

        cageM.initialReduce();

        reduction = new MasterModelReduction();

        return cageM;
    };

    const CONFIGS: ReadonlyArray<CageModelReducerTestConfig> = [
        {
            newReducer: (cageM: CageModel) => new CageModel5Reducer(cageM),
            type: 'CageModel5Reducer'
        }
    ];

    for (const { newReducer, type } of CONFIGS) {

        describe(type, () => {

            test('Reduces case from real production scenario #1', () => {
                // Given:
                createCageM(22);
                cellM1.reduceNumOpts(SudokuNumsSet.of(3, 4, 5, 7, 8, 9));
                cellM2.reduceNumOpts(SudokuNumsSet.of(2, 3, 4, 5, 6, 7));
                cellM3.reduceNumOpts(SudokuNumsSet.of(4, 7));
                cellM4.reduceNumOpts(SudokuNumsSet.of(5, 8));
                cellM5.reduceNumOpts(SudokuNumsSet.of(1, 2));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 3, 4, 5, 7, 8, 9 ]);
                expect(cellM2.numOpts()).toEqual([ 2, 3, 5, 6 ]);
                expect(cellM3.numOpts()).toEqual([ 4, 7 ]);
                expect(cellM4.numOpts()).toEqual([ 5, 8 ]);
                expect(cellM5.numOpts()).toEqual([ 1, 2 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    // Deleted: Combo.of(1, 2, 3, 7, 9),
                    // Deleted: Combo.of(1, 2, 4, 6, 9),
                    Combo.of(1, 2, 4, 7, 8),
                    // Deleted: Combo.of(1, 2, 5, 6, 8),
                    Combo.of(1, 3, 4, 5, 9),
                    Combo.of(1, 3, 4, 6, 8),
                    Combo.of(1, 3, 5, 6, 7),
                    Combo.of(2, 3, 4, 5, 8),
                    // Deleted: Combo.of(2, 3, 4, 6, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toEqual([ 4, 7 ]);
                expect(reduction.deletedNumOptsOf(cellM3).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM4).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM5).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #2', () => {
                // Given:
                createCageM(24);
                cageM.comboSet.deleteCombo(Combo.of(1, 3, 4, 7, 9));
                cellM1.reduceNumOpts(SudokuNumsSet.of(4, 5, 7));
                cellM2.reduceNumOpts(SudokuNumsSet.of(4, 5, 7));
                cellM3.reduceNumOpts(SudokuNumsSet.of(2, 3));
                cellM4.reduceNumOpts(SudokuNumsSet.of(6, 7, 9));
                cellM5.reduceNumOpts(SudokuNumsSet.of(1, 3, 4));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 5, 7 ]);
                expect(cellM2.numOpts()).toEqual([ 5, 7 ]);
                expect(cellM3.numOpts()).toEqual([ 2 ]);
                expect(cellM4.numOpts()).toEqual([ 6, 9 ]);
                expect(cellM5.numOpts()).toEqual([ 1, 4 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(1, 2, 5, 7, 9),
                    // Deleted: Combo.of(1, 3, 5, 6, 9),
                    // Deleted: Combo.of(1, 3, 5, 7, 8),
                    // Deleted: Combo.of(1, 4, 5, 6, 8),
                    // Deleted: Combo.of(2, 3, 5, 6, 8),
                    Combo.of(2, 4, 5, 6, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toEqual([ 4 ]);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toEqual([ 4 ]);
                expect(reduction.deletedNumOptsOf(cellM3).nums).toEqual([ 3 ]);
                expect(reduction.deletedNumOptsOf(cellM4).nums).toEqual([ 7 ]);
                expect(reduction.deletedNumOptsOf(cellM5).nums).toEqual([ 3 ]);
            });

            // test('Reduces case from real production scenario #3', () => {
            //     // Given:
            //     createCageM(24);
            //     cellM3.reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 4, 5, 7, 8, 9));
            //     cellM4.reduceNumOpts(SudokuNumsSet.of(3, 5, 7, 8, 9));
            //     cellM5.reduceNumOpts(SudokuNumsSet.of(4));

            //     // When:
            //     newReducer(cageM).reduce(reduction);

            //     // Then:
            //     expect(cellM1.numOpts()).toEqual([ 1, 2, 3, 6, 7, 8, 9 ]);
            //     expect(cellM2.numOpts()).toEqual([ 1, 2, 3, 6, 7, 8, 9 ]);
            //     expect(cellM3.numOpts()).toEqual([ 1, 2, 3, 7, 8, 9 ]);
            //     expect(cellM4.numOpts()).toEqual([ 3, 7, 8, 9 ]);
            //     expect(cellM5.numOpts()).toEqual([ 4 ]);
            //     expect(Array.from(cageM.comboSet.combos)).toEqual([
            //         Combo.of(1, 2, 4, 8, 9),
            //         Combo.of(1, 3, 4, 7, 9),
            //         // Deleted: Combo.of(1, 3, 5, 7, 8),
            //         Combo.of(2, 3, 4, 6, 9),
            //         // Deleted: Combo.of(2, 3, 5, 6, 8)
            //     ]);
            //     expect(reduction.deletedNumOptsOf(cellM1).nums).toEqual([ 4, 5 ]);
            //     expect(reduction.deletedNumOptsOf(cellM2).nums).toEqual([ 4, 5 ]);
            //     expect(reduction.deletedNumOptsOf(cellM3).nums).toEqual([ 4, 5 ]);
            //     expect(reduction.deletedNumOptsOf(cellM4).nums).toEqual([ 5 ]);
            //     expect(reduction.deletedNumOptsOf(cellM5).nums).toHaveLength(0);
            // });

            // test('Reduces case from real production scenario #4', () => {
            //     // Given:
            //     createCageM(23);
            //     cellM1.reduceNumOpts(SudokuNumsSet.of(1, 3, 4));
            //     cellM2.reduceNumOpts(SudokuNumsSet.of(2, 3, 6, 7, 8));
            //     cellM3.reduceNumOpts(SudokuNumsSet.of(1, 4));
            //     cellM4.reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 5, 6, 7));
            //     cellM5.reduceNumOpts(SudokuNumsSet.of(4, 6, 7, 8, 9));

            //     // When:
            //     newReducer(cageM).reduce(reduction);

            //     // Then:
            //     expect(cellM1.numOpts()).toEqual([ 1, 3, 4 ]);
            //     expect(cellM2.numOpts()).toEqual([ 2, 3, 6, 7, 8 ]);
            //     expect(cellM3.numOpts()).toEqual([ 1, 4 ]);
            //     expect(cellM4.numOpts()).toEqual([ 1, 2, 3, 5, 6 ]);
            //     expect(cellM5.numOpts()).toEqual([ 6, 7, 8, 9 ]);
            //     expect(Array.from(cageM.comboSet.combos)).toEqual([
            //         Combo.of(1, 2, 3, 8, 9),
            //         // Deleted: Combo.of(1, 2, 5, 6, 9),
            //         // Deleted: Combo.of(1, 2, 5, 7, 8),
            //         Combo.of(1, 3, 4, 6, 9),
            //         Combo.of(1, 4, 5, 6, 7),
            //         Combo.of(2, 3, 4, 6, 8),
            //         // Deleted: Combo.of(2, 3, 5, 6, 7)
            //     ]);
            //     expect(reduction.deletedNumOptsOf(cellM1).nums).toHaveLength(0);
            //     expect(reduction.deletedNumOptsOf(cellM2).nums).toHaveLength(0);
            //     expect(reduction.deletedNumOptsOf(cellM3).nums).toHaveLength(0);
            //     expect(reduction.deletedNumOptsOf(cellM4).nums).toEqual([ 7 ]);
            //     expect(reduction.deletedNumOptsOf(cellM5).nums).toEqual([ 4 ]);
            // });

            test('Reduces case from real production scenario #5', () => {
                // Given:
                createCageM(20);
                cellM1.reduceNumOpts(SudokuNumsSet.of(2, 5));
                cellM2.reduceNumOpts(SudokuNumsSet.of(1, 3, 4));
                cellM3.reduceNumOpts(SudokuNumsSet.of(1, 3, 4));
                cellM4.reduceNumOpts(SudokuNumsSet.of(2));
                cellM5.reduceNumOpts(SudokuNumsSet.of(9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 5 ]);
                expect(cellM2.numOpts()).toEqual([ 1, 3 ]);
                expect(cellM3.numOpts()).toEqual([ 1, 3 ]);
                expect(cellM4.numOpts()).toEqual([ 2 ]);
                expect(cellM5.numOpts()).toEqual([ 9 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(1, 2, 3, 5, 9),
                    // Deleted: Combo.of(1, 2, 4, 5, 8)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toEqual([ 2 ]);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toEqual([ 4 ]);
                expect(reduction.deletedNumOptsOf(cellM3).nums).toEqual([ 4 ]);
                expect(reduction.deletedNumOptsOf(cellM4).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM5).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #6', () => {
                // Given:
                createCageM(25);
                cellM1.reduceNumOpts(SudokuNumsSet.of(1, 9));
                cellM2.reduceNumOpts(SudokuNumsSet.of(5));
                cellM3.reduceNumOpts(SudokuNumsSet.of(1, 3, 9));
                cellM4.reduceNumOpts(SudokuNumsSet.of(7));
                cellM5.reduceNumOpts(SudokuNumsSet.of(7, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 1 ]);
                expect(cellM2.numOpts()).toEqual([ 5 ]);
                expect(cellM3.numOpts()).toEqual([ 3 ]);
                expect(cellM4.numOpts()).toEqual([ 7 ]);
                expect(cellM5.numOpts()).toEqual([ 9 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    // Deleted: Combo.of(1, 2, 5, 8, 9),
                    // Deleted: Combo.of(1, 2, 6, 7, 9),
                    // Deleted: Combo.of(1, 3, 4, 8, 9),
                    Combo.of(1, 3, 5, 7, 9),
                    // Deleted: Combo.of(1, 3, 6, 7, 8),
                    // Deleted: Combo.of(1, 4, 5, 6, 9),
                    // Deleted: Combo.of(1, 4, 5, 7, 8),
                    // Deleted: Combo.of(2, 3, 4, 7, 9),
                    // Deleted: Combo.of(2, 3, 5, 6, 9),
                    // Deleted: Combo.of(2, 3, 5, 7, 8),
                    // Deleted: Combo.of(2, 4, 5, 6, 8),
                    // Deleted: Combo.of(3, 4, 5, 6, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toEqual([ 9 ]);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM3).nums).toEqual([ 1, 9 ]);
                expect(reduction.deletedNumOptsOf(cellM4).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM5).nums).toEqual([ 7 ]);
            });

            test('Reduces case from real production scenario #7', () => {
                // Given:
                createCageM(24);
                cellM1.reduceNumOpts(SudokuNumsSet.of(2, 7));
                cellM2.reduceNumOpts(SudokuNumsSet.of(3));
                cellM3.reduceNumOpts(SudokuNumsSet.of(1, 9));
                cellM4.reduceNumOpts(SudokuNumsSet.of(1, 6));
                cellM5.reduceNumOpts(SudokuNumsSet.of(4, 7));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 2, 7 ]);
                expect(cellM2.numOpts()).toEqual([ 3 ]);
                expect(cellM3.numOpts()).toEqual([ 9 ]);
                expect(cellM4.numOpts()).toEqual([ 1, 6 ]);
                expect(cellM5.numOpts()).toEqual([ 4 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    // Deleted: Combo.of(1, 2, 4, 8, 9),
                    // Deleted: Combo.of(1, 2, 5, 7, 9),
                    // Deleted: Combo.of(1, 2, 6, 7, 8),
                    Combo.of(1, 3, 4, 7, 9),
                    // Deleted: Combo.of(1, 3, 5, 6, 9),
                    // Deleted: Combo.of(1, 3, 5, 7, 8),
                    // Deleted: Combo.of(1, 4, 5, 6, 8),
                    Combo.of(2, 3, 4, 6, 9),
                    // Deleted: Combo.of(2, 3, 4, 7, 8),
                    // Deleted: Combo.of(2, 3, 5, 6, 8),
                    // Deleted: Combo.of(2, 4, 5, 6, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM3).nums).toEqual([ 1 ]);
                expect(reduction.deletedNumOptsOf(cellM4).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM5).nums).toEqual([ 7 ]);
            });

            test('Reduces case from real production scenario #8', () => {
                // Given:
                createCageM(20);
                cellM1.reduceNumOpts(SudokuNumsSet.of(2, 7));
                cellM2.reduceNumOpts(SudokuNumsSet.of(4));
                cellM3.reduceNumOpts(SudokuNumsSet.of(1));
                cellM4.reduceNumOpts(SudokuNumsSet.of(1, 6));
                cellM5.reduceNumOpts(SudokuNumsSet.of(7));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 2 ]);
                expect(cellM2.numOpts()).toEqual([ 4 ]);
                expect(cellM3.numOpts()).toEqual([ 1 ]);
                expect(cellM4.numOpts()).toEqual([ 6 ]);
                expect(cellM5.numOpts()).toEqual([ 7 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    // Deleted: Combo.of(1, 2, 3, 5, 9),
                    // Deleted: Combo.of(1, 2, 3, 6, 8),
                    // Deleted: Combo.of(1, 2, 4, 5, 8),
                    Combo.of(1, 2, 4, 6, 7),
                    // Deleted: Combo.of(1, 3, 4, 5, 7),
                    // Deleted: Combo.of(2, 3, 4, 5, 6)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toEqual([ 7 ]);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM3).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM4).nums).toEqual([ 1 ]);
                expect(reduction.deletedNumOptsOf(cellM5).nums).toHaveLength(0);
            });

        });

    }

});
