import { Cell } from '../../../../../src/puzzle/cell';
import { Cage } from '../../../../../src/puzzle/cage';
import { CageModel } from '../../../../../src/solver/models/elements/cageModel';
import { SudokuNumsSet } from '../../../../../src/solver/sets';
import { Combo } from '../../../../../src/solver/math';
import { LockableCellModel } from './lockableCellModel';
import { LockableCageModel } from './lockableCageModel';
import { ComparablePerformanceTestConfig, doRunFunctionalAndPerformanceTests } from './commons';
import { CageModel6PlusReducer } from '../../../../../src/solver/strategies/reduction/cageModel6PlusReducer';

describe('Performance tests for `CageModel6PlusReducer`', () => {

    test('Comparable test for real production scenario #1', () => {
        runComparablePerformanceTests({
            createReferenceCageModel: () => createReferenceCageM(27),
            prepareForReduction: (cageM) => {
                cageM.cellMs[0].reduceNumOpts(SudokuNumsSet.of(8));
                cageM.cellMs[1].reduceNumOpts(SudokuNumsSet.of(1));
                cageM.cellMs[2].reduceNumOpts(SudokuNumsSet.of(5, 7));
                cageM.cellMs[3].reduceNumOpts(SudokuNumsSet.of(1, 2, 7, 8, 9));
                cageM.cellMs[4].reduceNumOpts(SudokuNumsSet.of(1, 2, 7, 8, 9));
                cageM.cellMs[5].reduceNumOpts(SudokuNumsSet.of(1, 2, 4, 5, 7));
            },
            expectAfterTargetReduction: (cageM, reduction) => {
                expect(cageM.cellMs[0].numOpts()).toEqual([ 8 ]);
                expect(cageM.cellMs[1].numOpts()).toEqual([ 1 ]);
                expect(cageM.cellMs[2].numOpts()).toEqual([ 5, 7 ]);
                expect(cageM.cellMs[3].numOpts()).toEqual([ 1, 2, 7, 8 ]);
                expect(cageM.cellMs[4].numOpts()).toEqual([ 1, 2, 7, 8 ]);
                expect(cageM.cellMs[5].numOpts()).toEqual([ 1, 2, 4, 5, 7 ]);

                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    // Deleted: Combo.of(1, 2, 3, 4, 8, 9),
                    // Deleted: Combo.of(1, 2, 3, 5, 7, 9),
                    Combo.of(1, 2, 4, 5, 7, 8)
                ]);

                expect(reduction.deletedNumOptsOf(cageM.cellMs[0]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[1]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[2]).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[3]).nums).toEqual([ 9 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[4]).nums).toEqual([ 9 ]);
                expect(reduction.deletedNumOptsOf(cageM.cellMs[5]).nums).toHaveLength(0);
            }
        });
    });

    const createReferenceCageM = (sum: number) => {
        const cell1 = Cell.at(0, 0);
        const cell2 = Cell.at(0, 1);
        const cell3 = Cell.at(0, 2);
        const cell4 = Cell.at(0, 3);
        const cell5 = Cell.at(0, 4);
        const cell6 = Cell.at(0, 5);
        const cage = Cage.ofSum(sum).withCells([ cell1, cell2, cell3, cell4, cell5, cell6 ]).new();

        const cellM1 = new LockableCellModel(cell1);
        const cellM2 = new LockableCellModel(cell2);
        const cellM3 = new LockableCellModel(cell3);
        const cellM4 = new LockableCellModel(cell4);
        const cellM5 = new LockableCellModel(cell5);
        const cellM6 = new LockableCellModel(cell6);
        const cageM = new LockableCageModel(cage, [ cellM1, cellM2, cellM3, cellM4, cellM5, cellM6 ]);

        cellM1.addWithinCageModel(cageM);
        cellM2.addWithinCageModel(cageM);
        cellM3.addWithinCageModel(cageM);
        cellM4.addWithinCageModel(cageM);
        cellM5.addWithinCageModel(cageM);
        cellM6.addWithinCageModel(cageM);

        cageM.initialReduce();

        return cageM;
    };

    const runComparablePerformanceTests = (config: ComparablePerformanceTestConfig) => {
        doRunFunctionalAndPerformanceTests(config, createReducer, 'Optimal');
    };

    const createReducer = (cageM: CageModel) => {
        return new CageModel6PlusReducer(cageM);
    };

});
