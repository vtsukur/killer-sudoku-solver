import { Cell, ReadonlyCells } from './cell';

export class CellsPositioning {

    readonly isSingleCell;
    readonly isWithinRow;
    readonly isWithinColumn;
    readonly isWithinNonet;
    readonly isWithinHouse;

    constructor(cells: ReadonlyCells) {
        this.isSingleCell = cells.length === 1;
        this.isWithinRow = this.isSingleCell || CellsPositioning.isSameForAll(cells, (cell: Cell) => cell.row);
        this.isWithinColumn = this.isSingleCell || CellsPositioning.isSameForAll(cells, (cell: Cell) => cell.col);
        this.isWithinNonet = this.isSingleCell || CellsPositioning.isSameForAll(cells, (cell: Cell) => cell.nonet);
        this.isWithinHouse = this.isWithinRow || this.isWithinColumn || this.isWithinNonet;
    }

    private static isSameForAll(cells: ReadonlyCells, whatFn: (cell: Cell) => number) {
        return new Set(cells.map(whatFn)).size === 1;
    }

}
