import { Grid } from './grid';

export class Problem {
    constructor(cages) {
        this.cages = [...cages];
        this.#validate();
    }

    #validate() {
        const cells = this.cages.flatMap(cage => cage.cells);
        if (cells.length !== Grid.CELL_COUNT) {
            this.#throwValidationError(`Expected cell count: ${Grid.CELL_COUNT}. Actual: ${cells.length}`);
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

        const actualGridSum = this.cages.reduce((prev, current) => prev + current.sum, 0);
        if (actualGridSum !== Grid.TOTAL_SUM) {
            this.#throwValidationError(`Expected field cage: ${Grid.TOTAL_SUM}. Actual: ${actualGridSum}`);
        }
    }

    #throwValidationError(detailedMessage) {
        throw `Invalid problem. ${detailedMessage}`;
    }
}
