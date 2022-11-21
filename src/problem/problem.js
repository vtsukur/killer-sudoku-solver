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
        Problem.#checkCellsForDuplicates(cellMap);
        Problem.#checkForMissingCells(cellMap);
    }

    static #fillSameCellCountMap(cells) {
        const cellMap = new Map();
        cells.forEach(cell => {
            const value = cellMap.get(cell.key());
            cellMap.set(cell.key(), value ? value + 1 : 1);
        });
        return cellMap;
    }

    static #checkCellsForDuplicates(cellMap) {
        const duplicates = [];
        for (const sameCellCountEntry of cellMap.entries()) {
            const cellKey = sameCellCountEntry[0];
            const sameCellCount = sameCellCountEntry[1];
            if (sameCellCount > 1) {
                duplicates.push(cellKey);
            }
        }

        if (duplicates.length > 0) {
            Problem.#throwValidationError(`${duplicates.length} duplicate cell(s): ${duplicates.join(', ')}`);
        }
    }

    static #checkForMissingCells(cellMap) {
        if (cellMap.size === Grid.CELL_COUNT) return;

        const missing = [];
        _.range(Grid.SIDE_LENGTH).forEach(row => {
            _.range(Grid.SIDE_LENGTH).forEach(col => {
                const cellKey = new Cell(row, col).key();
                if (!cellMap.has(cellKey)) {
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
