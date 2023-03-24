import { Cell } from '../../../src/puzzle/cell';
import { CellsPositioning } from '../../../src/puzzle/cellsPositioning';

describe('Unit tests for `CellsPositioning`', () => {

    test('Construction of `CellsPositioning` with a single `Cell`', () => {
        const positioning = new CellsPositioning([ Cell.at(3, 4) ]);

        expect(positioning).toEqual({
            isSingleCell: true,
            isWithinRow: true,
            isWithinColumn: true,
            isWithinNonet: true,
            isWithinHouse: true
        } as CellsPositioning);
    });

});
