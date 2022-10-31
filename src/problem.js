export const SIZE = 9;
export const LINE_OR_SECTION_SUM = 45;
export const FIELD_SUM = SIZE * LINE_OR_SECTION_SUM;
export const CELLS_ON_THE_FIELD = SIZE * SIZE;

export class Problem {
    constructor(sums) {
        this.sums = [...sums];
    }
    
    checkCorrectness() {
        const cells = this.sums.flatMap(sum => sum.cells);
        if (cells.length !== CELLS_ON_THE_FIELD) {
            this.#throwValidationError(`Expected cell count: ${CELLS_ON_THE_FIELD}. Actual: ${cells.length}`);
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
        if (actualFieldSum !== FIELD_SUM) {
           this.#throwValidationError(`Expected field sum: ${FIELD_SUM}. Actual: ${actualFieldSum}`);
        }
    }

    #throwValidationError(detailedMessage) {
        throw `Invalid problem definiton. ${detailedMessage}`;
    }
}

export class Sum {
    constructor(value, cells = []) {
        this.value = value;
        this.cells = [...cells];
    }

    addCell(cell) {
        this.cells.push(cell);
    }
}

export class Cell {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.subgridIndex = Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3);
    }

    isWithinRange() {
        return this.#coordWithinRange(this.row) && this.#coordWithinRange(this.col);
    }

    #coordWithinRange(i) {
        return i >= 1 && i <= SIZE;
    }

    toString() {
        return `(${this.row}, ${this.col})`;
    }
}
