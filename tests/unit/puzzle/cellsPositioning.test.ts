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

    test('Construction of `CellsPositioning` with the `Cell`s from a `Cage` placed within `Row`', () => {
        const positioning = new CellsPositioning([
            Cell.at(3, 5), Cell.at(3, 6)
        ]);

        expect(positioning).toEqual({
            isSingleCell: false,
            isWithinRow: true,
            isWithinColumn: false,
            isWithinNonet: false,
            isWithinHouse: true
        } as CellsPositioning);
    });

    test('Construction of `CellsPositioning` with the `Cell`s from a `Cage` placed within `Column`', () => {
        const positioning = new CellsPositioning([
            Cell.at(5, 3),
            Cell.at(6, 3)
        ]);

        expect(positioning).toEqual({
            isSingleCell: false,
            isWithinRow: false,
            isWithinColumn: true,
            isWithinNonet: false,
            isWithinHouse: true
        } as CellsPositioning);
    });

    test('Construction of `CellsPositioning` with the `Cell`s from a `Cage` placed within `Nonet`', () => {
        const positioning = new CellsPositioning([
            Cell.at(0, 0), Cell.at(0, 1),
            Cell.at(1, 0), Cell.at(1, 1)
        ]);

        expect(positioning).toEqual({
            isSingleCell: false,
            isWithinRow: false,
            isWithinColumn: false,
            isWithinNonet: true,
            isWithinHouse: true
        } as CellsPositioning);
    });

    test('Construction of `CellsPositioning` with the `Cell`s from a `Cage` placed within `Row` and `Nonet`', () => {
        const positioning = new CellsPositioning([
            Cell.at(0, 0), Cell.at(0, 1)
        ]);

        expect(positioning).toEqual({
            isSingleCell: false,
            isWithinRow: true,
            isWithinColumn: false,
            isWithinNonet: true,
            isWithinHouse: true
        } as CellsPositioning);
    });

    test('Construction of `CellsPositioning` with the `Cell`s from a `Cage` placed within `Column` and `Nonet`', () => {
        const positioning = new CellsPositioning([
            Cell.at(0, 0),
            Cell.at(1, 0)
        ]);

        expect(positioning).toEqual({
            isSingleCell: false,
            isWithinRow: false,
            isWithinColumn: true,
            isWithinNonet: true,
            isWithinHouse: true
        } as CellsPositioning);
    });

    test('Construction of `CellsPositioning` with the `Cell`s outside of a single `House`', () => {
        const positioning = new CellsPositioning([
            Cell.at(2, 2), Cell.at(2, 3),
            Cell.at(3, 2), Cell.at(3, 3)
        ]);

        expect(positioning).toEqual({
            isSingleCell: false,
            isWithinRow: false,
            isWithinColumn: false,
            isWithinNonet: false,
            isWithinHouse: false
        } as CellsPositioning);
    });

});
