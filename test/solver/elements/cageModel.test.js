import { CageModel } from '../../../src/solver/models/elements/cageModel';
import { CellModel } from '../../../src/solver/models/elements/cellModel';
import { Cage } from '../../../src/problem/cage';
import { Cell } from '../../../src/problem/cell';

describe('CageModel tests', () => {
    test('Reducing CageModel of size 2 with a single combination', () => {
        const cell1 = Cell.at(0, 0);
        const cellModel1 = new CellModel(cell1);
        const cell2 = Cell.at(0, 1);
        const cellModel2 = new CellModel(cell2);
        const cage = Cage.ofSum(17).cell(cell1).cell(cell2).mk();
        const cageModel = new CageModel(cage, [ cellModel1, cellModel2 ]);

        const modifiedCellModels = cageModel.reduce();

        expect(modifiedCellModels).toEqual(new Set([ cellModel1, cellModel2 ]));
        expect(cellModel1.numOpts()).toEqual(new Set([ 8, 9 ]));
        expect(cellModel2.numOpts()).toEqual(new Set([ 8, 9 ]));
        expect(Array.from(cageModel.combos)).toEqual([
            [ 8, 9 ]
        ]);
    });

    test('Reducing CageModel of size 2 with several combinations', () => {
        const cell1 = Cell.at(0, 0);
        const cellModel1 = new CellModel(cell1);
        const cell2 = Cell.at(0, 1);
        const cellModel2 = new CellModel(cell2);
        const cage = Cage.ofSum(13).cell(cell1).cell(cell2).mk();
        const cageModel = new CageModel(cage, [ cellModel1, cellModel2 ]);

        const modifiedCellModels = cageModel.reduce();

        expect(modifiedCellModels).toEqual(new Set([ cellModel1, cellModel2 ]));
        expect(cellModel1.numOpts()).toEqual(new Set([ 4, 5, 6, 7, 8, 9 ]));
        expect(cellModel2.numOpts()).toEqual(new Set([ 4, 5, 6, 7, 8, 9 ]));
        expect(Array.from(cageModel.combos)).toEqual([
            [ 4, 9 ],
            [ 5, 8 ],
            [ 6, 7 ]
        ]);
    });
});
