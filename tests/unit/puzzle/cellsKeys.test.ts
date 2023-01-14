import * as _ from 'lodash';
import { Cell } from '../../../src/puzzle/cell';
import { CellsKeys } from '../../../src/puzzle/cellsKeys';

describe('CellKeys tests', () => {
    test('Construction with determination of unique and duplicate cell keys', () => {
        const cellsKeys = new CellsKeys([
            Cell.at(1, 1), Cell.at(1, 2), Cell.at(1, 3),
            Cell.at(1, 2), Cell.at(1, 2)
        ]);

        expect(cellsKeys.unique).toEqual(new Set([
            Cell.keyOf(1, 1), Cell.keyOf(1, 2), Cell.keyOf(1, 3)
        ]));
        expect(cellsKeys.duplicates).toEqual(new Set([
            Cell.keyOf(1, 2)
        ]));
    });
});
