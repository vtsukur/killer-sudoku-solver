import { Cell } from '../../../../../src/puzzle/cell';
import { Cage } from '../../../../../src/puzzle/cage';
import { CageModel } from '../../../../../src/solver/models/elements/cageModel';
import { SudokuNumsSet } from '../../../../../src/solver/sets';
import { Combo } from '../../../../../src/solver/math';
import { LockableCellModel } from './lockableCellModel';
import { LockableCageModel } from './lockableCageModel';
import { ComparablePerformanceTestConfig, doRunFunctionalAndPerformanceTests } from './commons';
import { CageModel3FullReducer } from '../../../../../src/solver/strategies/reduction/archive/cageModel3FullReducer';
import { CageModel3Reducer } from '../../../../../src/solver/strategies/reduction/cageModel3Reducer';

const IS_RUN_SLOWER_ALTERNATIVES = false;

describe('Performance tests for `CageModel3Reducer`', () => {

    test('Comparable test for `CageModel` of sum 8, 2 `Combo`s and 8 present numbers', () => {
        runComparablePerformanceTests({
            createReferenceCageModel: () => createReferenceCageM(8),
            prepareForReduction: (cageM, reduction) => {
                reduction.tryReduceNumOpts(cageM.cellMs[0], SudokuNumsSet.of(1, 2, 4, 5));
                expect(cageM.cellMs[0].numOpts()).toEqual([ 1, 2, 4, 5 ]);

                reduction.tryReduceNumOpts(cageM.cellMs[1], SudokuNumsSet.of(1, 2));
                expect(cageM.cellMs[1].numOpts()).toEqual([ 1, 2 ]);

                reduction.tryReduceNumOpts(cageM.cellMs[2], SudokuNumsSet.of(1, 3));
                expect(cageM.cellMs[2].numOpts()).toEqual([ 1, 3 ]);

                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(1, 2, 5),
                    Combo.of(1, 3, 4)
                ]);
            },
            expectAfterTargetReduction: (cageM) => {
                expect(cageM.cellMs[0].numOpts()).toEqual([ 4, 5 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 1, 2 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 1, 3 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(1, 2, 5),
                    Combo.of(1, 3, 4)
                ]);
            }
        });
    });

    test('Comparable test from real production scenario #1', () => {
        runComparablePerformanceTests({
            createReferenceCageModel: () => createReferenceCageM(19),
            prepareForReduction: (cageM) => {
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(2, 3, 4, 5, 8, 9));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(8));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(4, 6, 7, 9));
            },
            expectAfterTargetReduction: (cageM) => {
                expect(cageM.cellMs[0].numOpts()).toEqual([ 2, 4, 5 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 8 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 6, 7, 9 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(2, 8, 9),
                    // Deleted: Combo.of(3, 7, 9),
                    // Deleted: Combo.of(4, 6, 9),
                    Combo.of(4, 7, 8),
                    Combo.of(5, 6, 8)
                ]);
            }
        });
    });

    const createReferenceCageM = (sum: number) => {
        const cell1 = Cell.at(0, 0);
        const cell2 = Cell.at(0, 1);
        const cell3 = Cell.at(0, 2);
        const cage = Cage.ofSum(sum).withCell(cell1).withCell(cell2).withCell(cell3).new();

        const cellM1 = new LockableCellModel(cell1);
        const cellM2 = new LockableCellModel(cell2);
        const cellM3 = new LockableCellModel(cell3);
        const cageM = new LockableCageModel(cage, [ cellM1, cellM2, cellM3 ]);

        cellM1.addWithinCageModel(cageM);
        cellM2.addWithinCageModel(cageM);
        cellM3.addWithinCageModel(cageM);

        cageM.initialReduce();

        return cageM;
    };

    const runComparablePerformanceTests = (config: ComparablePerformanceTestConfig) => {
        if (IS_RUN_SLOWER_ALTERNATIVES) {
            doRunFunctionalAndPerformanceTests(config, createFullReducer, 'Full');
        }
        doRunFunctionalAndPerformanceTests(config, createOptimalReducer, 'Optimal');
    };

    const createFullReducer = (cageM: CageModel) => {
        return new CageModel3FullReducer(cageM);
    };

    const createOptimalReducer = (cageM: CageModel) => {
        return new CageModel3Reducer(cageM);
    };

});
