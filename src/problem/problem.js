import _ from 'lodash';
import { Cell } from './cell';
import { Grid } from './grid';

export class Problem {
    constructor(cages) {
        Problem.#validate(cages);
        this.cages = [...cages];
    }

    static #validate(cages) {
        Problem.#checkCells(cages.flatMap(cage => cage.cells));
        Problem.#checkCages(cages);
    }

    static #checkCells(cells) {
        const cellSet = Problem.#checkCellsForDuplicates(cells);
        Problem.#checkForMissingCells(cells, cellSet);
    }

    static #checkCellsForDuplicates(cells) {
        const duplicates = [];

        const cellSet = new Set();
        cells.forEach(cell => {
            if (cellSet.has(cell.key())) {
                duplicates.push(cell.key());
            }
            cellSet.add(cell.key());
        });
        if (duplicates.length > 0) {
            Problem.#throwValidationError(`${duplicates.length} duplicate cell(s): ${duplicates.join(', ')}`);
        }

        return cellSet;
    }

    static #checkForMissingCells(cells, cellSet) {
        if (cells.length === Grid.CELL_COUNT) return;

        const missing = [];
        _.range(Grid.SIDE_LENGTH).forEach(row => {
            _.range(Grid.SIDE_LENGTH).forEach(col => {
                const cellKey = new Cell(row, col).key();
                if (!cellSet.has(cellKey)) {
                    missing.push(cellKey);
                }
            });
        });
        this.#throwValidationError(`Missing ${missing.length} cell(s): ${missing.join(', ')}`);
    }

    static #checkCages(cages) {
        const actualGridSum = cages.reduce((prev, current) => prev + current.sum, 0);
        if (actualGridSum !== Grid.TOTAL_SUM) {
            this.#throwValidationError(`Expected sum of all cages to be ${Grid.TOTAL_SUM}. Actual: ${actualGridSum}`);
        }
    }

    static #throwValidationError(detailedMessage) {
        throw `Invalid problem. ${detailedMessage}`;
    }
}
