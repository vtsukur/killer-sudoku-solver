import _ from 'lodash';
import { joinForReadability } from '../util/readableMessages';
import { cellSetAndDuplicatesOf } from '../util/uniqueCells';
import { Cell } from './cell';
import { Grid } from './grid';

export class Puzzle {
    #cages;

    constructor(cages) {
        this.#cages = [...Puzzle.#validate(cages)];
    }

    static #validate(cages) {
        Puzzle.#validateCageCells(cages.flatMap(cage => cage.cells));
        Puzzle.#validateCages(cages);
        return cages;
    }

    static #validateCageCells(cells) {
        const { cellSet, duplicateCellKeys } = cellSetAndDuplicatesOf(cells);
        if (cellSet.size === Grid.CELL_COUNT) return; // cellSet size cannot be >Grid.CELL_COUNT since Cell and Cage construction control that

        const missingCellKeys = Puzzle.#findMissingCellKeys(cellSet);

        let message = `${missingCellKeys.length} missing cell(s): ${joinForReadability(missingCellKeys)}`;
        if (duplicateCellKeys.length > 0) {
            message = `${message}. ${duplicateCellKeys.length} duplicate cell(s): ${joinForReadability(duplicateCellKeys)}`;
        }
        Puzzle.#throwValidationError(message);
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
        throw `Invalid puzzle. ${detailedMessage}`;
    }

    get cages() {
        return this.#cages;
    }
}
