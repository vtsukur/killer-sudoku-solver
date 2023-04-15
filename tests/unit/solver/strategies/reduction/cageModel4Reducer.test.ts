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
                cellM3.deleteNumOpt(8);
                cellM4.reduceNumOpts(SudokuNumsSet.of(1, 2, 4, 5, 7));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 1, 3, 4, 6, 7, 8, 9 ]);
                expect(cellM2.numOpts()).toEqual([ 1, 2, 4, 5, 7 ]);
                expect(cellM3.numOpts()).toEqual([ 1, 2, 3, 4, 5, 6, 7, 9 ]);
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
                    Combo.of(3, 5, 6, 7)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toEqual([ 2, 5 ]);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM3).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM4).nums).toHaveLength(0);
            });

            test('Reduces case from real production scenario #2', () => {
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
                    Combo.of(1, 3, 5, 9)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toEqual([ 2 ]);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toEqual([ 2, 5 ]);
                expect(reduction.deletedNumOptsOf(cellM3).nums).toEqual([ 2, 5 ]);
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
