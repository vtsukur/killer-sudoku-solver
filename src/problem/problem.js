import { GRID_CELL_COUNT, GRID_SUM } from './constants';

export class Problem {
    constructor(sums) {
        this.sums = [...sums];
        this.cells = this.sums.map(sum => sum.cells).flat();
        this.#validate();
    }

    #validate() {
        const cells = this.sums.flatMap(sum => sum.cells);
        if (cells.length !== GRID_CELL_COUNT) {
            this.#throwValidationError(`Expected cell count: ${GRID_CELL_COUNT}. Actual: ${cells.length}`);
        }

        const cellSet = new Set();
        cells.forEach(cell => {
            if (!cell.isWithinRange()) {
                this.#throwValidationError(`Expected cell to be within the field. Actual cell: ${cell}`);
            }
            if (cellSet.has(cell.key())) {
                this.#throwValidationError(`Found cell duplicate: ${cell}`);
            }
            cellSet.add(cell.key());
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
