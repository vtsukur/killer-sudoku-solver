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
        const uniqueKeys = this.validateForDuplicateCells(cells);
        this.validateForMissingCells(uniqueKeys);
    }

    private static validateForDuplicateCells(cells: ReadonlyCells) {
        const uniqueKeys = new Set<string>();
        const duplicateKeys = new Set<string>();
        for (const cell of cells) {
            if (uniqueKeys.has(cell.key)) {
                duplicateKeys.add(cell.key);
            } else {
                uniqueKeys.add(cell.key);
            }
        }
        if (duplicateKeys.size > 0) {
            this.throwCellsValidationError(duplicateKeys, 'duplicate');
        }
        return uniqueKeys;
    }

    private static validateForMissingCells(unique: ReadonlyCellKeysSet) {
        const missingKeys = new Set<string>();
        if (unique.size < Grid.CELL_COUNT) {
            for (const { key } of Grid.cellsIterator()) {
                if (!unique.has(key)) {
                    missingKeys.add(key);
                }
            }    
            if (missingKeys.size > 0) {
                this.throwCellsValidationError(missingKeys, 'missing');
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
