import * as _ from 'lodash';
import { joinSet } from '../util/readableMessages';
import { Cage } from './cage';
import { Cell, CellsKeys } from './cell';
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
        const { all, duplicates } = new CellsKeys(cells);
        if (all.size === Grid.CELL_COUNT) return; // cellSet size cannot be >Grid.CELL_COUNT since Cell and Cage construction control that

        const missingCellKeys = Puzzle.findMissingCellKeys(all);

        let message = `${missingCellKeys.size} missing cell(s): ${joinSet(missingCellKeys)}`;
        if (duplicates.size > 0) {
            message = `${message}. ${duplicates.size} duplicate cell(s): ${joinSet(duplicates)}`;
        }
        Puzzle.throwValidationError(message);
    }

    private static findMissingCellKeys(cellSet: ReadonlySet<string>): ReadonlySet<string> {
        const missing = new Set<string>();
        _.range(Grid.SIDE_LENGTH).forEach(row => {
            _.range(Grid.SIDE_LENGTH).forEach(col => {
                const cellKey = Cell.keyOf(row, col);
                if (!cellSet.has(cellKey)) {
                    missing.add(cellKey);
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
