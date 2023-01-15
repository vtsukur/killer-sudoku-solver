import { Cell } from '../../../src/puzzle/cell';
import { CellsIterator } from '../../../src/puzzle/cellsIterator';

describe('CellsIterator tests', () => {
    test('Iterating over Cells', () => {
        const cellsIterator = new CellsIterator((index) => Cell.at(0, index), 2);
        const cells = Array.from(cellsIterator);
        expect(cells).toEqual([ Cell.at(0, 0), Cell.at(0, 1) ]);
    });
});
