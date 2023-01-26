import * as _ from 'lodash';
import { joinSet } from '../util/readableMessages';
import { ReadonlyCages } from './cage';
import { ReadonlyCellKeysSet, ReadonlyCells } from './cell';
import { Grid } from './grid';

export class Puzzle {
    readonly cages: ReadonlyCages;

    constructor(cages: ReadonlyCages) {
        Puzzle.validateForDuplicateAndMissingCells(cages.flatMap(cage => cage.cells));
        Puzzle.validateSumOfCagesToEqualGridSum(cages);
        this.cages = [...cages];
    }

    private static validateForDuplicateAndMissingCells(cells: ReadonlyCells) {
        const unique = new Set<string>();
        const duplicates = new Set<string>();
        for (const cell of cells) {
            if (unique.has(cell.key)) {
                duplicates.add(cell.key);
            } else {
                unique.add(cell.key);
            }
        }
        if (duplicates.size > 0) {
            this.throwCellsValidationError(duplicates, 'duplicate');
        }

        const missing = new Set<string>();
        if (unique.size < Grid.CELL_COUNT) {
            for (const { key } of Grid.cellsIterator()) {
                if (!unique.has(key)) {
                    missing.add(key);
                }
            }    
            if (missing.size > 0) {
                this.throwCellsValidationError(missing, 'missing');
            }
        }
    }

    private static throwCellsValidationError(erroredKeys: ReadonlyCellKeysSet, type: string) {
        Puzzle.throwValidationError(`Found ${erroredKeys.size} ${type} cell(s): ${joinSet(erroredKeys)}`);
    }

    private static validateSumOfCagesToEqualGridSum(cages: ReadonlyCages) {
        const sumOfCages = _.sum(cages.map(cage => cage.sum));
        if (sumOfCages !== Grid.SUM) {
            Puzzle.throwValidationError(`Expected sum of cages to equal grid sum of ${Grid.SUM}. Actual: ${sumOfCages}`);
        }
    }

    private static throwValidationError(detailedMessage: string) {
        throw `Invalid puzzle. ${detailedMessage}`;
    }
}
