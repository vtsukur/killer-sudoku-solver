import { Cell } from '../../../src/puzzle/cell';
import { CellsKeys } from '../../../src/puzzle/cellsKeys';

describe('CellKeys tests', () => {
    test('Construction for the case with duplicate cell keys', () => {
        const cellsKeys = new CellsKeys([
            Cell.at(1, 1), Cell.at(1, 2), Cell.at(1, 3),
            Cell.at(1, 2), Cell.at(1, 2)
        ]);

        expect(cellsKeys.unique).toEqual(new Set([
            Cell.keyOf(1, 1), Cell.keyOf(1, 2), Cell.keyOf(1, 3)
        ]));
        expect(cellsKeys.hasDuplicates).toBeTruthy();
        expect(cellsKeys.duplicates).toEqual(new Set([
            Cell.keyOf(1, 2)
        ]));
    });

    test('Construction for the case with unique-only cell keys', () => {
        const cellsKeys = new CellsKeys([
            Cell.at(1, 1), Cell.at(1, 2), Cell.at(1, 3)
        ]);

        expect(cellsKeys.unique).toEqual(new Set([
            Cell.keyOf(1, 1), Cell.keyOf(1, 2), Cell.keyOf(1, 3)
        ]));
        expect(cellsKeys.hasDuplicates).toBeFalsy();
    });
});
