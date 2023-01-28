import * as _ from 'lodash';
import { joinArray } from '../util/readableMessages';
import { Cell, CellKeysSet, Cells, ReadonlyCells } from './cell';
import { Grid } from './grid';
import { HouseIndex } from './house';

/**
 * The grouping of `Cell`s in Killer Sudoku.
 *
 * `Cage` API provides access to `Cell`s which denote a group ({@link Cage#cells})
 * and sum of these `Cell`s ({@link Cage#sum}).
 *
 * It also provides {@link Cage#key} which can be used both
 * as a unique `Cage` id within a `Grid` as well as human-readable representation of a `Cage`.
 *
 * **Input `Cage`s are assumed to NOT include duplicate numbers while derivative `Cage`s can have duplicates.**
 *
 * As this type is used to model input problem only (as opposed to modeling solution), it does NOT hold the `Cell`s' numbers.
 *
 * @public
 */
export class Cage {
    /**
     * Sum of `Cage` `Cell`s.
     */
    readonly sum: number;

    /**
     * `Cell`s which denote the group.
     */
    readonly cells: ReadonlyCells;

    /**
     * Human-readable key describing the `Cage`.
     */
    readonly key: string;

    /**
     * Produces new `Cage` builder with the given sum of `Cage` `Cell`s
     * that can be further used to construct `Cage` by enumerating `Cell`s which denote the group.
     *
     * @param sum - Sum of `Cage` `Cell`s.
     *
     * @returns new `Cage` builder with the given sum of `Cage` `Cell`s.
     */
    static ofSum(sum: number) {
        Cage.validateSum(sum);
        return new this.Builder(sum);
    }

    private static _MAX_SUM_RANGE_EXCLUSIVE = Grid.SUM + 1;

    private static validateSum(val: number) {
        if (!_.inRange(val, 1, Cage._MAX_SUM_RANGE_EXCLUSIVE)) {
            Cage.throwValidationError(`Sum outside of range. Expected to be within [1, ${Cage._MAX_SUM_RANGE_EXCLUSIVE}). Actual: ${val}`);
        }
        return val;
    }

    private constructor(sum: number, cells: ReadonlyCells) {
        this.sum = sum;
        this.cells = [...cells].sort();
        this.key = Cage.keyOf(sum, this.cells);
    }

    private static keyOf(sum: number, cells: ReadonlyCells) {
        return `${sum} [${joinArray(cells)}]`;
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

    private static throwValidationError(detailedMessage: string) {
        throw `Invalid cage. ${detailedMessage}`;
    }

    /**
     * Amount of `Cell`s which denote the group.
     */
    get cellCount() {
        return this.cells.length;
    }

    /**
     * Returns human-readable string representation of the `Cage` which is the same as {@link Cage#key}.
     *
     * @returns human-readable string representation of the `Cage` which is the same as {@link Cage#key}.
     */
    toString() {
        return this.key;
    }
}

export type Cages = Array<Cage>;
export type ReadonlyCages = ReadonlyArray<Cage>;
