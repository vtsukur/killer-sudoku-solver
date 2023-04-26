import { Combo } from '../../../../../src/solver/math';
import { CageModel } from '../../../../../src/solver/models/elements/cageModel';
import { CellModel } from '../../../../../src/solver/models/elements/cellModel';
import { CombosSet, SudokuNumsSet } from '../../../../../src/solver/sets';
import { CageModel4FullReducer } from '../../../../../src/solver/strategies/reduction/archive/cageModel4FullReducer';
import { CageModel4Reducer } from '../../../../../src/solver/strategies/reduction/cageModel4Reducer';
import { MasterModelReduction } from '../../../../../src/solver/strategies/reduction/masterModelReduction';
import { createAndInitCageM } from '../../models/elements/cageModelBuilder';
import { CageModelReducerTestConfig } from './cageModelReducerTestConfig';

describe('CageModel4Reducers', () => {

    let cageM: CageModel;
    let cageMCombosSet: CombosSet;
    let cellMs: ReadonlyArray<CellModel>;
    let reduction: MasterModelReduction;

    const createAndInitCageMAndReduction = (sum: number) => {
        cageM = createAndInitCageM(4, sum);
        cageMCombosSet = cageM.comboSet;
        cellMs = cageM.cellMs;

        reduction = new MasterModelReduction();

        return cageM;
    };

    const CONFIGS: ReadonlyArray<CageModelReducerTestConfig> = [
        {
            newReducer: (cageM: CageModel) => new CageModel4FullReducer(cageM),
            type: 'CageModel4FullReducer'
        },
        {
            newReducer: (cageM: CageModel) => new CageModel4Reducer(cageM),
            type: 'CageModel4Reducer'
        }
    ];

    for (const { newReducer, type } of CONFIGS) {

        describe(type, () => {

            test('Reduces case from real production scenario #1', () => {
                // Given:
                createAndInitCageMAndReduction(21);
                cellMs[1].reduceNumOpts(SudokuNumsSet.of(1, 2, 4, 5, 7));
                cellMs[2].reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 4, 5, 6, 7, 9));
                cellMs[3].reduceNumOpts(SudokuNumsSet.of(1, 2, 4, 5, 7));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 1, 3, 4, 6, 7, 8, 9 ]);
                expect(cellMs[1].numOpts()).toEqual([ 1, 2, 4, 5, 7 ]);
                expect(cellMs[2].numOpts()).toEqual([ 1, 2, 3, 4, 5, 6, 7, 9 ]);
                expect(cellMs[3].numOpts()).toEqual([ 1, 2, 4, 5, 7 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
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
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toEqual([ 2, 5 ]);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[2]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[3]).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #2', () => {
                // Given:
                createAndInitCageMAndReduction(21);
                cellMs[1].reduceNumOpts(SudokuNumsSet.of(1, 8, 9));
                cellMs[2].reduceNumOpts(SudokuNumsSet.of(1, 9));
                cellMs[3].reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 4, 5, 7, 8, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 1, 3, 4, 5, 6, 7, 8, 9 ]);
                expect(cellMs[1].numOpts()).toEqual([ 1, 8, 9 ]);
                expect(cellMs[2].numOpts()).toEqual([ 1, 9 ]);
                expect(cellMs[3].numOpts()).toEqual([ 1, 3, 4, 5, 7, 8, 9 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
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
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toEqual([ 2 ]);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[2]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[3]).nums).toEqual([ 2 ]);
            });

            test('Reduces case from real production scenario #3', () => {
                // Given:
                createAndInitCageMAndReduction(20);
                cellMs[0].reduceNumOpts(SudokuNumsSet.of(1, 3, 4, 5, 6, 7, 8, 9));
                cellMs[1].reduceNumOpts(SudokuNumsSet.of(1, 3, 4, 5, 7, 8, 9));
                cellMs[2].reduceNumOpts(SudokuNumsSet.of(6));
                cellMs[3].reduceNumOpts(SudokuNumsSet.of(2, 3));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 3, 4, 5, 7, 8, 9 ]);
                expect(cellMs[1].numOpts()).toEqual([ 3, 4, 5, 7, 8, 9 ]);
                expect(cellMs[2].numOpts()).toEqual([ 6 ]);
                expect(cellMs[3].numOpts()).toEqual([ 2, 3 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
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
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toEqual([ 1, 6 ]);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toEqual([ 1 ]);
                expect(reduction.deletedNumOptsOf(cellMs[2]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[3]).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #4', () => {
                // Given:
                createAndInitCageMAndReduction(18);
                cellMs[0].reduceNumOpts(SudokuNumsSet.of(2, 5));
                cellMs[1].reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 5, 9));
                cellMs[2].reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 5, 9));
                cellMs[3].reduceNumOpts(SudokuNumsSet.of(1, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 5 ]);
                expect(cellMs[1].numOpts()).toEqual([ 1, 3, 9 ]);
                expect(cellMs[2].numOpts()).toEqual([ 1, 3, 9 ]);
                expect(cellMs[3].numOpts()).toEqual([ 1, 9 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
                    // Deleted: Combo.of(1, 2, 7, 8),
                    Combo.of(1, 3, 5, 9),
                    // Deleted: Combo.of(1, 4, 5, 8),
                    // Deleted: Combo.of(2, 3, 4, 9),
                    // Deleted: Combo.of(2, 3, 5, 8),
                    // Deleted: Combo.of(2, 4, 5, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toEqual([ 2 ]);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toEqual([ 2, 5 ]);
                expect(reduction.deletedNumOptsOf(cellMs[2]).nums).toEqual([ 2, 5 ]);
                expect(reduction.deletedNumOptsOf(cellMs[3]).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #5', () => {
                // Given:
                createAndInitCageMAndReduction(18);
                cellMs[0].reduceNumOpts(SudokuNumsSet.of(1, 5, 9));
                cellMs[1].reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 5, 6, 7, 9));
                cellMs[2].reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 5, 6, 7, 9));
                cellMs[3].reduceNumOpts(SudokuNumsSet.of(1, 3, 5, 7, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 1, 5, 9 ]);
                expect(cellMs[1].numOpts()).toEqual([ 1, 2, 3, 5, 6, 9 ]);
                expect(cellMs[2].numOpts()).toEqual([ 1, 2, 3, 5, 6, 9 ]);
                expect(cellMs[3].numOpts()).toEqual([ 1, 3, 5, 9 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
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
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toEqual([ 7 ]);
                expect(reduction.deletedNumOptsOf(cellMs[2]).nums).toEqual([ 7 ]);
                expect(reduction.deletedNumOptsOf(cellMs[3]).nums).toEqual([ 7 ]);
            });

            test('Reduces case from real production scenario #6', () => {
                // Given:
                createAndInitCageMAndReduction(22);
                cellMs[0].reduceNumOpts(SudokuNumsSet.of(5, 7, 9));
                cellMs[1].reduceNumOpts(SudokuNumsSet.of(1, 2, 7, 8, 9));
                cellMs[2].reduceNumOpts(SudokuNumsSet.of(2, 5, 6, 8));
                cellMs[3].reduceNumOpts(SudokuNumsSet.of(1, 2, 5));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 5, 7, 9 ]);
                expect(cellMs[1].numOpts()).toEqual([ 2, 7, 8, 9 ]);
                expect(cellMs[2].numOpts()).toEqual([ 2, 5, 6, 8 ]);
                expect(cellMs[3].numOpts()).toEqual([ 1, 2, 5 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
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
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toEqual([ 1 ]);
                expect(reduction.deletedNumOptsOf(cellMs[2]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[3]).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #7', () => {
                // Given:
                createAndInitCageMAndReduction(21);
                cellMs[0].reduceNumOpts(SudokuNumsSet.of(5, 7, 9));
                cellMs[1].reduceNumOpts(SudokuNumsSet.of(1, 8, 9));
                cellMs[2].reduceNumOpts(SudokuNumsSet.of(1, 9));
                cellMs[3].reduceNumOpts(SudokuNumsSet.of(5, 7, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 5, 7 ]);
                expect(cellMs[1].numOpts()).toEqual([ 8 ]);
                expect(cellMs[2].numOpts()).toEqual([ 1 ]);
                expect(cellMs[3].numOpts()).toEqual([ 5, 7 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
                    // Deleted: Combo.of(1, 3, 8, 9),
                    // Deleted: Combo.of(1, 4, 7, 9),
                    Combo.of(1, 5, 7, 8)
                ]);
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toEqual([ 9 ]);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toEqual([ 1, 9 ]);
                expect(reduction.deletedNumOptsOf(cellMs[2]).nums).toEqual([ 9 ]);
                expect(reduction.deletedNumOptsOf(cellMs[3]).nums).toEqual([ 9 ]);
            });

            test('Reduces case from real production scenario #8', () => {
                // Given:
                createAndInitCageMAndReduction(22);
                cellMs[0].reduceNumOpts(SudokuNumsSet.of(2, 6));
                cellMs[1].reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 5, 7));
                cellMs[2].reduceNumOpts(SudokuNumsSet.of(1, 3, 4, 7, 8, 9));
                cellMs[3].reduceNumOpts(SudokuNumsSet.of(1, 2, 4, 5, 7));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 2, 6 ]);
                expect(cellMs[1].numOpts()).toEqual([ 1, 2, 3, 5, 7 ]);
                expect(cellMs[2].numOpts()).toEqual([ 4, 7, 8, 9 ]);
                expect(cellMs[3].numOpts()).toEqual([ 1, 2, 4, 5, 7 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
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
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[2]).nums).toEqual([ 1, 3 ]);
                expect(reduction.deletedNumOptsOf(cellMs[3]).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #9', () => {
                // Given:
                createAndInitCageMAndReduction(23);
                cellMs[0].reduceNumOpts(SudokuNumsSet.of(2, 5, 6, 8));
                cellMs[1].reduceNumOpts(SudokuNumsSet.of(4, 7, 8, 9));
                cellMs[2].reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 4, 5, 6, 7, 9));
                cellMs[3].reduceNumOpts(SudokuNumsSet.of(3, 6, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 2, 5, 6, 8 ]);
                expect(cellMs[1].numOpts()).toEqual([ 4, 7, 8, 9 ]);
                expect(cellMs[2].numOpts()).toEqual([ 1, 2, 3, 4, 5, 6, 7 ]);
                expect(cellMs[3].numOpts()).toEqual([ 3, 6, 9 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
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
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[2]).nums).toEqual([ 9 ]);
                expect(reduction.deletedNumOptsOf(cellMs[3]).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #10', () => {
                // Given:
                createAndInitCageMAndReduction(21);
                cellMs[0].reduceNumOpts(SudokuNumsSet.of(4, 7, 8, 9));
                cellMs[1].reduceNumOpts(SudokuNumsSet.of(1, 2, 4, 5, 7));
                cellMs[2].reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 4, 5, 6, 7));
                cellMs[3].reduceNumOpts(SudokuNumsSet.of(1, 2, 4, 5, 7));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 8, 9 ]);
                expect(cellMs[1].numOpts()).toEqual([ 1, 2, 4, 5, 7 ]);
                expect(cellMs[2].numOpts()).toEqual([ 1, 2, 3, 4, 5, 6, 7 ]);
                expect(cellMs[3].numOpts()).toEqual([ 1, 2, 4, 5, 7 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
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
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toEqual([ 4, 7 ]);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[2]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[3]).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #11', () => {
                // Given:
                createAndInitCageMAndReduction(20);
                cellMs[0].reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 5, 6, 9));
                cellMs[1].reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 5, 6, 9));
                cellMs[2].reduceNumOpts(SudokuNumsSet.of(1, 3, 5, 9));
                cellMs[3].reduceNumOpts(SudokuNumsSet.of(3, 5, 7, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 1, 2, 3, 6, 9 ]);
                expect(cellMs[1].numOpts()).toEqual([ 1, 2, 3, 6, 9 ]);
                expect(cellMs[2].numOpts()).toEqual([ 1, 3, 5, 9 ]);
                expect(cellMs[3].numOpts()).toEqual([ 3, 7, 9 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
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
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toEqual([ 5 ]);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toEqual([ 5 ]);
                expect(reduction.deletedNumOptsOf(cellMs[2]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[3]).nums).toEqual([ 5 ]);
            });

            test('Reduces case from real production scenario #12', () => {
                // Given:
                createAndInitCageMAndReduction(18);
                cellMs[0].reduceNumOpts(SudokuNumsSet.of(5));
                cellMs[1].reduceNumOpts(SudokuNumsSet.of(1, 3, 9));
                cellMs[2].reduceNumOpts(SudokuNumsSet.of(1, 3, 9));
                cellMs[3].reduceNumOpts(SudokuNumsSet.of(9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 5 ]);
                expect(cellMs[1].numOpts()).toEqual([ 1, 3 ]);
                expect(cellMs[2].numOpts()).toEqual([ 1, 3 ]);
                expect(cellMs[3].numOpts()).toEqual([ 9 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
                    Combo.of(1, 3, 5, 9)
                ]);
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toEqual([ 9 ]);
                expect(reduction.deletedNumOptsOf(cellMs[2]).nums).toEqual([ 9 ]);
                expect(reduction.deletedNumOptsOf(cellMs[3]).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #13', () => {
                // Given:
                createAndInitCageMAndReduction(21);
                cellMs[0].reduceNumOpts(SudokuNumsSet.of(1, 5, 9));
                cellMs[1].reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 5, 7));
                cellMs[2].reduceNumOpts(SudokuNumsSet.of(8, 9));
                cellMs[3].reduceNumOpts(SudokuNumsSet.of(1, 2, 4, 5, 7));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 1, 5, 9 ]);
                expect(cellMs[1].numOpts()).toEqual([ 1, 3, 5, 7 ]);
                expect(cellMs[2].numOpts()).toEqual([ 8, 9 ]);
                expect(cellMs[3].numOpts()).toEqual([ 1, 4, 5, 7 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
                    Combo.of(1, 3, 8, 9),
                    Combo.of(1, 4, 7, 9),
                    Combo.of(1, 5, 7, 8),
                    // Deleted: Combo.of(2, 3, 7, 9),
                    Combo.of(3, 4, 5, 9)
                ]);
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toEqual([ 2 ]);
                expect(reduction.deletedNumOptsOf(cellMs[2]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[3]).nums).toEqual([ 2 ]);
            });

            test('Reduces case from real production scenario #14', () => {
                // Given:
                createAndInitCageMAndReduction(23);
                cellMs[0].reduceNumOpts(SudokuNumsSet.of(2, 5, 6, 8));
                cellMs[1].reduceNumOpts(SudokuNumsSet.of(8, 9));
                cellMs[2].reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 4, 5, 6, 7));
                cellMs[3].reduceNumOpts(SudokuNumsSet.of(3, 6, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 2, 5, 6 ]);
                expect(cellMs[1].numOpts()).toEqual([ 8, 9 ]);
                expect(cellMs[2].numOpts()).toEqual([ 1, 3, 4, 5, 6, 7 ]);
                expect(cellMs[3].numOpts()).toEqual([ 3, 6, 9 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
                    Combo.of(1, 5, 8, 9),
                    // Deleted: Combo.of(1, 6, 7, 9),
                    Combo.of(2, 4, 8, 9),
                    // Deleted: Combo.of(2, 5, 7, 9),
                    Combo.of(2, 6, 7, 8),
                    Combo.of(3, 5, 6, 9),
                    Combo.of(3, 5, 7, 8),
                    Combo.of(4, 5, 6, 8)
                ]);
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toEqual([ 8 ]);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[2]).nums).toEqual([ 2 ]);
                expect(reduction.deletedNumOptsOf(cellMs[3]).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #15', () => {
                // Given:
                createAndInitCageMAndReduction(18);
                cellMs[0].reduceNumOpts(SudokuNumsSet.of(1, 3, 5, 7));
                cellMs[1].reduceNumOpts(SudokuNumsSet.of(1, 3, 4, 5, 6, 7));
                cellMs[2].reduceNumOpts(SudokuNumsSet.of(1, 2, 4, 5, 7));
                cellMs[3].reduceNumOpts(SudokuNumsSet.of(3, 5, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 1, 3, 5, 7 ]);
                expect(cellMs[1].numOpts()).toEqual([ 1, 3, 4, 5, 6 ]);
                expect(cellMs[2].numOpts()).toEqual([ 1, 2, 4, 5 ]);
                expect(cellMs[3].numOpts()).toEqual([ 3, 5, 9 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
                    Combo.of(1, 2, 6, 9),
                    Combo.of(1, 3, 5, 9),
                    // Deleted: Combo.of(1, 4, 6, 7),
                    Combo.of(2, 3, 4, 9),
                    Combo.of(2, 3, 6, 7),
                    Combo.of(2, 4, 5, 7),
                    Combo.of(3, 4, 5, 6)
                ]);
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toEqual([ 7 ]);
                expect(reduction.deletedNumOptsOf(cellMs[2]).nums).toEqual([ 7 ]);
                expect(reduction.deletedNumOptsOf(cellMs[3]).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #16', () => {
                // Given:
                createAndInitCageMAndReduction(22);
                cellMs[0].reduceNumOpts(SudokuNumsSet.of(5, 7));
                cellMs[1].reduceNumOpts(SudokuNumsSet.of(2, 7, 8, 9));
                cellMs[2].reduceNumOpts(SudokuNumsSet.of(2, 5, 6));
                cellMs[3].reduceNumOpts(SudokuNumsSet.of(1, 2, 5));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 5, 7 ]);
                expect(cellMs[1].numOpts()).toEqual([ 8, 9 ]);
                expect(cellMs[2].numOpts()).toEqual([ 2, 5, 6 ]);
                expect(cellMs[3].numOpts()).toEqual([ 1, 2, 5 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
                    Combo.of(1, 5, 7, 9),
                    Combo.of(1, 6, 7, 8),
                    Combo.of(2, 5, 6, 9),
                    Combo.of(2, 5, 7, 8)
                ]);
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toEqual([ 2, 7 ]);
                expect(reduction.deletedNumOptsOf(cellMs[2]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[3]).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #17', () => {
                // Given:
                createAndInitCageMAndReduction(21);
                cellMs[0].reduceNumOpts(SudokuNumsSet.of(8));
                cellMs[1].reduceNumOpts(SudokuNumsSet.of(1, 5, 7));
                cellMs[2].reduceNumOpts(SudokuNumsSet.of(1, 3, 4));
                cellMs[3].reduceNumOpts(SudokuNumsSet.of(1, 2));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 8 ]);
                expect(cellMs[1].numOpts()).toEqual([ 7 ]);
                expect(cellMs[2].numOpts()).toEqual([ 4 ]);
                expect(cellMs[3].numOpts()).toEqual([ 2 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
                    // Deleted: Combo.of(1, 4, 7, 9),
                    // Deleted: Combo.of(1, 5, 6, 9),
                    // Deleted: Combo.of(1, 5, 7, 8),
                    // Deleted: Combo.of(2, 3, 7, 9),
                    // Deleted: Combo.of(2, 4, 6, 9),
                    Combo.of(2, 4, 7, 8),
                    // Deleted: Combo.of(2, 5, 6, 8),
                    // Deleted: Combo.of(3, 4, 5, 9)
                ]);
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toEqual([ 1, 5 ]);
                expect(reduction.deletedNumOptsOf(cellMs[2]).nums).toEqual([ 1, 3 ]);
                expect(reduction.deletedNumOptsOf(cellMs[3]).nums).toEqual([ 1 ]);
            });

            test('Reduces case from real production scenario #18', () => {
                // Given:
                createAndInitCageMAndReduction(21);
                cellMs[0].reduceNumOpts(SudokuNumsSet.of(1, 5));
                cellMs[1].reduceNumOpts(SudokuNumsSet.of(1, 5, 7));
                cellMs[2].reduceNumOpts(SudokuNumsSet.of(8));
                cellMs[3].reduceNumOpts(SudokuNumsSet.of(7));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 1, 5 ]);
                expect(cellMs[1].numOpts()).toEqual([ 1, 5 ]);
                expect(cellMs[2].numOpts()).toEqual([ 8 ]);
                expect(cellMs[3].numOpts()).toEqual([ 7 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
                    // Deleted: Combo.of(1, 3, 8, 9),
                    // Deleted: Combo.of(1, 4, 7, 9),
                    Combo.of(1, 5, 7, 8),
                    // Deleted: Combo.of(3, 4, 5, 9)
                ]);
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toEqual([ 7 ]);
                expect(reduction.deletedNumOptsOf(cellMs[2]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[3]).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #19', () => {
                // Given:
                createAndInitCageMAndReduction(18);
                cellMs[0].reduceNumOpts(SudokuNumsSet.of(3, 7));
                cellMs[1].reduceNumOpts(SudokuNumsSet.of(4));
                cellMs[2].reduceNumOpts(SudokuNumsSet.of(2));
                cellMs[3].reduceNumOpts(SudokuNumsSet.of(3, 5, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 3, 7 ]);
                expect(cellMs[1].numOpts()).toEqual([ 4 ]);
                expect(cellMs[2].numOpts()).toEqual([ 2 ]);
                expect(cellMs[3].numOpts()).toEqual([ 5, 9 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
                    // Deleted: Combo.of(1, 2, 6, 9),
                    // Deleted: Combo.of(1, 3, 5, 9),
                    Combo.of(2, 3, 4, 9),
                    // Deleted: Combo.of(2, 3, 6, 7),
                    Combo.of(2, 4, 5, 7),
                    // Deleted: Combo.of(3, 4, 5, 6)
                ]);
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[2]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[3]).nums).toEqual([ 3 ]);
            });

            test('Reduces case from real production scenario #20', () => {
                // Given:
                createAndInitCageMAndReduction(18);
                cellMs[0].reduceNumOpts(SudokuNumsSet.of(1, 5));
                cellMs[1].reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 9));
                cellMs[2].reduceNumOpts(SudokuNumsSet.of(1, 2, 9));
                cellMs[3].reduceNumOpts(SudokuNumsSet.of(1, 3, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 5 ]);
                expect(cellMs[1].numOpts()).toEqual([ 1, 3, 9 ]);
                expect(cellMs[2].numOpts()).toEqual([ 1, 9 ]);
                expect(cellMs[3].numOpts()).toEqual([ 1, 3, 9 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
                    // Deleted: Combo.of(1, 2, 6, 9),
                    Combo.of(1, 3, 5, 9)
                ]);
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toEqual([ 1 ]);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toEqual([ 2 ]);
                expect(reduction.deletedNumOptsOf(cellMs[2]).nums).toEqual([ 2 ]);
                expect(reduction.deletedNumOptsOf(cellMs[3]).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #21', () => {
                // Given:
                createAndInitCageMAndReduction(20);
                cellMs[0].reduceNumOpts(SudokuNumsSet.of(1, 3, 9));
                cellMs[1].reduceNumOpts(SudokuNumsSet.of(1, 9));
                cellMs[2].reduceNumOpts(SudokuNumsSet.of(1, 3, 9));
                cellMs[3].reduceNumOpts(SudokuNumsSet.of(3, 7));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 1, 3, 9 ]);
                expect(cellMs[1].numOpts()).toEqual([ 1, 9 ]);
                expect(cellMs[2].numOpts()).toEqual([ 1, 3, 9 ]);
                expect(cellMs[3].numOpts()).toEqual([ 7 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
                    Combo.of(1, 3, 7, 9),
                    // Deleted: Combo.of(2, 3, 6, 9),
                    // Deleted: Combo.of(2, 5, 6, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[2]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[3]).nums).toEqual([ 3 ]);
            });

            test('Reduces case from real production scenario #22', () => {
                // Given:
                createAndInitCageMAndReduction(23);
                cellMs[0].reduceNumOpts(SudokuNumsSet.of(2, 5, 6));
                cellMs[1].reduceNumOpts(SudokuNumsSet.of(8));
                cellMs[2].reduceNumOpts(SudokuNumsSet.of(4));
                cellMs[3].reduceNumOpts(SudokuNumsSet.of(3, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 2 ]);
                expect(cellMs[1].numOpts()).toEqual([ 8 ]);
                expect(cellMs[2].numOpts()).toEqual([ 4 ]);
                expect(cellMs[3].numOpts()).toEqual([ 9 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
                    // Deleted: Combo.of(1, 5, 8, 9),
                    Combo.of(2, 4, 8, 9),
                    // Deleted: Combo.of(3, 5, 6, 9),
                    // Deleted: Combo.of(4, 5, 6, 8)
                ]);
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toEqual([ 5, 6 ]);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[2]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[3]).nums).toEqual([ 3 ]);
            });

            test('Reduces case from real production scenario #23', () => {
                // Given:
                createAndInitCageMAndReduction(19);
                cellMs[0].reduceNumOpts(SudokuNumsSet.of(1, 3));
                cellMs[1].reduceNumOpts(SudokuNumsSet.of(2, 7));
                cellMs[2].reduceNumOpts(SudokuNumsSet.of(1, 2, 6, 7));
                cellMs[3].reduceNumOpts(SudokuNumsSet.of(6, 7, 8));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 3 ]);
                expect(cellMs[1].numOpts()).toEqual([ 2, 7 ]);
                expect(cellMs[2].numOpts()).toEqual([ 1, 6 ]);
                expect(cellMs[3].numOpts()).toEqual([ 8 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
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
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toEqual([ 1 ]);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[2]).nums).toEqual([ 2, 7 ]);
                expect(reduction.deletedNumOptsOf(cellMs[3]).nums).toEqual([ 6, 7 ]);
            });

            test('Reduces case from real production scenario #24', () => {
                // Given:
                createAndInitCageMAndReduction(21);
                cellMs[0].reduceNumOpts(SudokuNumsSet.of(5));
                cellMs[1].reduceNumOpts(SudokuNumsSet.of(1, 5));
                cellMs[2].reduceNumOpts(SudokuNumsSet.of(8));
                cellMs[3].reduceNumOpts(SudokuNumsSet.of(7));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 5 ]);
                expect(cellMs[1].numOpts()).toEqual([ 1 ]);
                expect(cellMs[2].numOpts()).toEqual([ 8 ]);
                expect(cellMs[3].numOpts()).toEqual([ 7 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
                    Combo.of(1, 5, 7, 8)
                ]);
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toEqual([ 5 ]);
                expect(reduction.deletedNumOptsOf(cellMs[2]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[3]).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #25', () => {
                // Given:
                createAndInitCageMAndReduction(21);
                cellMs[0].reduceNumOpts(SudokuNumsSet.of(2, 7));
                cellMs[1].reduceNumOpts(SudokuNumsSet.of(1, 9));
                cellMs[2].reduceNumOpts(SudokuNumsSet.of(1, 6));
                cellMs[3].reduceNumOpts(SudokuNumsSet.of(4));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 2, 7 ]);
                expect(cellMs[1].numOpts()).toEqual([ 9 ]);
                expect(cellMs[2].numOpts()).toEqual([ 1, 6 ]);
                expect(cellMs[3].numOpts()).toEqual([ 4 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
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
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toEqual([ 1 ]);
                expect(reduction.deletedNumOptsOf(cellMs[2]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[3]).nums).toHaveLength(0);
            });

            test('Does not reduce if there are no deletions for a particular `Combo`', () => {
                // Given:
                // ... initially reduced `CageModel` without extra deletions for its `CellModel`s.
                createAndInitCageMAndReduction(13);

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellMs[0].numOpts()).toEqual([ 1, 2, 3, 4, 5, 6, 7 ]);
                expect(cellMs[1].numOpts()).toEqual([ 1, 2, 3, 4, 5, 6, 7 ]);
                expect(cellMs[2].numOpts()).toEqual([ 1, 2, 3, 4, 5, 6, 7 ]);
                expect(cellMs[3].numOpts()).toEqual([ 1, 2, 3, 4, 5, 6, 7 ]);
                expect(Array.from(cageMCombosSet.combos)).toEqual([
                    Combo.of(1, 2, 3, 7),
                    Combo.of(1, 2, 4, 6),
                    Combo.of(1, 3, 4, 5)
                ]);
                expect(reduction.deletedNumOptsOf(cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[1]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[2]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellMs[3]).nums).toHaveLength(0);
            });

        });

    }

});
