import _ from 'lodash';
import { Cell } from './cell';
import { Grid } from './grid';
import { cellSetAndDuplicatesOf } from './uniqueCells';

export class Problem {
    constructor(cages) {
        Problem.#validate(cages);
        this.cages = [...cages];
    }

    static #validate(cages) {
        Problem.#validateCageCells(cages.flatMap(cage => cage.cells));
        Problem.#validateCages(cages);
    }

    static #validateCageCells(cells) {
        const { cellSet, duplicateCellKeys } = cellSetAndDuplicatesOf(cells);
        if (cellSet.size === Grid.CELL_COUNT) return;

        const missingCellKeys = Problem.#findMissingCellKeys(cellSet);
        const hasMissingCells = missingCellKeys.length > 0;
        const hasDuplicateCells = duplicateCellKeys.length > 0;

        if (hasMissingCells || hasDuplicateCells) {
            let message = '';
            if (hasMissingCells) {
                message = `${missingCellKeys.length} missing cell(s): ${missingCellKeys.join(', ')}. `;
            }
            if (hasDuplicateCells) {
                message = `${message}${duplicateCellKeys.length} duplicate cell(s): ${duplicateCellKeys.join(', ')}.`
            }
            // removing trailing whitespaces and last dot.
            message = message.trim().slice(0, -1);
            Problem.#throwValidationError(message);
        }
    }

    static #findMissingCellKeys(cellSet) {
        const missing = [];
        _.range(Grid.SIDE_LENGTH).forEach(row => {
            _.range(Grid.SIDE_LENGTH).forEach(col => {
                const cellKey = Cell.keyOf(row, col);
                if (!cellSet.has(cellKey)) {
                    missing.push(cellKey);
                }
            });
        });
        return missing;
    }

    static #validateCages(cages) {
        const actualGridSum = cages.reduce((prev, current) => prev + current.sum, 0);
        if (actualGridSum !== Grid.TOTAL_SUM) {
            this.#throwValidationError(`Expected sum of all cages to be ${Grid.TOTAL_SUM}. Actual: ${actualGridSum}`);
        }
    }

    static #throwValidationError(detailedMessage) {
        throw `Invalid problem. ${detailedMessage}`;
    }
}
