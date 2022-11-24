import _ from 'lodash';
import { valuesForMsg } from '../util/readableMessages';
import { cellSetAndDuplicatesOf } from '../util/uniqueCells';
import { Cell } from './cell';
import { Grid } from './grid';

export class Problem {
    #cages;

    constructor(cages) {
        this.#cages = [...Problem.#validate(cages)];
    }

    static #validate(cages) {
        Problem.#validateCageCells(cages.flatMap(cage => cage.cells));
        Problem.#validateCages(cages);
        return cages;
    }

    static #validateCageCells(cells) {
        const { cellSet, duplicateCellKeys } = cellSetAndDuplicatesOf(cells);
        if (cellSet.size === Grid.CELL_COUNT) return; // cellSet size cannot be >Grid.CELL_COUNT since Cell and Cage construction control that

        const missingCellKeys = Problem.#findMissingCellKeys(cellSet);

        let message = `${missingCellKeys.length} missing cell(s): ${valuesForMsg(missingCellKeys)}`;
        if (duplicateCellKeys.length > 0) {
            message = `${message}. ${duplicateCellKeys.length} duplicate cell(s): ${valuesForMsg(duplicateCellKeys)}`;
        }
        Problem.#throwValidationError(message);
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
        const actualGridSum = _.sum(cages.map(cage => cage.sum));
        if (actualGridSum !== Grid.TOTAL_SUM) {
            this.#throwValidationError(`Expected sum of all cages to be ${Grid.TOTAL_SUM}. Actual: ${actualGridSum}`);
        }
    }

    static #throwValidationError(detailedMessage) {
        throw `Invalid problem. ${detailedMessage}`;
    }

    get cages() {
        return this.#cages;
    }
}
