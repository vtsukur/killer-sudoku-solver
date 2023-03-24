import { Cell, ReadonlyCells } from './cell';

export class CellsPositioning {

    readonly isSingleCell: boolean;
    readonly isWithinRow: boolean;
    readonly isWithinColumn: boolean;
    readonly isWithinNonet: boolean;
    readonly isWithinHouse: boolean;

    constructor(cells: ReadonlyCells) {
        this.isSingleCell = cells.length === 1;
        if (this.isSingleCell) {
            this.isWithinRow = this.isWithinColumn = this.isWithinNonet = this.isWithinHouse = true;
        } else {
            this.isWithinRow = CellsPositioning.isSameForAll(cells, (cell: Cell) => cell.row);
            this.isWithinColumn = CellsPositioning.isSameForAll(cells, (cell: Cell) => cell.col);
            this.isWithinNonet = CellsPositioning.isSameForAll(cells, (cell: Cell) => cell.nonet);
            this.isWithinHouse = this.isWithinRow || this.isWithinColumn || this.isWithinNonet;
        }
    }

    private static isSameForAll(cells: ReadonlyCells, whatFn: (cell: Cell) => number) {
        return new Set(cells.map(whatFn)).size === 1;
    }

}
