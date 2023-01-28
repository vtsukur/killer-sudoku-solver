import * as _ from 'lodash';
import { joinArray } from '../util/readableMessages';
import { Cell, CellKeysSet, Cells, ReadonlyCells } from './cell';
import { Grid } from './grid';
import { HouseIndex } from './house';

export class Cage {
    readonly sum: number;
    readonly cells: ReadonlyCells;
    readonly key: string;

    private constructor(sum: number, cells: ReadonlyCells) {
        this.sum = sum;
        this.cells = [...cells].sort();
        this.key = Cage.keyOf(sum, this.cells);
    }

    private static keyOf(sum: number, cells: ReadonlyCells) {
        return `${sum} [${joinArray(cells)}]`;
    }

    static ofSum(sum: number) {
        Cage.validateSum(sum);
        return new this.Builder(sum);
    }

    private static Builder = class {
        private readonly _sum: number;
        private readonly _cells: Cells = [];
        private readonly _cellKeys: CellKeysSet = new Set();

        constructor(sum: number) {
            this._sum = sum;
        }

        at(row: HouseIndex, col: HouseIndex) {
            return this.cell(Cell.at(row, col));
        }

        cell(val: Cell) {
            if (this._cellKeys.has(val.key)) {
                Cage.throwValidationError(`Found duplicate cell: ${val.key}`);
            }
            this._cells.push(val);
            this._cellKeys.add(val.key);
            return this;
        }

        get cells(): ReadonlyCells {
            return this._cells;
        }

        get cellCount() {
            return this._cells.length;
        }

        mk() {
            return new Cage(this._sum, this._cells);
        }
    };

    private static _MAX_SUM_RANGE_EXCLUSIVE = Grid.SUM + 1;
    private static validateSum(val: number) {
        if (!_.inRange(val, 1, Cage._MAX_SUM_RANGE_EXCLUSIVE)) {
            Cage.throwValidationError(`Sum outside of range. Expected to be within [1, ${Cage._MAX_SUM_RANGE_EXCLUSIVE}). Actual: ${val}`);
        }
        return val;
    }

    private static throwValidationError(detailedMessage: string) {
        throw `Invalid cage. ${detailedMessage}`;
    }

    get cellCount() {
        return this.cells.length;
    }

    toString() {
        return this.key;
    }
}

export type Cages = Array<Cage>;
export type ReadonlyCages = ReadonlyArray<Cage>;
