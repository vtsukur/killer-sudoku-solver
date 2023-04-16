import { Cage } from '../../../../../src/puzzle/cage';
import { Cell } from '../../../../../src/puzzle/cell';
import { Combo } from '../../../../../src/solver/math';
import { CageModel } from '../../../../../src/solver/models/elements/cageModel';
import { CellModel } from '../../../../../src/solver/models/elements/cellModel';
import { SudokuNumsSet } from '../../../../../src/solver/sets';
import { CageModel3FullReducer } from '../../../../../src/solver/strategies/reduction/archive/cageModel3FullReducer';
import { CageModel3Reducer } from '../../../../../src/solver/strategies/reduction/cageModel3Reducer';
import { MasterModelReduction } from '../../../../../src/solver/strategies/reduction/masterModelReduction';
import { CageModelReducerTestConfig } from './cageModelReducerTestConfig';

describe('CageModel3Reducers', () => {

    const cell1 = Cell.at(0, 0);
    const cell2 = Cell.at(0, 1);
    const cell3 = Cell.at(0, 2);

    let cellM1: CellModel;
    let cellM2: CellModel;
    let cellM3: CellModel;
    let cageM: CageModel;
    let reduction: MasterModelReduction;

    const createCageM = (sum: number) => {
        const cage = Cage.ofSum(sum).withCell(cell1).withCell(cell2).withCell(cell3).new();

        cellM1 = new CellModel(cell1);
        cellM2 = new CellModel(cell2);
        cellM3 = new CellModel(cell3);
        cageM = new CageModel(cage, [ cellM1, cellM2, cellM3 ]);

        cellM1.addWithinCageModel(cageM);
        cellM2.addWithinCageModel(cageM);
        cellM3.addWithinCageModel(cageM);

        cageM.initialReduce();

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
                createCageM(13);
                cageM.comboSet.clear();
                cageM.comboSet.addCombo(Combo.of(1, 3, 9));
                cageM.comboSet.addCombo(Combo.of(1, 4, 8));
                cageM.comboSet.addCombo(Combo.of(2, 4, 7));
                cageM.comboSet.addCombo(Combo.of(3, 4, 6));
                cellM1.reduceNumOpts(SudokuNumsSet.of(3, 6));
                cellM2.reduceNumOpts(SudokuNumsSet.of(1, 7, 8, 9));
                cellM3.reduceNumOpts(SudokuNumsSet.of(1, 2, 3, 8, 9));

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 3 ]);
                expect(cellM2.numOpts()).toEqual([ 1, 9 ]);
                expect(cellM3.numOpts()).toEqual([ 1, 9 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(1, 3, 9)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toEqual([ 6 ]);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toEqual([ 7, 8 ]);
                expect(reduction.deletedNumOptsOf(cellM3).nums).toEqual([ 2, 3, 8 ]);
            });

            test('Does not reduce if there are no deletions for a particular `Combo`', () => {
                // Given:
                // ... initially reduced `CageModel` without extra deletions for its `CellModel`s.
                createCageM(9);

                // When:
                newReducer(cageM).reduce(reduction);

                // Then:
                expect(cellM1.numOpts()).toEqual([ 1, 2, 3, 4, 5, 6 ]);
                expect(cellM2.numOpts()).toEqual([ 1, 2, 3, 4, 5, 6 ]);
                expect(cellM3.numOpts()).toEqual([ 1, 2, 3, 4, 5, 6 ]);
                expect(Array.from(cageM.comboSet.combos)).toEqual([
                    Combo.of(1, 2, 6),
                    Combo.of(1, 3, 5),
                    Combo.of(2, 3, 4)
                ]);
                expect(reduction.deletedNumOptsOf(cellM1).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM2).nums).toHaveLength(0);
                expect(reduction.deletedNumOptsOf(cellM3).nums).toHaveLength(0);
            });

        });

    }

});
