import _ from 'lodash';
import { Cell } from './cell';
import { Grid } from './grid';
import { cellSetAndDuplicatesOf } from '../util/uniqueCells';
import { valuesForMsg } from '../util/readableMessages';

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
        if (cellSet.size === Grid.CELL_COUNT) return;

        const missingCellKeys = Problem.#findMissingCellKeys(cellSet);
        const hasMissingCells = missingCellKeys.length > 0;
        const hasDuplicateCells = duplicateCellKeys.length > 0;

        if (hasMissingCells || hasDuplicateCells) {
            const message = new this.#Sentences();
            if (hasMissingCells) {
                message.add(`${missingCellKeys.length} missing cell(s): ${valuesForMsg(missingCellKeys)}`);
            }
            if (hasDuplicateCells) {
                message.add(`${duplicateCellKeys.length} duplicate cell(s): ${valuesForMsg(duplicateCellKeys)}`);
            }
            Problem.#throwValidationError(message);
        }
    }

    static #Sentences = class {
        #message = '';

        add(sentence) {
            if (this.#message.length > 0) {
                this.#message = `${this.#message}. ${sentence}`;
            } else {
                this.#message = sentence;
            }
        }

        toString() {
            return this.#message;
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
