import { Cell } from '../../../src/puzzle/cell';
import { CellsPlacement } from '../../../src/puzzle/cellsPlacement';

describe('Unit tests for `CellsPlacement`', () => {

    test('Construction of `CellsPlacement` with a single `Cell`', () => {
        expect(new CellsPlacement([ Cell.at(3, 4) ])).toEqual({
            isSingleCell: true,
            isWithinRow: true,
            isWithinColumn: true,
            isWithinNonet: true,
            isWithinHouse: true
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
            isWithinHouse: true
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
            isWithinHouse: true
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
            isWithinHouse: true
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
            isWithinHouse: true
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
            isWithinHouse: true
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
            isWithinHouse: false
        } as CellsPlacement);
    });

});
