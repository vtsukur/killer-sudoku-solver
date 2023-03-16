import * as _ from 'lodash';
import { Cage } from '../../../../../src/puzzle/cage';
import { Cell } from '../../../../../src/puzzle/cell';
import { CageModel } from '../../../../../src/solver/models/elements/cageModel';
import { CellModel } from '../../../../../src/solver/models/elements/cellModel';

describe('Performance tests for `CageModel`', () => {

    const TESTS_COUNT = 10;
    const ITERATIONS = _.range(20_000);

    const cell1 = Cell.at(0, 0);
    const cell2 = Cell.at(0, 1);
    const cage = Cage.ofSum(17).withCell(cell1).withCell(cell2).new();

    _.range(TESTS_COUNT).forEach(i => {

        test(`Initial reduction for \`CageModel\` of size 2 with a single \`Combo\` [${i}]`, () => {
            ITERATIONS.forEach(() => {
                const cellM1 = new CellModel(cell1);
                const cellM2 = new CellModel(cell2);
                const cageM = new CageModel(cage, [ cellM1, cellM2 ]);

                cageM.initialReduce();
            });
        });

    });

});
