import { Cell, ReadonlyCells } from './cell';

export class CellsPositioning {

    readonly isSingleCellCage;
    readonly isWithinRow;
    readonly isWithinColumn;
    readonly isWithinNonet;
    readonly isWithinHouse;

    constructor(cells: ReadonlyCells) {
        this.isSingleCellCage = cells.length === 1;
        this.isWithinRow = this.isSingleCellCage || CellsPositioning.isSameForAll(cells, (cell: Cell) => cell.row);
        this.isWithinColumn = this.isSingleCellCage || CellsPositioning.isSameForAll(cells, (cell: Cell) => cell.col);
        this.isWithinNonet = this.isSingleCellCage || CellsPositioning.isSameForAll(cells, (cell: Cell) => cell.nonet);
        this.isWithinHouse = this.isWithinRow || this.isWithinColumn || this.isWithinNonet;
    }

    private static isSameForAll(cells: ReadonlyCells, whatFn: (cell: Cell) => number) {
        return new Set(cells.map(whatFn)).size === 1;
    }

}
