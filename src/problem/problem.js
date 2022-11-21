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
        const cellMap = Problem.#fillSameCellCountMap(cells);
        if (cellMap.size === Grid.CELL_COUNT) return;

        const missing = Problem.#findMissingCells(cellMap);
        const hasMissing = missing.length > 0;
        const duplicates = Problem.#findDuplicateCells(cellMap);
        const hasDuplicates = duplicates.length > 0;

        if (hasMissing || hasDuplicates) {
            let message = '';

            if (hasMissing) {
                message = `${missing.length} missing cell(s): ${missing.join(', ')}. `;
            }
            if (hasDuplicates) {
                message = `${message}${duplicates.length} duplicate cell(s): ${duplicates.join(', ')}.`
            }
            Problem.#throwValidationError(message.trim().slice(0, -1));
        }
    }

    static #fillSameCellCountMap(cells) {
        const cellMap = new Map();
        cells.forEach(cell => {
            const value = cellMap.get(cell.key());
            cellMap.set(cell.key(), value ? value + 1 : 1);
        });
        return cellMap;
    }

    static #findDuplicateCells(cellMap) {
        const duplicates = [];
        for (const sameCellCountEntry of cellMap.entries()) {
            const cellKey = sameCellCountEntry[0];
            const sameCellCount = sameCellCountEntry[1];
            if (sameCellCount > 1) {
                duplicates.push(cellKey);
            }
        }
        return duplicates;
    }

    static #findMissingCells(cellMap) {
        const missing = [];
        _.range(Grid.SIDE_LENGTH).forEach(row => {
            _.range(Grid.SIDE_LENGTH).forEach(col => {
                const cellKey = new Cell(row, col).key();
                if (!cellMap.has(cellKey)) {
                    missing.push(cellKey);
                }
            });
        });
        return missing;
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
