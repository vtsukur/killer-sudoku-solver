import * as _ from 'lodash';
import { joinForReadability } from '../util/readableMessages';
import { Cage } from './cage';
import { Cell } from './cell';
import { Grid } from './grid';

export class Puzzle {
    readonly cages: Array<Cage>;

    constructor(cages: Array<Cage>) {
        this.cages = [...Puzzle.validate(cages)];
    }

    private static validate(cages: Array<Cage>) {
        Puzzle.validateCageCells(cages.flatMap(cage => cage.cells));
        Puzzle.validateCages(cages);
        return cages;
    }

    private static validateCageCells(cells: Array<Cell>) {
        const { set, duplicateKeys } = Cell.setAndDuplicateKeysOf(cells);
        if (set.size === Grid.CELL_COUNT) return; // cellSet size cannot be >Grid.CELL_COUNT since Cell and Cage construction control that

        const missingCellKeys = Puzzle.findMissingCellKeys(set);

        let message = `${missingCellKeys.length} missing cell(s): ${joinForReadability(missingCellKeys)}`;
        if (duplicateKeys.length > 0) {
            message = `${message}. ${duplicateKeys.length} duplicate cell(s): ${joinForReadability(duplicateKeys)}`;
        }
        Puzzle.throwValidationError(message);
    }

    private static findMissingCellKeys(cellSet: Set<string>) {
        const missing = new Array<string>();
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

    private static validateCages(cages: Array<Cage>) {
        const actualGridSum = _.sum(cages.map(cage => cage.sum));
        if (actualGridSum !== Grid.TOTAL_SUM) {
            this.throwValidationError(`Expected sum of all cages to be ${Grid.TOTAL_SUM}. Actual: ${actualGridSum}`);
        }
    }

    static throwValidationError(detailedMessage: string) {
        throw `Invalid puzzle. ${detailedMessage}`;
    }
}
