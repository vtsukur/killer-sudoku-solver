import _ from 'lodash';

export const SIZE = 9;
export const LINE_OR_SECTION_SUM = 45;
export const FIELD_SUM = SIZE * LINE_OR_SECTION_SUM;
export const CELLS_ON_THE_FIELD = SIZE * SIZE;

export class Problem {
    constructor(inputSums) {
        this.inputSums = [...inputSums];
    }
    
    checkCorrectness() {
        const cells = this.inputSums.flatMap(sum => sum.cells);
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

        const actualFieldSum = this.inputSums.reduce((prev, current) => prev + current.value, 0);
        if (actualFieldSum !== FIELD_SUM) {
           this.#throwValidationError(`Expected field sum: ${FIELD_SUM}. Actual: ${actualFieldSum}`);
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

    addCell(cell) {
        this.cells.push(cell);
    }
}

export class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    isWithinRange() {
        return this.#coordWithinRange(this.x) && this.#coordWithinRange(this.y);
    }

    #coordWithinRange(i) {
        return i >= 1 && i <= SIZE;
    }

    toString() {
        return `(${this.x}, ${this.y})`;
    }
}
