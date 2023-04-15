import { Cage } from '../../../../../src/puzzle/cage';
import { Cell } from '../../../../../src/puzzle/cell';
import { Combo } from '../../../../../src/solver/math';
import { CageModel } from '../../../../../src/solver/models/elements/cageModel';
import { CellModel } from '../../../../../src/solver/models/elements/cellModel';
import { SudokuNumsSet } from '../../../../../src/solver/sets';
import { CageModel4FullReducer } from '../../../../../src/solver/strategies/reduction/archive/cageModel4FullReducer';
import { MasterModelReduction } from '../../../../../src/solver/strategies/reduction/masterModelReduction';
import { CageModelReducerTestConfig } from './cageModelReducerTestConfig';

describe('CageModel4Reducers', () => {

    const cell1 = Cell.at(0, 0);
    const cell2 = Cell.at(0, 1);
    const cell3 = Cell.at(0, 2);
    const cell4 = Cell.at(0, 3);

    let cellM1: CellModel;
    let cellM2: CellModel;
    let cellM3: CellModel;
    let cellM4: CellModel;
    let cageM: CageModel;
    let reduction: MasterModelReduction;

    const createCageM = (sum: number) => {
        const cage = Cage.ofSum(sum).withCell(cell1).withCell(cell2).withCell(cell3).withCell(cell4).new();

        cellM1 = new CellModel(cell1);
        cellM2 = new CellModel(cell2);
        cellM3 = new CellModel(cell3);
        cellM4 = new CellModel(cell4);
        cageM = new CageModel(cage, [ cellM1, cellM2, cellM3, cellM4 ]);

        cellM1.addWithinCageModel(cageM);
        cellM2.addWithinCageModel(cageM);
        cellM3.addWithinCageModel(cageM);
        cellM4.addWithinCageModel(cageM);

        cageM.initialReduce();

        reduction = new MasterModelReduction();

        return cageM;
    };

    const CONFIGS: ReadonlyArray<CageModelReducerTestConfig> = [
        {
            newReducer: (cageM: CageModel) => new CageModel4FullReducer(cageM),
            type: 'CageModel4FullReducer'
        }
    ];

    for (const { newReducer, type } of CONFIGS) {

        describe(type, () => {

            test('Reduces case from real production scenario #1', () => {
                // Given:
                createCageM(21);
                cellM2.reduceNumOpts(SudokuNumsSet.of(1, 2, 4, 5, 7));
                cellM3.reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 4, 5, 6, 7, 9));
                cellM4.reduceNumOpts(SudokuNumsSet.of(1, 2, 4, 5, 7));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 1, 3, 4, 6, 7, 8, 9 ]);
                expect(cellM2.numOpts()).toEqual([ 1, 2, 4, 5, 7 ]);
                expect(cellM3.numOpts()).toEqual([ 1, 2, 3, 4, 5, 6, 7, 9 ]);
                expect(cellM4.numOpts()).toEqual([ 1, 2, 4, 5, 7 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    // Deleted: Combo.of(1, 3, 8, 9),
                    Combo.of(1, 4, 7, 9),
                    Combo.of(1, 5, 6, 9),
                    Combo.of(1, 5, 7, 8),
                    Combo.of(2, 3, 7, 9),
                    Combo.of(2, 4, 6, 9),
                    Combo.of(2, 4, 7, 8),
                    Combo.of(2, 5, 6, 8),
                    Combo.of(3, 4, 5, 9),
                    // Deleted: Combo.of(3, 4, 6, 8),
                    Combo.of(3, 5, 6, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toEqual([ 2, 5 ]);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM3).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM4).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #2', () => {
                // Given:
                createCageM(21);
                cellM2.reduceNumOpts(SudokuNumsSet.of(1, 8, 9));
                cellM3.reduceNumOpts(SudokuNumsSet.of(1, 9));
                cellM4.reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 4, 5, 7, 8, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 1, 3, 4, 5, 6, 7, 8, 9 ]);
                expect(cellM2.numOpts()).toEqual([ 1, 8, 9 ]);
                expect(cellM3.numOpts()).toEqual([ 1, 9 ]);
                expect(cellM4.numOpts()).toEqual([ 1, 3, 4, 5, 7, 8, 9 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(1, 3, 8, 9),
                    Combo.of(1, 4, 7, 9),
                    Combo.of(1, 5, 6, 9),
                    Combo.of(1, 5, 7, 8),
                    // Deleted: Combo.of(2, 3, 7, 9),
                    // Deleted: Combo.of(2, 4, 6, 9),
                    // Deleted: Combo.of(2, 4, 7, 8),
                    // Deleted: Combo.of(2, 5, 6, 8),
                    // Deleted: Combo.of(3, 4, 5, 9),
                    // Deleted: Combo.of(3, 4, 6, 8),
                    // Deleted: Combo.of(3, 5, 6, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toEqual([ 2 ]);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM3).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM4).nums).toEqual([ 2 ]);
            });

            test('Reduces case from real production scenario #3', () => {
                // Given:
                createCageM(20);
                cellM1.reduceNumOpts(SudokuNumsSet.of(1, 3, 4, 5, 6, 7, 8, 9));
                cellM2.reduceNumOpts(SudokuNumsSet.of(1, 3, 4, 5, 7, 8, 9));
                cellM3.reduceNumOpts(SudokuNumsSet.of(6));
                cellM4.reduceNumOpts(SudokuNumsSet.of(2, 3));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 3, 4, 5, 7, 8, 9 ]);
                expect(cellM2.numOpts()).toEqual([ 3, 4, 5, 7, 8, 9 ]);
                expect(cellM3.numOpts()).toEqual([ 6 ]);
                expect(cellM4.numOpts()).toEqual([ 2, 3 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    // Deleted: Combo.of(1, 2, 8, 9),
                    // Deleted: Combo.of(1, 3, 7, 9),
                    // Deleted: Combo.of(1, 4, 6, 9),
                    // Deleted: Combo.of(1, 4, 7, 8),
                    // Deleted: Combo.of(1, 5, 6, 8),
                    Combo.of(2, 3, 6, 9),
                    // Deleted: Combo.of(2, 3, 7, 8),
                    // Deleted: Combo.of(2, 4, 5, 9),
                    Combo.of(2, 4, 6, 8),
                    Combo.of(2, 5, 6, 7),
                    // Deleted: Combo.of(3, 4, 5, 8),
                    Combo.of(3, 4, 6, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toEqual([ 1, 6 ]);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toEqual([ 1 ]);
                expect(reduction.deletedNumOptsOf(cellM3).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM4).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #4', () => {
                // Given:
                createCageM(18);
                cellM1.reduceNumOpts(SudokuNumsSet.of(2, 5));
                cellM2.reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 5, 9));
                cellM3.reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 5, 9));
                cellM4.reduceNumOpts(SudokuNumsSet.of(1, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 5 ]);
                expect(cellM2.numOpts()).toEqual([ 1, 3, 9 ]);
                expect(cellM3.numOpts()).toEqual([ 1, 3, 9 ]);
                expect(cellM4.numOpts()).toEqual([ 1, 9 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    // Deleted: Combo.of(1, 2, 7, 8),
                    Combo.of(1, 3, 5, 9),
                    // Deleted: Combo.of(1, 4, 5, 8),
                    // Deleted: Combo.of(2, 3, 4, 9),
                    // Deleted: Combo.of(2, 3, 5, 8),
                    // Deleted: Combo.of(2, 4, 5, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toEqual([ 2 ]);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toEqual([ 2, 5 ]);
                expect(reduction.deletedNumOptsOf(cellM3).nums).toEqual([ 2, 5 ]);
                expect(reduction.deletedNumOptsOf(cellM4).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #5', () => {
                // Given:
                createCageM(18);
                cellM1.reduceNumOpts(SudokuNumsSet.of(1, 5, 9));
                cellM2.reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 5, 6, 7, 9));
                cellM3.reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 5, 6, 7, 9));
                cellM4.reduceNumOpts(SudokuNumsSet.of(1, 3, 5, 7, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 1, 5, 9 ]);
                expect(cellM2.numOpts()).toEqual([ 1, 2, 3, 5, 6, 9 ]);
                expect(cellM3.numOpts()).toEqual([ 1, 2, 3, 5, 6, 9 ]);
                expect(cellM4.numOpts()).toEqual([ 1, 3, 5, 9 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(1, 2, 6, 9),
                    // Deleted: Combo.of(1, 2, 7, 8),
                    Combo.of(1, 3, 5, 9),
                    // Deleted: Combo.of(1, 3, 6, 8),
                    // Deleted: Combo.of(1, 4, 5, 8),
                    // Deleted: Combo.of(1, 4, 6, 7),
                    // Deleted: Combo.of(2, 3, 4, 9),
                    // Deleted: Combo.of(2, 3, 5, 8),
                    // Deleted: Combo.of(2, 3, 6, 7),
                    // Deleted: Combo.of(2, 4, 5, 7),
                    // Deleted: Combo.of(3, 4, 5, 6)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toEqual([ 7 ]);
                expect(reduction.deletedNumOptsOf(cellM3).nums).toEqual([ 7 ]);
                expect(reduction.deletedNumOptsOf(cellM4).nums).toEqual([ 7 ]);
            });

            test('Reduces case from real production scenario #6', () => {
                // Given:
                createCageM(22);
                cellM1.reduceNumOpts(SudokuNumsSet.of(5, 7, 9));
                cellM2.reduceNumOpts(SudokuNumsSet.of(1, 2, 7, 8, 9));
                cellM3.reduceNumOpts(SudokuNumsSet.of(2, 5, 6, 8));
                cellM4.reduceNumOpts(SudokuNumsSet.of(1, 2, 5));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 5, 7, 9 ]);
                expect(cellM2.numOpts()).toEqual([ 2, 7, 8, 9 ]);
                expect(cellM3.numOpts()).toEqual([ 2, 5, 6, 8 ]);
                expect(cellM4.numOpts()).toEqual([ 1, 2, 5 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    // Deleted: Combo.of(1, 4, 8, 9),
                    Combo.of(1, 5, 7, 9),
                    Combo.of(1, 6, 7, 8),
                    // Deleted: Combo.of(2, 3, 8, 9),
                    // Deleted: Combo.of(2, 4, 7, 9),
                    Combo.of(2, 5, 6, 9),
                    Combo.of(2, 5, 7, 8),
                    // Deleted: Combo.of(3, 4, 6, 9),
                    // Deleted: Combo.of(3, 4, 7, 8),
                    // Deleted: Combo.of(3, 5, 6, 8),
                    // Deleted: Combo.of(4, 5, 6, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toEqual([ 1 ]);
                expect(reduction.deletedNumOptsOf(cellM3).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM4).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #7', () => {
                // Given:
                createCageM(21);
                cellM1.reduceNumOpts(SudokuNumsSet.of(5, 7, 9));
                cellM2.reduceNumOpts(SudokuNumsSet.of(1, 8, 9));
                cellM3.reduceNumOpts(SudokuNumsSet.of(1, 9));
                cellM4.reduceNumOpts(SudokuNumsSet.of(5, 7, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 5, 7 ]);
                expect(cellM2.numOpts()).toEqual([ 8 ]);
                expect(cellM3.numOpts()).toEqual([ 1 ]);
                expect(cellM4.numOpts()).toEqual([ 5, 7 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    // Deleted: Combo.of(1, 3, 8, 9),
                    // Deleted: Combo.of(1, 4, 7, 9),
                    Combo.of(1, 5, 7, 8)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toEqual([ 9 ]);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toEqual([ 1, 9 ]);
                expect(reduction.deletedNumOptsOf(cellM3).nums).toEqual([ 9 ]);
                expect(reduction.deletedNumOptsOf(cellM4).nums).toEqual([ 9 ]);
            });

            test('Reduces case from real production scenario #8', () => {
                // Given:
                createCageM(22);
                cellM1.reduceNumOpts(SudokuNumsSet.of(2, 6));
                cellM2.reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 5, 7));
                cellM3.reduceNumOpts(SudokuNumsSet.of(1, 3, 4, 7, 8, 9));
                cellM4.reduceNumOpts(SudokuNumsSet.of(1, 2, 4, 5, 7));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 2, 6 ]);
                expect(cellM2.numOpts()).toEqual([ 1, 2, 3, 5, 7 ]);
                expect(cellM3.numOpts()).toEqual([ 4, 7, 8, 9 ]);
                expect(cellM4.numOpts()).toEqual([ 1, 2, 4, 5, 7 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    // Deleted: Combo.of(1, 4, 8, 9),
                    // Deleted: Combo.of(1, 5, 7, 9),
                    Combo.of(1, 6, 7, 8),
                    // Deleted: Combo.of(2, 3, 8, 9),
                    Combo.of(2, 4, 7, 9),
                    Combo.of(2, 5, 6, 9),
                    Combo.of(2, 5, 7, 8),
                    Combo.of(3, 4, 6, 9),
                    // Deleted: Combo.of(3, 4, 7, 8),
                    Combo.of(3, 5, 6, 8),
                    Combo.of(4, 5, 6, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM3).nums).toEqual([ 1, 3 ]);
                expect(reduction.deletedNumOptsOf(cellM4).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #9', () => {
                // Given:
                createCageM(23);
                cellM1.reduceNumOpts(SudokuNumsSet.of(2, 5, 6, 8));
                cellM2.reduceNumOpts(SudokuNumsSet.of(4, 7, 8, 9));
                cellM3.reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 4, 5, 6, 7, 9));
                cellM4.reduceNumOpts(SudokuNumsSet.of(3, 6, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 2, 5, 6, 8 ]);
                expect(cellM2.numOpts()).toEqual([ 4, 7, 8, 9 ]);
                expect(cellM3.numOpts()).toEqual([ 1, 2, 3, 4, 5, 6, 7 ]);
                expect(cellM4.numOpts()).toEqual([ 3, 6, 9 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(1, 5, 8, 9),
                    Combo.of(1, 6, 7, 9),
                    Combo.of(2, 4, 8, 9),
                    Combo.of(2, 5, 7, 9),
                    Combo.of(2, 6, 7, 8),
                    // Deleted: Combo.of(3, 4, 7, 9),
                    Combo.of(3, 5, 6, 9),
                    Combo.of(3, 5, 7, 8),
                    Combo.of(4, 5, 6, 8)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM3).nums).toEqual([ 9 ]);
                expect(reduction.deletedNumOptsOf(cellM4).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #10', () => {
                // Given:
                createCageM(21);
                cellM1.reduceNumOpts(SudokuNumsSet.of(4, 7, 8, 9));
                cellM2.reduceNumOpts(SudokuNumsSet.of(1, 2, 4, 5, 7));
                cellM3.reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 4, 5, 6, 7));
                cellM4.reduceNumOpts(SudokuNumsSet.of(1, 2, 4, 5, 7));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 8, 9 ]);
                expect(cellM2.numOpts()).toEqual([ 1, 2, 4, 5, 7 ]);
                expect(cellM3.numOpts()).toEqual([ 1, 2, 3, 4, 5, 6, 7 ]);
                expect(cellM4.numOpts()).toEqual([ 1, 2, 4, 5, 7 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(1, 4, 7, 9),
                    Combo.of(1, 5, 6, 9),
                    Combo.of(1, 5, 7, 8),
                    Combo.of(2, 3, 7, 9),
                    Combo.of(2, 4, 6, 9),
                    Combo.of(2, 4, 7, 8),
                    Combo.of(2, 5, 6, 8),
                    Combo.of(3, 4, 5, 9),
                    // Deleted: Combo.of(3, 5, 6, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toEqual([ 4, 7 ]);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM3).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM4).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #11', () => {
                // Given:
                createCageM(20);
                cellM1.reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 5, 6, 9));
                cellM2.reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 5, 6, 9));
                cellM3.reduceNumOpts(SudokuNumsSet.of(1, 3, 5, 9));
                cellM4.reduceNumOpts(SudokuNumsSet.of(3, 5, 7, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 1, 2, 3, 6, 9 ]);
                expect(cellM2.numOpts()).toEqual([ 1, 2, 3, 6, 9 ]);
                expect(cellM3.numOpts()).toEqual([ 1, 3, 5, 9 ]);
                expect(cellM4.numOpts()).toEqual([ 3, 7, 9 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    // Deleted: Combo.of(1, 2, 8, 9),
                    Combo.of(1, 3, 7, 9),
                    // Deleted: Combo.of(1, 4, 6, 9),
                    // Deleted: Combo.of(1, 4, 7, 8),
                    // Deleted: Combo.of(1, 5, 6, 8),
                    Combo.of(2, 3, 6, 9),
                    // Deleted: Combo.of(2, 3, 7, 8),
                    // Deleted: Combo.of(2, 4, 5, 9),
                    // Deleted: Combo.of(2, 4, 6, 8),
                    Combo.of(2, 5, 6, 7),
                    // Deleted: Combo.of(3, 4, 5, 8),
                    // Deleted: Combo.of(3, 4, 6, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toEqual([ 5 ]);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toEqual([ 5 ]);
                expect(reduction.deletedNumOptsOf(cellM3).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM4).nums).toEqual([ 5 ]);
            });

            test('Reduces case from real production scenario #12', () => {
                // Given:
                createCageM(18);
                cellM1.reduceNumOpts(SudokuNumsSet.of(5));
                cellM2.reduceNumOpts(SudokuNumsSet.of(1, 3, 9));
                cellM3.reduceNumOpts(SudokuNumsSet.of(1, 3, 9));
                cellM4.reduceNumOpts(SudokuNumsSet.of(9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 5 ]);
                expect(cellM2.numOpts()).toEqual([ 1, 3 ]);
                expect(cellM3.numOpts()).toEqual([ 1, 3 ]);
                expect(cellM4.numOpts()).toEqual([ 9 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(1, 3, 5, 9)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toEqual([ 9 ]);
                expect(reduction.deletedNumOptsOf(cellM3).nums).toEqual([ 9 ]);
                expect(reduction.deletedNumOptsOf(cellM4).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #13', () => {
                // Given:
                createCageM(21);
                cellM1.reduceNumOpts(SudokuNumsSet.of(1, 5, 9));
                cellM2.reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 5, 7));
                cellM3.reduceNumOpts(SudokuNumsSet.of(8, 9));
                cellM4.reduceNumOpts(SudokuNumsSet.of(1, 2, 4, 5, 7));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 1, 5, 9 ]);
                expect(cellM2.numOpts()).toEqual([ 1, 3, 5, 7 ]);
                expect(cellM3.numOpts()).toEqual([ 8, 9 ]);
                expect(cellM4.numOpts()).toEqual([ 1, 4, 5, 7 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(1, 3, 8, 9),
                    Combo.of(1, 4, 7, 9),
                    Combo.of(1, 5, 7, 8),
                    // Deleted: Combo.of(2, 3, 7, 9),
                    Combo.of(3, 4, 5, 9)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toEqual([ 2 ]);
                expect(reduction.deletedNumOptsOf(cellM3).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM4).nums).toEqual([ 2 ]);
            });

            test('Reduces case from real production scenario #14', () => {
                // Given:
                createCageM(23);
                cellM1.reduceNumOpts(SudokuNumsSet.of(2, 5, 6, 8));
                cellM2.reduceNumOpts(SudokuNumsSet.of(8, 9));
                cellM3.reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 4, 5, 6, 7));
                cellM4.reduceNumOpts(SudokuNumsSet.of(3, 6, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 2, 5, 6 ]);
                expect(cellM2.numOpts()).toEqual([ 8, 9 ]);
                expect(cellM3.numOpts()).toEqual([ 1, 3, 4, 5, 6, 7 ]);
                expect(cellM4.numOpts()).toEqual([ 3, 6, 9 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(1, 5, 8, 9),
                    // Deleted: Combo.of(1, 6, 7, 9),
                    Combo.of(2, 4, 8, 9),
                    // Deleted: Combo.of(2, 5, 7, 9),
                    Combo.of(2, 6, 7, 8),
                    Combo.of(3, 5, 6, 9),
                    Combo.of(3, 5, 7, 8),
                    Combo.of(4, 5, 6, 8)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toEqual([ 8 ]);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM3).nums).toEqual([ 2 ]);
                expect(reduction.deletedNumOptsOf(cellM4).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #15', () => {
                // Given:
                createCageM(18);
                cellM1.reduceNumOpts(SudokuNumsSet.of(1, 3, 5, 7));
                cellM2.reduceNumOpts(SudokuNumsSet.of(1, 3, 4, 5, 6, 7));
                cellM3.reduceNumOpts(SudokuNumsSet.of(1, 2, 4, 5, 7));
                cellM4.reduceNumOpts(SudokuNumsSet.of(3, 5, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 1, 3, 5, 7 ]);
                expect(cellM2.numOpts()).toEqual([ 1, 3, 4, 5, 6 ]);
                expect(cellM3.numOpts()).toEqual([ 1, 2, 4, 5 ]);
                expect(cellM4.numOpts()).toEqual([ 3, 5, 9 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(1, 2, 6, 9),
                    Combo.of(1, 3, 5, 9),
                    // Deleted: Combo.of(1, 4, 6, 7),
                    Combo.of(2, 3, 4, 9),
                    Combo.of(2, 3, 6, 7),
                    Combo.of(2, 4, 5, 7),
                    Combo.of(3, 4, 5, 6)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toEqual([ 7 ]);
                expect(reduction.deletedNumOptsOf(cellM3).nums).toEqual([ 7 ]);
                expect(reduction.deletedNumOptsOf(cellM4).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #16', () => {
                // Given:
                createCageM(22);
                cellM1.reduceNumOpts(SudokuNumsSet.of(5, 7));
                cellM2.reduceNumOpts(SudokuNumsSet.of(2, 7, 8, 9));
                cellM3.reduceNumOpts(SudokuNumsSet.of(2, 5, 6));
                cellM4.reduceNumOpts(SudokuNumsSet.of(1, 2, 5));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 5, 7 ]);
                expect(cellM2.numOpts()).toEqual([ 8, 9 ]);
                expect(cellM3.numOpts()).toEqual([ 2, 5, 6 ]);
                expect(cellM4.numOpts()).toEqual([ 1, 2, 5 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(1, 5, 7, 9),
                    Combo.of(1, 6, 7, 8),
                    Combo.of(2, 5, 6, 9),
                    Combo.of(2, 5, 7, 8)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toEqual([ 2, 7 ]);
                expect(reduction.deletedNumOptsOf(cellM3).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM4).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #17', () => {
                // Given:
                createCageM(21);
                cellM1.reduceNumOpts(SudokuNumsSet.of(8));
                cellM2.reduceNumOpts(SudokuNumsSet.of(1, 5, 7));
                cellM3.reduceNumOpts(SudokuNumsSet.of(1, 3, 4));
                cellM4.reduceNumOpts(SudokuNumsSet.of(1, 2));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 8 ]);
                expect(cellM2.numOpts()).toEqual([ 7 ]);
                expect(cellM3.numOpts()).toEqual([ 4 ]);
                expect(cellM4.numOpts()).toEqual([ 2 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    // Deleted: Combo.of(1, 4, 7, 9),
                    // Deleted: Combo.of(1, 5, 6, 9),
                    // Deleted: Combo.of(1, 5, 7, 8),
                    // Deleted: Combo.of(2, 3, 7, 9),
                    // Deleted: Combo.of(2, 4, 6, 9),
                    Combo.of(2, 4, 7, 8),
                    // Deleted: Combo.of(2, 5, 6, 8),
                    // Deleted: Combo.of(3, 4, 5, 9)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toEqual([ 1, 5 ]);
                expect(reduction.deletedNumOptsOf(cellM3).nums).toEqual([ 1, 3 ]);
                expect(reduction.deletedNumOptsOf(cellM4).nums).toEqual([ 1 ]);
            });

            test('Reduces case from real production scenario #18', () => {
                // Given:
                createCageM(21);
                cellM1.reduceNumOpts(SudokuNumsSet.of(1, 5));
                cellM2.reduceNumOpts(SudokuNumsSet.of(1, 5, 7));
                cellM3.reduceNumOpts(SudokuNumsSet.of(8));
                cellM4.reduceNumOpts(SudokuNumsSet.of(7));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 1, 5 ]);
                expect(cellM2.numOpts()).toEqual([ 1, 5 ]);
                expect(cellM3.numOpts()).toEqual([ 8 ]);
                expect(cellM4.numOpts()).toEqual([ 7 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    // Deleted: Combo.of(1, 3, 8, 9),
                    // Deleted: Combo.of(1, 4, 7, 9),
                    Combo.of(1, 5, 7, 8),
                    // Deleted: Combo.of(3, 4, 5, 9)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toEqual([ 7 ]);
                expect(reduction.deletedNumOptsOf(cellM3).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM4).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #19', () => {
                // Given:
                createCageM(18);
                cellM1.reduceNumOpts(SudokuNumsSet.of(3, 7));
                cellM2.reduceNumOpts(SudokuNumsSet.of(4));
                cellM3.reduceNumOpts(SudokuNumsSet.of(2));
                cellM4.reduceNumOpts(SudokuNumsSet.of(3, 5, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 3, 7 ]);
                expect(cellM2.numOpts()).toEqual([ 4 ]);
                expect(cellM3.numOpts()).toEqual([ 2 ]);
                expect(cellM4.numOpts()).toEqual([ 5, 9 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    // Deleted: Combo.of(1, 2, 6, 9),
                    // Deleted: Combo.of(1, 3, 5, 9),
                    Combo.of(2, 3, 4, 9),
                    // Deleted: Combo.of(2, 3, 6, 7),
                    Combo.of(2, 4, 5, 7),
                    // Deleted: Combo.of(3, 4, 5, 6)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM3).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM4).nums).toEqual([ 3 ]);
            });

            test('Reduces case from real production scenario #20', () => {
                // Given:
                createCageM(18);
                cellM1.reduceNumOpts(SudokuNumsSet.of(1, 5));
                cellM2.reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 9));
                cellM3.reduceNumOpts(SudokuNumsSet.of(1, 2, 9));
                cellM4.reduceNumOpts(SudokuNumsSet.of(1, 3, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 5 ]);
                expect(cellM2.numOpts()).toEqual([ 1, 3, 9 ]);
                expect(cellM3.numOpts()).toEqual([ 1, 9 ]);
                expect(cellM4.numOpts()).toEqual([ 1, 3, 9 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    // Deleted: Combo.of(1, 2, 6, 9),
                    Combo.of(1, 3, 5, 9)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toEqual([ 1 ]);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toEqual([ 2 ]);
                expect(reduction.deletedNumOptsOf(cellM3).nums).toEqual([ 2 ]);
                expect(reduction.deletedNumOptsOf(cellM4).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #21', () => {
                // Given:
                createCageM(20);
                cellM1.reduceNumOpts(SudokuNumsSet.of(1, 3, 9));
                cellM2.reduceNumOpts(SudokuNumsSet.of(1, 9));
                cellM3.reduceNumOpts(SudokuNumsSet.of(1, 3, 9));
                cellM4.reduceNumOpts(SudokuNumsSet.of(3, 7));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 1, 3, 9 ]);
                expect(cellM2.numOpts()).toEqual([ 1, 9 ]);
                expect(cellM3.numOpts()).toEqual([ 1, 3, 9 ]);
                expect(cellM4.numOpts()).toEqual([ 7 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(1, 3, 7, 9),
                    // Deleted: Combo.of(2, 3, 6, 9),
                    // Deleted: Combo.of(2, 5, 6, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM3).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM4).nums).toEqual([ 3 ]);
            });

            test('Reduces case from real production scenario #22', () => {
                // Given:
                createCageM(23);
                cellM1.reduceNumOpts(SudokuNumsSet.of(2, 5, 6));
                cellM2.reduceNumOpts(SudokuNumsSet.of(8));
                cellM3.reduceNumOpts(SudokuNumsSet.of(4));
                cellM4.reduceNumOpts(SudokuNumsSet.of(3, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 2 ]);
                expect(cellM2.numOpts()).toEqual([ 8 ]);
                expect(cellM3.numOpts()).toEqual([ 4 ]);
                expect(cellM4.numOpts()).toEqual([ 9 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    // Deleted: Combo.of(1, 5, 8, 9),
                    Combo.of(2, 4, 8, 9),
                    // Deleted: Combo.of(3, 5, 6, 9),
                    // Deleted: Combo.of(4, 5, 6, 8)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toEqual([ 5, 6 ]);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM3).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM4).nums).toEqual([ 3 ]);
            });

            test('Reduces case from real production scenario #23', () => {
                // Given:
                createCageM(19);
                cellM1.reduceNumOpts(SudokuNumsSet.of(1, 3));
                cellM2.reduceNumOpts(SudokuNumsSet.of(2, 7));
                cellM3.reduceNumOpts(SudokuNumsSet.of(1, 2, 6, 7));
                cellM4.reduceNumOpts(SudokuNumsSet.of(6, 7, 8));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 3 ]);
                expect(cellM2.numOpts()).toEqual([ 2, 7 ]);
                expect(cellM3.numOpts()).toEqual([ 1, 6 ]);
                expect(cellM4.numOpts()).toEqual([ 8 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    // Deleted: Combo.of(1, 2, 7, 9),
                    // Deleted: Combo.of(1, 3, 6, 9),
                    Combo.of(1, 3, 7, 8),
                    // Deleted: Combo.of(1, 4, 5, 9),
                    // Deleted: Combo.of(1, 4, 6, 8),
                    // Deleted: Combo.of(1, 5, 6, 7),
                    // Deleted: Combo.of(2, 3, 5, 9),
                    Combo.of(2, 3, 6, 8),
                    // Deleted: Combo.of(2, 4, 5, 8),
                    // Deleted: Combo.of(2, 4, 6, 7),
                    // Deleted: Combo.of(3, 4, 5, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toEqual([ 1 ]);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM3).nums).toEqual([ 2, 7 ]);
                expect(reduction.deletedNumOptsOf(cellM4).nums).toEqual([ 6, 7 ]);
            });

            test('Reduces case from real production scenario #24', () => {
                // Given:
                createCageM(21);
                cellM1.reduceNumOpts(SudokuNumsSet.of(5));
                cellM2.reduceNumOpts(SudokuNumsSet.of(1, 5));
                cellM3.reduceNumOpts(SudokuNumsSet.of(8));
                cellM4.reduceNumOpts(SudokuNumsSet.of(7));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 5 ]);
                expect(cellM2.numOpts()).toEqual([ 1 ]);
                expect(cellM3.numOpts()).toEqual([ 8 ]);
                expect(cellM4.numOpts()).toEqual([ 7 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(1, 5, 7, 8)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toEqual([ 5 ]);
                expect(reduction.deletedNumOptsOf(cellM3).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM4).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #25', () => {
                // Given:
                createCageM(21);
                cellM1.reduceNumOpts(SudokuNumsSet.of(2, 7));
                cellM2.reduceNumOpts(SudokuNumsSet.of(1, 9));
                cellM3.reduceNumOpts(SudokuNumsSet.of(1, 6));
                cellM4.reduceNumOpts(SudokuNumsSet.of(4));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 2, 7 ]);
                expect(cellM2.numOpts()).toEqual([ 9 ]);
                expect(cellM3.numOpts()).toEqual([ 1, 6 ]);
                expect(cellM4.numOpts()).toEqual([ 4 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    // Deleted: Combo.of(1, 3, 8, 9),
                    Combo.of(1, 4, 7, 9),
                    // Deleted: Combo.of(1, 5, 6, 9),
                    // Deleted: Combo.of(1, 5, 7, 8),
                    // Deleted: Combo.of(2, 3, 7, 9),
                    Combo.of(2, 4, 6, 9),
                    // Deleted: Combo.of(2, 4, 7, 8),
                    // Deleted: Combo.of(2, 5, 6, 8),
                    // Deleted: Combo.of(3, 4, 5, 9),
                    // Deleted: Combo.of(3, 4, 6, 8),
                    // Deleted: Combo.of(3, 5, 6, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toEqual([ 1 ]);
                expect(reduction.deletedNumOptsOf(cellM3).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM4).nums).toHaveLength(0);
            });

            test('Does not reduce if there are no deletions for a particular `Combo`', () => {
                // Given:
                // ... initially reduced `CageModel` without extra deletions for its `CellModel`s.
                createCageM(13);

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 1, 2, 3, 4, 5, 6, 7 ]);
                expect(cellM2.numOpts()).toEqual([ 1, 2, 3, 4, 5, 6, 7 ]);
                expect(cellM3.numOpts()).toEqual([ 1, 2, 3, 4, 5, 6, 7 ]);
                expect(cellM4.numOpts()).toEqual([ 1, 2, 3, 4, 5, 6, 7 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(1, 2, 3, 7),
                    Combo.of(1, 2, 4, 6),
                    Combo.of(1, 3, 4, 5)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM3).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM4).nums).toHaveLength(0);
            });

        });

    }

});
