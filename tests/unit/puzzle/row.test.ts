import * as _ from 'lodash';
import { Cell } from '../../../src/puzzle/cell';
import { House } from '../../../src/puzzle/house';
import { Row } from '../../../src/puzzle/row';

describe('Row tests', () => {
    test('Iteration over Cells', () => {
        const cells = _.range(House.COUNT_OF_ONE_TYPE_PER_GRID).map(row => {
            return Array.from(Row.newCellsIterator(row));
        });

        expect(cells[0]).toEqual([
            Cell.at(0, 0), Cell.at(0, 1), Cell.at(0, 2),
            Cell.at(0, 3), Cell.at(0, 4), Cell.at(0, 5),
            Cell.at(0, 6), Cell.at(0, 7), Cell.at(0, 8)
        ]);
        expect(cells[1]).toEqual([
            Cell.at(1, 0), Cell.at(1, 1), Cell.at(1, 2),
            Cell.at(1, 3), Cell.at(1, 4), Cell.at(1, 5),
            Cell.at(1, 6), Cell.at(1, 7), Cell.at(1, 8)
        ]);
        expect(cells[2]).toEqual([
            Cell.at(2, 0), Cell.at(2, 1), Cell.at(2, 2),
            Cell.at(2, 3), Cell.at(2, 4), Cell.at(2, 5),
            Cell.at(2, 6), Cell.at(2, 7), Cell.at(2, 8)
        ]);
        expect(cells[3]).toEqual([
            Cell.at(3, 0), Cell.at(3, 1), Cell.at(3, 2),
            Cell.at(3, 3), Cell.at(3, 4), Cell.at(3, 5),
            Cell.at(3, 6), Cell.at(3, 7), Cell.at(3, 8)
        ]);
        expect(cells[4]).toEqual([
            Cell.at(4, 0), Cell.at(4, 1), Cell.at(4, 2),
            Cell.at(4, 3), Cell.at(4, 4), Cell.at(4, 5),
            Cell.at(4, 6), Cell.at(4, 7), Cell.at(4, 8)
        ]);
        expect(cells[5]).toEqual([
            Cell.at(5, 0), Cell.at(5, 1), Cell.at(5, 2),
            Cell.at(5, 3), Cell.at(5, 4), Cell.at(5, 5),
            Cell.at(5, 6), Cell.at(5, 7), Cell.at(5, 8)
        ]);
        expect(cells[6]).toEqual([
            Cell.at(6, 0), Cell.at(6, 1), Cell.at(6, 2),
            Cell.at(6, 3), Cell.at(6, 4), Cell.at(6, 5),
            Cell.at(6, 6), Cell.at(6, 7), Cell.at(6, 8)
        ]);
        expect(cells[7]).toEqual([
            Cell.at(7, 0), Cell.at(7, 1), Cell.at(7, 2),
            Cell.at(7, 3), Cell.at(7, 4), Cell.at(7, 5),
            Cell.at(7, 6), Cell.at(7, 7), Cell.at(7, 8)
        ]);
        expect(cells[8]).toEqual([
            Cell.at(8, 0), Cell.at(8, 1), Cell.at(8, 2),
            Cell.at(8, 3), Cell.at(8, 4), Cell.at(8, 5),
            Cell.at(8, 6), Cell.at(8, 7), Cell.at(8, 8)
        ]);
    });
});
