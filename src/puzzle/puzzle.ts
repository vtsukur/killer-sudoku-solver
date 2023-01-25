import * as _ from 'lodash';
import { joinSet } from '../util/readableMessages';
import { Cage } from './cage';
import { Cell } from './cell';
import { Grid } from './grid';

class Validator {
    validate(cages: Array<Cage>) {
        this.validateCells(cages.flatMap(cage => cage.cells));
        this.validateCages(cages);
        return cages;
    }

    private validateCells(cells: Array<Cell>) {
        const { hasDuplicates, duplicates, hasMissing, missing } = new CellKeysWithinGrid(cells);

        if (hasMissing) {
            this.throwCellsValidationError(missing, 'missing');
        }
        if (hasDuplicates) {
            this.throwCellsValidationError(duplicates, 'duplicate');
        }
    }

    private throwCellsValidationError(errored: ReadonlySet<string>, type: string) {
        this.throwValidationError(`Found ${errored.size} ${type} cell(s): ${joinSet(errored)}`);
    }

    private validateCages(cages: Array<Cage>) {
        const totalSumOfCages = _.sum(cages.map(cage => cage.sum));
        if (totalSumOfCages !== Grid.TOTAL_SUM) {
            this.throwValidationError(`Expected sum of all cages to be ${Grid.TOTAL_SUM}. Actual: ${totalSumOfCages}`);
        }
    }

    private throwValidationError(detailedMessage: string) {
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

export class Puzzle {
    readonly cages: Array<Cage>;

    private static readonly _validator = new Validator();

    constructor(cages: Array<Cage>) {
        this.cages = [...Puzzle._validator.validate(cages)];
    }
}
