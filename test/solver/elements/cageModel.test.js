import { CageModel } from '../../../src/solver/models/elements/cageModel';
import { CellModel } from '../../../src/solver/models/elements/cellModel';
import { Cage } from '../../../src/problem/cage';
import { Cell } from '../../../src/problem/cell';
import _ from 'lodash';

const cell1 = Cell.at(0, 0);
const cell2 = Cell.at(0, 1);
const cell3 = Cell.at(0, 2);

describe('CageModel tests', () => {
    test('Initial reduction for CageModel of size 2 with a single combination', () => {
        const cellModel1 = new CellModel(cell1);
        const cellModel2 = new CellModel(cell2);
        const cage = Cage.ofSum(17).cell(cell1).cell(cell2).mk();
        const cageModel = new CageModel(cage, [ cellModel1, cellModel2 ]);

        cageModel.initialReduce();

        expect(cellModel1.numOpts()).toEqual(new Set([ 8, 9 ]));
        expect(cellModel2.numOpts()).toEqual(new Set([ 8, 9 ]));
        expect(Array.from(cageModel.combos)).toEqual([
            [ 8, 9 ]
        ]);
    });

    test('Initial reduction for CageModel of size 2 with several combinations', () => {
        const cellModel1 = new CellModel(cell1);
        const cellModel2 = new CellModel(cell2);
        const cage = Cage.ofSum(13).cell(cell1).cell(cell2).mk();
        const cageModel = new CageModel(cage, [ cellModel1, cellModel2 ]);

        cageModel.initialReduce();

        expect(cellModel1.numOpts()).toEqual(new Set([ 4, 5, 6, 7, 8, 9 ]));
        expect(cellModel2.numOpts()).toEqual(new Set([ 4, 5, 6, 7, 8, 9 ]));
        expect(Array.from(cageModel.combos)).toEqual([
            [ 4, 9 ],
            [ 5, 8 ],
            [ 6, 7 ]
        ]);
    });

    test('Initial reduction for CageModel of size 3 with a single combination', () => {
        const cellModel1 = new CellModel(cell1);
        const cellModel2 = new CellModel(cell2);
        const cellModel3 = new CellModel(cell3);
        const cage = Cage.ofSum(24).cell(cell1).cell(cell2).cell(cell3).mk();
        const cageModel = new CageModel(cage, [ cellModel1, cellModel2, cellModel3 ]);

        cageModel.initialReduce();

        expect(cellModel1.numOpts()).toEqual(new Set([ 7, 8, 9 ]));
        expect(cellModel2.numOpts()).toEqual(new Set([ 7, 8, 9 ]));
        expect(cellModel3.numOpts()).toEqual(new Set([ 7, 8, 9 ]));
        expect(Array.from(cageModel.combos)).toEqual([
            [ 7, 8, 9 ]
        ]);
    });

    test('Reduction for CageModel of size 2 with several combinations after removing one of the cell options', () => {
        const cellModel1 = new CellModel(cell1);
        const cellModel2 = new CellModel(cell2);
        const cage = Cage.ofSum(11).cell(cell1).cell(cell2).mk();
        const cageModel = new CageModel(cage, [ cellModel1, cellModel2 ]);

        cageModel.initialReduce();

        cellModel1.deleteNumOpt(5);
        const modifiedCellMs = cageModel.reduce();

        expect(modifiedCellMs).toEqual(new Set([ cellModel2 ]));
        expect(cellModel1.numOpts()).toEqual(new Set([ 2, 3, 4, 6, 7, 8, 9 ]));
        expect(cellModel2.numOpts()).toEqual(new Set([ 2, 3, 4, 5, 7, 8, 9 ]));
        expect(Array.from(cageModel.combos)).toEqual([
            [ 2, 9 ],
            [ 3, 8 ],
            [ 4, 7 ],
            [ 5, 6 ]
        ]);
    });

    test('Reduction for CageModel of size 2 with several combinations after removing few cell options', () => {
        const cellModel1 = new CellModel(cell1);
        const cellModel2 = new CellModel(cell2);
        const cage = Cage.ofSum(11).cell(cell1).cell(cell2).mk();
        const cageModel = new CageModel(cage, [ cellModel1, cellModel2 ]);

        cageModel.initialReduce();

        cellModel1.deleteNumOpt(5);
        cellModel2.deleteNumOpt(5);
        const modifiedCellMs = cageModel.reduce();

        expect(modifiedCellMs).toEqual(new Set([ cellModel1, cellModel2 ]));
        expect(cellModel1.numOpts()).toEqual(new Set([ 2, 3, 4, 7, 8, 9 ]));
        expect(cellModel2.numOpts()).toEqual(new Set([ 2, 3, 4, 7, 8, 9 ]));
        expect(Array.from(cageModel.combos)).toEqual([
            [ 2, 9 ],
            [ 3, 8 ],
            [ 4, 7 ]
        ]);
    });

    test('Reduction for CageModel of size 3 with many combinations', () => {
        // _.range(1, 10000).forEach(() => {
        const cellModel1 = new CellModel(cell1);
        const cellModel2 = new CellModel(cell2);
        const cellModel3 = new CellModel(cell3);
        const cage = Cage.ofSum(14).cell(cell1).cell(cell2).cell(cell3).mk();
        const cageModel = new CageModel(cage, [ cellModel1, cellModel2, cellModel3 ]);

        cageModel.initialReduce();

        // cellModel1.deleteNumOpt(5);
        // cellModel2.deleteNumOpt(5);
        const modifiedCellMs = cageModel.reduce();

        // expect(cellModel1.numOpts()).toEqual(new Set([ 7, 8, 9 ]));
        // expect(cellModel2.numOpts()).toEqual(new Set([ 7, 8, 9 ]));
        // expect(cellModel3.numOpts()).toEqual(new Set([ 7, 8, 9 ]));
        // expect(Array.from(cageModel.combos)).toEqual([
        //     [ 7, 8, 9 ]
        // ]);
        // });
    });
});
