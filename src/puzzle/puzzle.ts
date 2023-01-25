import * as _ from 'lodash';
import { joinSet } from '../util/readableMessages';
import { Cage } from './cage';
import { Cell } from './cell';
import { Grid } from './grid';

type ReadonlyCages = ReadonlyArray<Cage>;
type ReadonlyCells = ReadonlyArray<Cell>;
type ReadonlyCellKeysSet = ReadonlySet<string>;

class Validator {
    validate(cages: ReadonlyCages) {
        Validator.validateCells(cages.flatMap(cage => cage.cells));
        Validator.validateCages(cages);
        return cages;
    }

    private static validateCells(cells: ReadonlyCells) {
        const { hasDuplicates, duplicates, hasMissing, missing } = new CellKeysWithinGrid(cells);

        if (hasMissing) {
            Validator.throwCellsValidationError(missing, 'missing');
        }
        if (hasDuplicates) {
            Validator.throwCellsValidationError(duplicates, 'duplicate');
        }
    }

    private static throwCellsValidationError(erroredKeys: ReadonlyCellKeysSet, type: string) {
        Validator.throwValidationError(`Found ${erroredKeys.size} ${type} cell(s): ${joinSet(erroredKeys)}`);
    }

    private static validateCages(cages: ReadonlyCages) {
        const totalSumOfCages = _.sum(cages.map(cage => cage.sum));
        if (totalSumOfCages !== Grid.TOTAL_SUM) {
            Validator.throwValidationError(`Expected sum of all cages to be ${Grid.TOTAL_SUM}. Actual: ${totalSumOfCages}`);
        }
    }

    private static throwValidationError(detailedMessage: string) {
        throw `Invalid puzzle. ${detailedMessage}`;
    }
}

class CellKeysWithinGrid {
    private readonly _unique = new Set<string>();
    private readonly _duplicates = new Set<string>();
    private readonly _missing = new Set<string>();

    constructor(cells: ReadonlyCells) {
        for (const cell of cells) {
            if (this._unique.has(cell.key)) {
                this._duplicates.add(cell.key);
            } else {
                this._unique.add(cell.key);
            }
        }

        if (this._unique.size < Grid.CELL_COUNT) {
            for (const { key } of Grid.cellsIterator()) {
                if (!this._unique.has(key)) {
                    this._missing.add(key);
                }
            }    
        }
    }

    get unique(): ReadonlyCellKeysSet {
        return this._unique;
    }

    get hasDuplicates() {
        return CellKeysWithinGrid.isNotEmpty(this._duplicates);
    }

    get duplicates(): ReadonlyCellKeysSet {
        return this._duplicates;
    }

    get hasMissing() {
        return CellKeysWithinGrid.isNotEmpty(this._missing);
    }

    get missing(): ReadonlyCellKeysSet {
        return this._missing;
    }

    private static isNotEmpty(set: ReadonlyCellKeysSet) {
        return set.size > 0;
    }
}

export class Puzzle {
    private static readonly _validator = new Validator();

    readonly cages: ReadonlyCages;

    constructor(cages: ReadonlyCages) {
        this.cages = [...Puzzle._validator.validate(cages)];
    }
}
