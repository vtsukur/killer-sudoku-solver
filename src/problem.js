export const GRID_SIDE_LENGTH = 9;
export const UNIQUE_SEGMENT_SUM = 45;
export const GRID_SUM = GRID_SIDE_LENGTH * UNIQUE_SEGMENT_SUM;
export const GRID_CELL_COUNT = GRID_SIDE_LENGTH * GRID_SIDE_LENGTH;

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

export class InputCell {
    constructor(row, col) {
        this.row = row;
        this.col = col;
    }

    isWithinRange() {
        return this.#coordWithinRange(this.row) && this.#coordWithinRange(this.col);
    }

    #coordWithinRange(i) {
        return i >= 1 && i <= GRID_SIDE_LENGTH;
    }

    toString() {
        return `(${this.row}, ${this.col})`;
    }
}
