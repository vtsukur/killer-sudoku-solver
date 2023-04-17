import { Cell } from '../../../../../src/puzzle/cell';
import { Cage } from '../../../../../src/puzzle/cage';
import { CageModel } from '../../../../../src/solver/models/elements/cageModel';
import { SudokuNumsSet } from '../../../../../src/solver/sets';
import { Combo } from '../../../../../src/solver/math';
import { LockableCellModel } from './lockableCellModel';
import { LockableCageModel } from './lockableCageModel';
import { ComparablePerformanceTestConfig, PerformanceTestOptions, doRunFunctionalAndPerformanceTests } from './commons';
import { CageModel4FullReducer } from '../../../../../src/solver/strategies/reduction/archive/cageModel4FullReducer';
import { CageModel4Reducer } from '../../../../../src/solver/strategies/reduction/cageModel4Reducer';

const IS_RUN_SLOWER_ALTERNATIVES = false;

describe('Performance tests for `CageModel4Reducer`', () => {

    test('Comparable test for `CageModel` of sum 18, 11 `Combo`s and 22 present numbers', () => {
        runComparablePerformanceTests({
            createReferenceCageModel: () => createReferenceCageM(18),
            prepareForReduction: (cageM) => {
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(1, 5, 9));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 5, 6, 7, 9));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 5, 6, 7, 9));
                cageM.cellMs[3].reduceNumOpts(SudokuNumsSet.of(1, 3, 5, 7, 9));
            },
            expectAfterTargetReduction: (cageM, reduction) => {
                expect(cageM.cellMs[0].numOpts()).toEqual([ 1, 5, 9 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 1, 2, 3, 5, 6, 9 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 1, 2, 3, 5, 6, 9 ]);
                expect(cageM.cellMs[3].numOpts()).toEqual([ 1, 3, 5, 9 ]);
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
                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toEqual([ 7 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toEqual([ 7 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[3]).nums).toEqual([ 7 ]);
            }
        });
    });

    const createReferenceCageM = (sum: number) => {
        const cell1 = Cell.at(0, 0);
        const cell2 = Cell.at(0, 1);
        const cell3 = Cell.at(0, 2);
        const cell4 = Cell.at(0, 3);
        const cage = Cage.ofSum(sum).withCell(cell1).withCell(cell2).withCell(cell3).withCell(cell4).new();

        const cellM1 = new LockableCellModel(cell1);
        const cellM2 = new LockableCellModel(cell2);
        const cellM3 = new LockableCellModel(cell3);
        const cellM4 = new LockableCellModel(cell4);
        const cageM = new LockableCageModel(cage, [ cellM1, cellM2, cellM3, cellM4 ]);

        cellM1.addWithinCageModel(cageM);
        cellM2.addWithinCageModel(cageM);
        cellM3.addWithinCageModel(cageM);
        cellM4.addWithinCageModel(cageM);

        cageM.initialReduce();

        return cageM;
    };

    const runComparablePerformanceTests = (config: ComparablePerformanceTestConfig) => {
        const options: PerformanceTestOptions = {
            warmupIterationCount: 1_000,
            mainIterationCount: 10_000
        };
        if (IS_RUN_SLOWER_ALTERNATIVES) {
            doRunFunctionalAndPerformanceTests(config, createFullReducer, 'Full', options);
        }
        doRunFunctionalAndPerformanceTests(config, createOptimalReducer, 'Optimal', options);
    };

    const createFullReducer = (cageM: CageModel) => {
        return new CageModel4FullReducer(cageM);
    };

    const createOptimalReducer = (cageM: CageModel) => {
        return new CageModel4Reducer(cageM);
    };

});
