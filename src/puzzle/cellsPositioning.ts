import { Cell, ReadonlyCells } from './cell';

export class CellsPositioning {

    readonly cells;
    readonly isSingleCellCage;
    readonly isWithinRow;
    readonly isWithinColumn;
    readonly isWithinNonet;
    readonly isWithinHouse;

    constructor(cells: ReadonlyCells) {
        this.cells = cells;
        this.isSingleCellCage = cells.length === 1;
        this.isWithinRow = this.isSingleCellCage || this.isSameForAll((cell: Cell) => cell.row);
        this.isWithinColumn = this.isSingleCellCage || this.isSameForAll((cell: Cell) => cell.col);
        this.isWithinNonet = this.isSingleCellCage || this.isSameForAll((cell: Cell) => cell.nonet);
        this.isWithinHouse = this.isWithinRow || this.isWithinColumn || this.isWithinNonet;
    }

    private isSameForAll(whatFn: (cell: Cell) => number) {
        return new Set(this.cells.map(whatFn)).size === 1;
    }

    static isWithinHouse(cells: ReadonlyCells): boolean {
        return new CellsPositioning(cells).isWithinHouse;
    }

}
