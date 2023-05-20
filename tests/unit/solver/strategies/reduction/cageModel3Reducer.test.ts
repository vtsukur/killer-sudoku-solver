import { Combo } from '../../../../../src/solver/math';
import { CageModel } from '../../../../../src/solver/models/elements/cageModel';
import { CellModel } from '../../../../../src/solver/models/elements/cellModel';
import { CombosSet, SudokuNumsSet } from '../../../../../src/solver/sets';
import { CageModel3FullReducer } from '../../../../../src/solver/strategies/reduction/archive/cageModel3FullReducer';
import { CageModel3Reducer } from '../../../../../src/solver/strategies/reduction/cageModel3Reducer';
import { MasterModelReduction } from '../../../../../src/solver/strategies/reduction/masterModelReduction';
import { createAndInitCageM } from '../../models/elements/cageModelBuilder';
import { CageModelReducerTestConfig } from './cageModelReducerTestConfig';

describe('`CageModel3Reducer`s', () => {

    let cageM: CageModel;
    let cageMCombosSet: CombosSet;
    let cellMs: ReadonlyArray<CellModel>;
    let reduction: MasterModelReduction;

    const createAndInitCageMAndReduction = (sum: number) => {
        cageM = createAndInitCageM(3, sum);
        cageMCombosSet = cageM.combosSet;
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
                createAndInitCageMAndReduction(19);
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(2, 3, 4, 5, 8, 9));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(5, 6, 8, 9));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(2, 3, 4, 5, 6, 7, 8, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cageM.cellMs[0].numOpts()).toEqual([ 2, 3, 4, 5, 8, 9 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 5, 6, 8, 9 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 2, 4, 5, 6, 7, 8, 9 ]);
                expect(Array.from(cageM.combosSet.combos)).toEqual([
                    Combo.of(2, 8, 9),
                    Combo.of(3, 7, 9),
                    Combo.of(4, 6, 9),
                    Combo.of(4, 7, 8),
                    Combo.of(5, 6, 8)
                ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toEqual([ 3 ]);
            });

            test('Reduces case from real production scenario #2', () => {
                // Given:
                createAndInitCageMAndReduction(17);
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 4, 5, 8, 9));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(5, 6, 8, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cageM.cellMs[0].numOpts()).toEqual([ 1, 2, 3, 4, 5, 8, 9 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 5, 6, 8, 9 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 2, 3, 4, 5, 6, 7, 8, 9 ]);
                expect(Array.from(cageM.combosSet.combos)).toEqual([
                    Combo.of(1, 7, 9),
                    Combo.of(2, 6, 9),
                    Combo.of(2, 7, 8),
                    Combo.of(3, 5, 9),
                    Combo.of(3, 6, 8),
                    Combo.of(4, 5, 8),
                    Combo.of(4, 6, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toEqual([ 1 ]);
            });

            test('Reduces case from real production scenario #3', () => {
                // Given:
                createAndInitCageMAndReduction(15);
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(1, 2));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(3, 4, 5, 6, 8, 9));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(3, 4, 5, 6, 8, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cageM.cellMs[0].numOpts()).toEqual([ 1, 2 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 4, 5, 6, 8, 9 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 4, 5, 6, 8, 9 ]);
                expect(Array.from(cageM.combosSet.combos)).toEqual([
                    Combo.of(1, 5, 9),
                    Combo.of(1, 6, 8),
                    Combo.of(2, 4, 9),
                    Combo.of(2, 5, 8),
                    // Deleted: Combo.of(3, 4, 8)
                ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toEqual([ 3 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toEqual([ 3 ]);
            });

            test('Reduces case from real production scenario #4', () => {
                // Given:
                createAndInitCageMAndReduction(18);
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 4, 5, 8, 9));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 4, 7, 8, 9));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 4, 5, 8, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cageM.cellMs[0].numOpts()).toEqual([ 1, 2, 3, 4, 5, 8, 9 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 1, 4, 7, 8, 9 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 1, 2, 3, 4, 5, 8, 9 ]);
                expect(Array.from(cageM.combosSet.combos)).toEqual([
                    Combo.of(1, 8, 9),
                    Combo.of(2, 7, 9),
                    // Deleted: Combo.of(3, 6, 9),
                    Combo.of(3, 7, 8),
                    Combo.of(4, 5, 9),
                    // Deleted: Combo.of(4, 6, 8),
                    // Deleted: Combo.of(5, 6, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toEqual([ 2, 3 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #5', () => {
                // Given:
                createAndInitCageMAndReduction(12);
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 4, 5, 8, 9));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 4, 8, 9));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 4, 8, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cageM.cellMs[0].numOpts()).toEqual([ 1, 2, 3, 5, 8, 9 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 1, 2, 3, 4, 8, 9 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 1, 2, 3, 4, 8, 9 ]);
                expect(Array.from(cageM.combosSet.combos)).toEqual([
                    Combo.of(1, 2, 9),
                    Combo.of(1, 3, 8),
                    Combo.of(3, 4, 5)
                ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toEqual([ 4 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #6', () => {
                // Given:
                createAndInitCageMAndReduction(16);
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 4, 5, 8, 9));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 4, 5, 8, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cageM.cellMs[0].numOpts()).toEqual([ 1, 2, 3, 4, 5, 8, 9 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 1, 2, 3, 4, 5, 8, 9 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 2, 3, 4, 5, 6, 7, 8, 9 ]);
                expect(Array.from(cageM.combosSet.combos)).toEqual([
                    Combo.of(1, 6, 9),
                    Combo.of(1, 7, 8),
                    Combo.of(2, 5, 9),
                    Combo.of(2, 6, 8),
                    Combo.of(3, 4, 9),
                    Combo.of(3, 5, 8),
                    // Deleted: Combo.of(3, 6, 7),
                    Combo.of(4, 5, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toEqual([ 1 ]);
            });

            test('Reduces case from real production scenario #7', () => {
                // Given:
                createAndInitCageMAndReduction(16);
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(1, 4, 5));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(2, 3, 8));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(3, 4, 5, 8, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cageM.cellMs[0].numOpts()).toEqual([ 4, 5 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 2, 3, 8 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 3, 8, 9 ]);
                expect(Array.from(cageM.combosSet.combos)).toEqual([
                    // Deleted: Combo.of(1, 6, 9),
                    Combo.of(2, 5, 9),
                    // Deleted: Combo.of(2, 6, 8),
                    Combo.of(3, 4, 9),
                    Combo.of(3, 5, 8)
                ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toEqual([ 1 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toEqual([ 4, 5 ]);
            });

            test('Reduces case from real production scenario #8', () => {
                // Given:
                createAndInitCageMAndReduction(16);
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(4, 5));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(3, 8, 9));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(3, 4, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cageM.cellMs[0].numOpts()).toEqual([ 4, 5 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 3, 8, 9 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 3, 9 ]);
                expect(Array.from(cageM.combosSet.combos)).toEqual([
                    Combo.of(3, 4, 9),
                    Combo.of(3, 5, 8),
                    // Deleted: Combo.of(4, 5, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toEqual([ 4 ]);
            });

            test('Reduces case from real production scenario #9', () => {
                // Given:
                createAndInitCageMAndReduction(20);
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(4, 7, 8, 9));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(4, 7, 8, 9));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(4, 7, 8, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cageM.cellMs[0].numOpts()).toEqual([ 4, 7, 9 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 4, 7, 9 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 4, 7, 9 ]);
                expect(Array.from(cageM.combosSet.combos)).toEqual([
                    Combo.of(4, 7, 9),
                    // Deleted: Combo.of(5, 7, 8)
                ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toEqual([ 8 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toEqual([ 8 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toEqual([ 8 ]);
            });

            test('Reduces case from real production scenario #10', () => {
                // Given:
                createAndInitCageMAndReduction(11);
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 4, 5, 6, 7, 8));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(1, 2, 4, 5, 7));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(1, 2, 4, 5, 7));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cageM.cellMs[0].numOpts()).toEqual([ 2, 3, 4, 5, 6, 8 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 1, 2, 4, 5, 7 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 1, 2, 4, 5, 7 ]);
                expect(Array.from(cageM.combosSet.combos)).toEqual([
                    Combo.of(1, 2, 8),
                    Combo.of(1, 3, 7),
                    Combo.of(1, 4, 6),
                    // Deleted: Combo.of(2, 3, 6),
                    Combo.of(2, 4, 5)
                ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toEqual([ 1, 7 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #11', () => {
                // Given:
                createAndInitCageMAndReduction(13);
                cageMCombosSet.clear();
                cageMCombosSet.addCombo(Combo.of(1, 3, 9));
                cageMCombosSet.addCombo(Combo.of(1, 4, 8));
                cageMCombosSet.addCombo(Combo.of(2, 4, 7));
                cageMCombosSet.addCombo(Combo.of(3, 4, 6));
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(3, 6));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(1, 7, 8, 9));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 8, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cageM.cellMs[0].numOpts()).toEqual([ 3 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 1, 9 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 1, 9 ]);
                expect(Array.from(cageM.combosSet.combos)).toEqual([
                    Combo.of(1, 3, 9),
                    // Deleted: Combo.of(1, 4, 8),
                    // Deleted: Combo.of(2, 4, 7),
                    // Deleted: Combo.of(3, 4, 6)
                ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toEqual([ 6 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toEqual([ 7, 8 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toEqual([ 2, 3, 8 ]);
            });

            test('Reduces case from real production scenario #12', () => {
                // Given:
                createAndInitCageMAndReduction(18);
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 4, 8, 9));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(1, 9));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 4, 8, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cageM.cellMs[0].numOpts()).toEqual([ 1, 8, 9 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 1, 9 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 1, 8, 9 ]);
                expect(Array.from(cageM.combosSet.combos)).toEqual([
                    Combo.of(1, 8, 9),
                    // Deleted: Combo.of(2, 7, 9),
                    // Deleted: Combo.of(3, 7, 8),
                    // Deleted: Combo.of(4, 5, 9)
                ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toEqual([ 2, 3, 4 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toEqual([ 2, 3, 4 ]);
            });

            test('Reduces case from real production scenario #13', () => {
                // Given:
                createAndInitCageMAndReduction(17);
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(1, 8, 9));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(6, 8));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(2, 3, 4, 5, 6, 7, 8, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cageM.cellMs[0].numOpts()).toEqual([ 8, 9 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 6 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 2, 3 ]);
                expect(Array.from(cageM.combosSet.combos)).toEqual([
                    // Deleted: Combo.of(1, 7, 9),
                    Combo.of(2, 6, 9),
                    // Deleted: Combo.of(2, 7, 8),
                    // Deleted: Combo.of(3, 5, 9),
                    Combo.of(3, 6, 8),
                    // Deleted: Combo.of(4, 5, 8),
                    // Deleted: Combo.of(4, 6, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toEqual([ 1 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toEqual([ 8 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toEqual([ 4, 5, 6, 7, 8, 9 ]);
            });

            test('Reduces case from real production scenario #14', () => {
                // Given:
                createAndInitCageMAndReduction(18);
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(8));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(2, 4, 6, 7, 8, 9));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 4, 6, 7, 8, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cageM.cellMs[0].numOpts()).toEqual([ 8 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 4, 6, 7, 9 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 1, 3, 4, 6 ]);
                expect(Array.from(cageM.combosSet.combos)).toEqual([
                    Combo.of(1, 8, 9),
                    // Deleted: Combo.of(2, 7, 9),
                    // Deleted: Combo.of(3, 6, 9),
                    Combo.of(3, 7, 8),
                    // Deleted: Combo.of(4, 5, 9),
                    Combo.of(4, 6, 8),
                    // Deleted: Combo.of(5, 6, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toEqual([ 2, 8 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toEqual([ 2, 7, 8, 9 ]);
            });

            test('Reduces case from real production scenario #15', () => {
                // Given:
                createAndInitCageMAndReduction(19);
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(2, 3, 4, 5, 8, 9));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(8));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(4, 6, 7, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cageM.cellMs[0].numOpts()).toEqual([ 2, 4, 5 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 8 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 6, 7, 9 ]);
                expect(Array.from(cageM.combosSet.combos)).toEqual([
                    Combo.of(2, 8, 9),
                    // Deleted: Combo.of(3, 7, 9),
                    // Deleted: Combo.of(4, 6, 9),
                    Combo.of(4, 7, 8),
                    Combo.of(5, 6, 8)
                ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toEqual([ 3, 8, 9 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toEqual([ 4 ]);
            });

            test('Reduces case from real production scenario #16', () => {
                // Given:
                createAndInitCageMAndReduction(16);
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(4));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(2, 3));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(3, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cageM.cellMs[0].numOpts()).toEqual([ 4 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 3 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 9 ]);
                expect(Array.from(cageM.combosSet.combos)).toEqual([
                    // Deleted: Combo.of(2, 5, 9),
                    Combo.of(3, 4, 9),
                    // Deleted: Combo.of(3, 5, 8)
                ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toEqual([ 2 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toEqual([ 3 ]);
            });

            test('Reduces case from real production scenario #17', () => {
                // Given:
                createAndInitCageMAndReduction(12);
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 8, 9));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(1, 9));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(1, 3, 8, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cageM.cellMs[0].numOpts()).toEqual([ 2, 3, 8 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 1, 9 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 1, 3, 8, 9 ]);
                expect(Array.from(cageM.combosSet.combos)).toEqual([
                    Combo.of(1, 2, 9),
                    Combo.of(1, 3, 8)
                ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toEqual([ 1, 9 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #18', () => {
                // Given:
                createAndInitCageMAndReduction(18);
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(8));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(6, 7, 9));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(1, 3, 4, 6));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cageM.cellMs[0].numOpts()).toEqual([ 8 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 6, 7, 9 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 1, 3, 4 ]);
                expect(Array.from(cageM.combosSet.combos)).toEqual([
                    Combo.of(1, 8, 9),
                    Combo.of(3, 7, 8),
                    Combo.of(4, 6, 8)
                ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toEqual([ 6 ]);
            });

            test('Reduces case from real production scenario #19', () => {
                // Given:
                createAndInitCageMAndReduction(17);
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(8, 9));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(6));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(2));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cageM.cellMs[0].numOpts()).toEqual([ 9 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 6 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 2 ]);
                expect(Array.from(cageM.combosSet.combos)).toEqual([
                    Combo.of(2, 6, 9),
                    // Deleted: Combo.of(3, 6, 8)
                ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toEqual([ 8 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #20', () => {
                // Given:
                createAndInitCageMAndReduction(19);
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(2, 4, 5));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(8));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(6, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cageM.cellMs[0].numOpts()).toEqual([ 2, 5 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 8 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 6, 9 ]);
                expect(Array.from(cageM.combosSet.combos)).toEqual([
                    Combo.of(2, 8, 9),
                    // Deleted: Combo.of(4, 7, 8),
                    Combo.of(5, 6, 8)
                ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toEqual([ 4 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #21', () => {
                // Given:
                createAndInitCageMAndReduction(18);
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(1, 8, 9));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(1, 9));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cageM.cellMs[0].numOpts()).toEqual([ 8 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 1 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 9 ]);
                expect(Array.from(cageM.combosSet.combos)).toEqual([
                    Combo.of(1, 8, 9)
                ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toEqual([ 1, 9 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toEqual([ 9 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #22', () => {
                // Given:
                createAndInitCageMAndReduction(13);
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(3));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(1));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(1, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cageM.cellMs[0].numOpts()).toEqual([ 3 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 1 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 9 ]);
                expect(Array.from(cageM.combosSet.combos)).toEqual([
                    Combo.of(1, 3, 9)
                ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toEqual([ 1 ]);
            });

            test('Reduces case from real production scenario #23', () => {
                // Given:
                createAndInitCageMAndReduction(12);
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(2, 3, 8));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(9));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(1, 3, 8, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cageM.cellMs[0].numOpts()).toEqual([ 2 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 9 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 1 ]);
                expect(Array.from(cageM.combosSet.combos)).toEqual([
                    Combo.of(1, 2, 9),
                    // Deleted: Combo.of(1, 3, 8)
                ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toEqual([ 3, 8 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toEqual([ 3, 8, 9 ]);
            });

            test('Reduces case from real production scenario #24', () => {
                // Given:
                createAndInitCageMAndReduction(19);
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(5));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(8));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(6, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cageM.cellMs[0].numOpts()).toEqual([ 5 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 8 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 6 ]);
                expect(Array.from(cageM.combosSet.combos)).toEqual([
                    // Deleted: Combo.of(2, 8, 9),
                    Combo.of(5, 6, 8)
                ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toEqual([ 9 ]);
            });

            test('Reduces case from real production scenario #25', () => {
                // Given:
                createAndInitCageMAndReduction(18);
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(8));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(6));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(1, 4));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cageM.cellMs[0].numOpts()).toEqual([ 8 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 6 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 4 ]);
                expect(Array.from(cageM.combosSet.combos)).toEqual([
                    // Deleted: Combo.of(1, 8, 9),
                    Combo.of(4, 6, 8)
                ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toEqual([ 1 ]);
            });

            test('Reduces case from real production scenario #26', () => {
                // Given:
                createAndInitCageMAndReduction(17);
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(2, 7, 8, 9));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(2, 7));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(2, 7));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cageM.cellMs[0].numOpts()).toEqual([ 8 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 2, 7 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 2, 7 ]);
                expect(Array.from(cageM.combosSet.combos)).toEqual([
                    // Deleted: Combo.of(1, 7, 9),
                    Combo.of(2, 7, 8)
                ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toEqual([ 2, 7, 9 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #27', () => {
                // Given:
                createAndInitCageMAndReduction(11);
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(2, 5, 6, 8));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(1, 2, 5, 7));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(2, 4, 5, 7));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cageM.cellMs[0].numOpts()).toEqual([ 2, 5, 6, 8 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 1, 2, 5 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 2, 4 ]);
                expect(Array.from(cageM.combosSet.combos)).toEqual([
                    Combo.of(1, 2, 8),
                    // Deleted: Combo.of(1, 3, 7),
                    Combo.of(1, 4, 6),
                    Combo.of(2, 4, 5)
                ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toEqual([ 7 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toEqual([ 5, 7 ]);
            });

            test('Reduces case from real production scenario #28', () => {
                // Given:
                createAndInitCageMAndReduction(16);
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(1, 2, 5, 8, 9));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(1, 5, 9));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(2, 5, 6, 7, 8, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cageM.cellMs[0].numOpts()).toEqual([ 1, 2, 5, 8, 9 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 1, 5, 9 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 2, 5, 6, 7, 9 ]);
                expect(Array.from(cageM.combosSet.combos)).toEqual([
                    Combo.of(1, 6, 9),
                    Combo.of(1, 7, 8),
                    Combo.of(2, 5, 9),
                    // Deleted: Combo.of(2, 6, 8),
                    // Deleted: Combo.of(3, 4, 9),
                    // Deleted: Combo.of(3, 5, 8),
                    // Deleted: Combo.of(4, 5, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toEqual([ 8 ]);
            });

            test('Reduces case from real production scenario #29', () => {
                // Given:
                createAndInitCageMAndReduction(15);
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(1, 2, 5, 8, 9));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(1, 5, 9));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(1, 3, 5));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cageM.cellMs[0].numOpts()).toEqual([ 1, 5, 9 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 1, 5, 9 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 1, 5 ]);
                expect(Array.from(cageM.combosSet.combos)).toEqual([
                    Combo.of(1, 5, 9),
                    // Deleted: Combo.of(2, 5, 8),
                    // Deleted: Combo.of(3, 4, 8)
                ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toEqual([ 2, 8 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toEqual([ 3 ]);
            });

            test('Reduces case from real production scenario #30', () => {
                // Given:
                createAndInitCageMAndReduction(16);
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(1, 5, 9));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(1, 5, 9));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(2, 5, 6, 7, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cageM.cellMs[0].numOpts()).toEqual([ 1, 5, 9 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 1, 5, 9 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 2, 6 ]);
                expect(Array.from(cageM.combosSet.combos)).toEqual([
                    Combo.of(1, 6, 9),
                    // Deleted: Combo.of(1, 7, 8),
                    Combo.of(2, 5, 9)
                ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toEqual([ 5, 7, 9 ]);
            });

            test('Reduces case from real production scenario #31', () => {
                // Given:
                createAndInitCageMAndReduction(15);
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(1, 5, 9));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(1, 5, 9));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(5));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cageM.cellMs[0].numOpts()).toEqual([ 1, 9 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 1, 9 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 5 ]);
                expect(Array.from(cageM.combosSet.combos)).toEqual([
                    Combo.of(1, 5, 9)
                ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toEqual([ 5 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toEqual([ 5 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #32', () => {
                // Given:
                createAndInitCageMAndReduction(16);
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(1, 9));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(1, 9));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(2, 6));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cageM.cellMs[0].numOpts()).toEqual([ 1, 9 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 1, 9 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 6 ]);
                expect(Array.from(cageM.combosSet.combos)).toEqual([
                    Combo.of(1, 6, 9),
                    // Deleted: Combo.of(2, 5, 9)
                ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toEqual([ 2 ]);
            });

            test('Reduces case from real production scenario #33', () => {
                // Given:
                createAndInitCageMAndReduction(11);
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(2, 5, 6));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(1, 2, 5));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(2, 4));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cageM.cellMs[0].numOpts()).toEqual([ 2, 5, 6 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 1, 2, 5 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 4 ]);
                expect(Array.from(cageM.combosSet.combos)).toEqual([
                    // Deleted: Combo.of(1, 2, 8),
                    Combo.of(1, 4, 6),
                    Combo.of(2, 4, 5)
                ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toEqual([ 2 ]);
            });

            test('Reduces case from real production scenario #34', () => {
                // Given:
                createAndInitCageMAndReduction(11);
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(2, 5));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(1, 2, 5));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(4));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cageM.cellMs[0].numOpts()).toEqual([ 2, 5 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 2, 5 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 4 ]);
                expect(Array.from(cageM.combosSet.combos)).toEqual([
                    // Deleted: Combo.of(1, 4, 6),
                    Combo.of(2, 4, 5)
                ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toEqual([ 1 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #35', () => {
                // Given:
                createAndInitCageMAndReduction(11);
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(2));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(2, 5));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(4));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cageM.cellMs[0].numOpts()).toEqual([ 2 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 5 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 4 ]);
                expect(Array.from(cageM.combosSet.combos)).toEqual([
                    Combo.of(2, 4, 5)
                ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toEqual([ 2 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #36', () => {
                // Given:
                createAndInitCageMAndReduction(16);
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(1, 9));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(1));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(6));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cageM.cellMs[0].numOpts()).toEqual([ 9 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 1 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 6 ]);
                expect(Array.from(cageM.combosSet.combos)).toEqual([
                    Combo.of(1, 6, 9)
                ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toEqual([ 1 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #37', () => {
                // Given:
                createAndInitCageMAndReduction(20);
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(4, 7, 9));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(4, 7, 9));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cageM.cellMs[0].numOpts()).toEqual([ 4, 7 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 4, 7 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 9 ]);
                expect(Array.from(cageM.combosSet.combos)).toEqual([
                    Combo.of(4, 7, 9)
                ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toEqual([ 9 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toEqual([ 9 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toHaveLength(0);
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
