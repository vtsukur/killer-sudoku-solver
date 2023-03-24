import { ReadonlyCells } from './cell';

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
            const firstCell = cells[0];

            const refRow = firstCell.row;
            const refCol = firstCell.col;
            const refNonet = firstCell.nonet;

            let isWithinRow = true;
            let isWithinColumn = true;
            let isWithinNonet = true;

            let i = 1;
            do {
                const cell = cells[i];
                if (isWithinRow && refRow !== cell.row) {
                    isWithinRow = false;
                }
                if (isWithinColumn && refCol !== cell.col) {
                    isWithinColumn = false;
                }
                if (isWithinNonet && refNonet !== cell.nonet) {
                    isWithinNonet = false;
                }
            } while (++i < cells.length);

            this.isWithinRow = isWithinRow;
            this.isWithinColumn = isWithinColumn;
            this.isWithinNonet = isWithinNonet;

            this.isWithinHouse = this.isWithinRow || this.isWithinColumn || this.isWithinNonet;
        }
    }

}
