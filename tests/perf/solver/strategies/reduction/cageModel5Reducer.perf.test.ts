import { Cell } from '../../../../../src/puzzle/cell';
import { Cage } from '../../../../../src/puzzle/cage';
import { CageModel } from '../../../../../src/solver/models/elements/cageModel';
import { SudokuNumsSet } from '../../../../../src/solver/sets';
import { Combo } from '../../../../../src/solver/math';
import { LockableCellModel } from './lockableCellModel';
import { LockableCageModel } from './lockableCageModel';
import { ComparablePerformanceTestConfig, doRunFunctionalAndPerformanceTests } from './commons';
import { CageModel5Reducer } from '../../../../../src/solver/strategies/reduction/cageModel5Reducer';

describe('Performance tests for `CageModel5Reducer`', () => {

    test('Comparable test for `CageModel` of sum 18, 11 `Combo`s and 22 present numbers', () => {
        runComparablePerformanceTests({
            createReferenceCageModel: () => createReferenceCageM(22),
            prepareForReduction: (cageM) => {
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(3, 4, 5, 7, 8, 9));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(2, 3, 4, 5, 6, 7));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(4, 7));
                cageM.cellMs[3].reduceNumOpts(SudokuNumsSet.of(5, 8));
                cageM.cellMs[4].reduceNumOpts(SudokuNumsSet.of(1, 2));
            },
            expectAfterTargetReduction: (cageM, reduction) => {
                expect(cageM.cellMs[0].numOpts()).toEqual([ 3, 4, 5, 7, 8, 9 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 2, 3, 5, 6 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 4, 7 ]);
                expect(cageM.cellMs[3].numOpts()).toEqual([ 5, 8 ]);
                expect(cageM.cellMs[4].numOpts()).toEqual([ 1, 2 ]);

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

                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toEqual([ 4, 7 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[3]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[4]).nums).toHaveLength(0);
            }
        });
    });

    const createReferenceCageM = (sum: number) => {
        const cell1 = Cell.at(0, 0);
        const cell2 = Cell.at(0, 1);
        const cell3 = Cell.at(0, 2);
        const cell4 = Cell.at(0, 3);
        const cell5 = Cell.at(0, 4);
        const cage = Cage.ofSum(sum).withCells([ cell1, cell2, cell3, cell4, cell5 ]).new();

        const cellM1 = new LockableCellModel(cell1);
        const cellM2 = new LockableCellModel(cell2);
        const cellM3 = new LockableCellModel(cell3);
        const cellM4 = new LockableCellModel(cell4);
        const cellM5 = new LockableCellModel(cell5);
        const cageM = new LockableCageModel(cage, [ cellM1, cellM2, cellM3, cellM4, cellM5 ]);

        cellM1.addWithinCageModel(cageM);
        cellM2.addWithinCageModel(cageM);
        cellM3.addWithinCageModel(cageM);
        cellM4.addWithinCageModel(cageM);
        cellM5.addWithinCageModel(cageM);

        cageM.initialReduce();

        return cageM;
    };

    const runComparablePerformanceTests = (config: ComparablePerformanceTestConfig) => {
        doRunFunctionalAndPerformanceTests(config, createOptimalReducer, 'Optimal');
    };

    const createOptimalReducer = (cageM: CageModel) => {
        return new CageModel5Reducer(cageM);
    };

});
