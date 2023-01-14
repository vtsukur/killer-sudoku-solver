import * as _ from 'lodash';
import { joinSet } from '../util/readableMessages';
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
        const { hasDuplicates, duplicates, hasMissing, missing } = new CellKeysWithinGrid(cells);

        if (hasMissing) {
            Puzzle.throwValidationError(`Found ${missing.size} missing cell(s): ${joinSet(missing)}`);
        }
        if (hasDuplicates) {
            Puzzle.throwValidationError(`Found ${duplicates.size} duplicate cell(s): ${joinSet(duplicates)}`);
        }
    }

    private static validateCages(cages: Array<Cage>) {
        const totalSumOfCages = _.sum(cages.map(cage => cage.sum));
        if (totalSumOfCages !== Grid.TOTAL_SUM) {
            this.throwValidationError(`Expected sum of all cages to be ${Grid.TOTAL_SUM}. Actual: ${totalSumOfCages}`);
        }
    }

    static throwValidationError(detailedMessage: string) {
        throw `Invalid puzzle. ${detailedMessage}`;
    }
}

class CellKeysWithinGrid {
    readonly unique: ReadonlySet<string>;
    readonly duplicates: ReadonlySet<string>;
    readonly missing: ReadonlySet<string>;

    constructor(cells: Array<Cell>) {
        const unique = this.unique = new Set<string>();
        const duplicates = this.duplicates = new Set<string>();
        const missing = this.missing = new Set<string>();

        for (const cell of cells) {
            if (unique.has(cell.key)) {
                duplicates.add(cell.key);
            } else {
                unique.add(cell.key);
            }
        }

        if (unique.size < Grid.CELL_COUNT) {
            for (const { key } of Grid.cellsIterator()) {
                if (!unique.has(key)) {
                    missing.add(key);
                }
            }    
        }
    }

    get hasDuplicates() {
        return CellKeysWithinGrid.isNotEmpty(this.duplicates);
    }

    get hasMissing() {
        return CellKeysWithinGrid.isNotEmpty(this.missing);
    }

    private static isNotEmpty(set: ReadonlySet<string>) {
        return set.size > 0;
    }
}
