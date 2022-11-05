export const UNIQUE_SEGMENT_LENGTH = 9;
export const UNIQUE_SEGMENT_COUNT = UNIQUE_SEGMENT_LENGTH;
export const SUBGRID_SIDE_LENGTH = 3;
export const UNIQUE_SEGMENT_SUM = 45;
export const GRID_SUM = UNIQUE_SEGMENT_COUNT * UNIQUE_SEGMENT_SUM;
export const GRID_CELL_COUNT = UNIQUE_SEGMENT_COUNT * UNIQUE_SEGMENT_LENGTH;

export class Problem {
    constructor(sums) {
        this.sums = [...sums];
    }

    checkCorrectness() {
        const cells = this.sums.flatMap(sum => sum.cells);
        if (cells.length !== GRID_CELL_COUNT) {
            this.#throwValidationError(`Expected cell count: ${GRID_CELL_COUNT}. Actual: ${cells.length}`);
        }

        const cellSet = new Set();
        cells.forEach(cell => {
            if (!cell.isWithinRange()) {
                this.#throwValidationError(`Expected cell to be within the field. Actual cell: ${cell}`);
            }
            if (cellSet.has(cell.toString())) {
                this.#throwValidationError(`Found cell duplicate: ${cell}`);
            }
            cellSet.add(cell.toString());
        });

        const actualFieldSum = this.sums.reduce((prev, current) => prev + current.value, 0);
        if (actualFieldSum !== GRID_SUM) {
            this.#throwValidationError(`Expected field sum: ${GRID_SUM}. Actual: ${actualFieldSum}`);
        }
    }

    #throwValidationError(detailedMessage) {
        throw `Invalid problem definiton. ${detailedMessage}`;
    }
}

export class InputSum {
    constructor(value, cells = []) {
        this.value = value;
        this.cells = [...cells];
    }

    get cellCount() {
        return this.cells.length
    }

    addCell(cell) {
        this.cells.push(cell);
    }
}

export class Cell {
    constructor(rowIdx, colIdx) {
        this.rowIdx = rowIdx;
        this.colIdx = colIdx;
        this.subgridIdx = Math.floor(rowIdx / SUBGRID_SIDE_LENGTH) * SUBGRID_SIDE_LENGTH + Math.floor(colIdx / SUBGRID_SIDE_LENGTH);
    }

    isWithinRange() {
        return this.#coordWithinRange(this.rowIdx) && this.#coordWithinRange(this.colIdx);
    }

    #coordWithinRange(i) {
        return i >= 0 && i < UNIQUE_SEGMENT_LENGTH;
    }

    toString() {
        return `(${this.rowIdx}, ${this.colIdx})`;
    }
}
