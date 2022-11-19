import { GRID_CELL_COUNT, GRID_SUM } from './constants';

export class Problem {
    constructor(cages) {
        this.cages = [...cages];
        this.cells = this.cages.map(cage => cage.cells).flat();
        this.#validate();
    }

    #validate() {
        const cells = this.cages.flatMap(cage => cage.cells);
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

        const actualGridSum = this.cages.reduce((prev, current) => prev + current.value, 0);
        if (actualGridSum !== GRID_SUM) {
            this.#throwValidationError(`Expected field cage: ${GRID_SUM}. Actual: ${actualGridSum}`);
        }
    }

    #throwValidationError(detailedMessage) {
        throw `Invalid problem definiton. ${detailedMessage}`;
    }
}
