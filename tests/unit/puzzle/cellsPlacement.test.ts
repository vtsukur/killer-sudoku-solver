import { Cell } from '../../../src/puzzle/cell';
import { CellsPlacement } from '../../../src/puzzle/cellsPlacement';

describe('Unit tests for `CellsPlacement`', () => {

    test('Construction of `CellsPlacement` with a single `Cell`', () => {
        expect(new CellsPlacement([ Cell.at(3, 4) ])).toEqual({
            isSingleCell: true,
            isWithinRow: true,
            isWithinColumn: true,
            isWithinNonet: true,
            isWithinHouse: true,
            minRow: 3,
            minCol: 4,
            maxRow: 3,
            maxCol: 4
        } as CellsPlacement);
    });

    test('Construction of `CellsPlacement` with the `Cell`s from a `Cage` placed within `Row`', () => {
        expect(new CellsPlacement([
            Cell.at(3, 5), Cell.at(3, 6)
        ])).toEqual({
            isSingleCell: false,
            isWithinRow: true,
            isWithinColumn: false,
            isWithinNonet: false,
            isWithinHouse: true,
            minRow: 3,
            minCol: 5,
            maxRow: 3,
            maxCol: 6
        } as CellsPlacement);
    });

    test('Construction of `CellsPlacement` with the `Cell`s from a `Cage` placed within `Column`', () => {
        expect(new CellsPlacement([
            Cell.at(5, 3),
            Cell.at(6, 3)
        ])).toEqual({
            isSingleCell: false,
            isWithinRow: false,
            isWithinColumn: true,
            isWithinNonet: false,
            isWithinHouse: true,
            minRow: 5,
            minCol: 3,
            maxRow: 6,
            maxCol: 3
        } as CellsPlacement);
    });

    test('Construction of `CellsPlacement` with the `Cell`s from a `Cage` placed within `Nonet`', () => {
        expect(new CellsPlacement([
            Cell.at(0, 0), Cell.at(0, 1),
            Cell.at(1, 0), Cell.at(1, 1)
        ])).toEqual({
            isSingleCell: false,
            isWithinRow: false,
            isWithinColumn: false,
            isWithinNonet: true,
            isWithinHouse: true,
            minRow: 0,
            minCol: 0,
            maxRow: 1,
            maxCol: 1
        } as CellsPlacement);
    });

    test('Construction of `CellsPlacement` with the `Cell`s from a `Cage` placed within `Row` and `Nonet`', () => {
        expect(new CellsPlacement([
            Cell.at(0, 0), Cell.at(0, 1)
        ])).toEqual({
            isSingleCell: false,
            isWithinRow: true,
            isWithinColumn: false,
            isWithinNonet: true,
            isWithinHouse: true,
            minRow: 0,
            minCol: 0,
            maxRow: 0,
            maxCol: 1
        } as CellsPlacement);
    });

    test('Construction of `CellsPlacement` with the `Cell`s from a `Cage` placed within `Column` and `Nonet`', () => {
        expect(new CellsPlacement([
            Cell.at(0, 0),
            Cell.at(1, 0)
        ])).toEqual({
            isSingleCell: false,
            isWithinRow: false,
            isWithinColumn: true,
            isWithinNonet: true,
            isWithinHouse: true,
            minRow: 0,
            minCol: 0,
            maxRow: 1,
            maxCol: 0
        } as CellsPlacement);
    });

    test('Construction of `CellsPlacement` with the `Cell`s outside of a single `House`', () => {
        expect(new CellsPlacement([
            Cell.at(2, 2), Cell.at(2, 3),
            Cell.at(3, 2), Cell.at(3, 3)
        ])).toEqual({
            isSingleCell: false,
            isWithinRow: false,
            isWithinColumn: false,
            isWithinNonet: false,
            isWithinHouse: false,
            minRow: 2,
            minCol: 2,
            maxRow: 3,
            maxCol: 3
        } as CellsPlacement);
    });

});
