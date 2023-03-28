import * as _ from 'lodash';
import { Cage } from '../../../../../src/puzzle/cage';
import { Cell } from '../../../../../src/puzzle/cell';
import { CageModel } from '../../../../../src/solver/models/elements/cageModel';
import { CellModel } from '../../../../../src/solver/models/elements/cellModel';
import { NumsReduction } from '../../../../../src/solver/strategies/numsReduction';

describe('Performance tests for `CageModel`', () => {

    const TESTS_COUNT = 10;
    const ITERATIONS = _.range(20_000);

    const cell1 = Cell.at(0, 0);
    const cell2 = Cell.at(0, 1);
    const cage_2_cells_of_sum_11 = Cage.ofSum(11).withCell(cell1).withCell(cell2).new();
    const cage_2_cells_of_sum_17 = Cage.ofSum(17).withCell(cell1).withCell(cell2).new();

    let reduction: NumsReduction;

    beforeEach(() => {
        reduction = new NumsReduction();
    });

    _.range(TESTS_COUNT).forEach(i => {

        test.skip(`Initial reduction of \`CageModel\` with 2 \`Cell\`s and a single \`Combo\` [${i}]`, () => {
            ITERATIONS.forEach(() => {
                const cellM1 = new CellModel(cell1);
                const cellM2 = new CellModel(cell2);
                const cageM = new CageModel(cage_2_cells_of_sum_17, [ cellM1, cellM2 ]);

                cageM.initialReduce(reduction);
            });
        });

        test(`Reduction of \`CageModel\` with 2 \`Cell\`s and 4 \`Combo\`s — without impact [${i}]`, () => {
            const currentReduction = new NumsReduction();
            const newReduction = new NumsReduction();
            ITERATIONS.forEach(() => {
                const cellM1 = new CellModel(cell1);
                const cellM2 = new CellModel(cell2);
                const cageM = new CageModel(cage_2_cells_of_sum_11, [ cellM1, cellM2 ]);

                cageM.initialReduce(currentReduction);
                cageM.reduce(currentReduction, newReduction);
            });
        });

    });

});
