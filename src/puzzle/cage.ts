import * as _ from 'lodash';
import { MutableSet } from '../util/mutableSet';
import { joinArray } from '../util/readableMessages';
import { Cell, CellKeysSet, Cells, ReadonlyCells } from './cell';
import { Grid } from './grid';
import { HouseIndex } from './house';
import { InvalidPuzzleDefError } from './invalidPuzzleDefError';

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
 *
 * @see https://en.wikipedia.org/wiki/Killer_sudoku#Terminology
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
     * Produces new `Cage` Builder with the given sum of `Cage` `Cell`s
     * that can be further used to construct `Cage` by enumerating `Cell`s which denote the group.
     *
     * Sample of complete and valid `Cage` construction:
     * ```ts
     * const cage = Cage.ofSum(8).at(1, 3).at(1, 4).new();
     * ```
     *
     * @param sum - Sum of `Cage` `Cell`s.
     *
     * @returns new `Cage` builder with the given sum of `Cage` `Cell`s.
     *
     * @throws {@link InvalidPuzzleDefError} if the given `sum` is not within [1, `Grid.SUM`) range.
     */
    static ofSum(sum: number) {
        return new this.Builder(sum);
    }

    private static _MAX_SUM_RANGE_EXCLUSIVE = Grid.SUM + 1;

    private static validateSum(val: number) {
        if (!_.inRange(val, 1, Cage._MAX_SUM_RANGE_EXCLUSIVE)) {
            Cage.throwValidationError(`Sum outside of range. Expected to be within [1, ${Cage._MAX_SUM_RANGE_EXCLUSIVE}). Actual: ${val}`);
        }
    }

    private static validateCells(val: ReadonlyCells) {
        if (!val.length) {
            Cage.throwValidationError('No Cells registered. At least one Cell should be a part of Cage grouping');
        }
    }

    private constructor(sum: number, cells: ReadonlyCells) {
        this.sum = sum;
        this.cells = [...cells].sort();
        this.key = Cage.keyOf(sum, this.cells);
    }

    private static keyOf(sum: number, cells: ReadonlyCells) {
        return `${sum} [${joinArray(cells)}]`;
    }

    /**
     * `Cage` Builder with fluent API that validates sum and `Cell`s which denote the group to not duplicate.
     */
    static Builder = class {
        private readonly _sum: number;
        private readonly _cells: Cells = [];
        private readonly _cellKeys: CellKeysSet = new MutableSet();

        /**
         * Produces new `Cage` Builder with the given sum of `Cage` `Cell`s.
         *
         * Sample of complete and valid `Cage` construction:
         * ```ts
         * const cage = Cage.ofSum(8).at(1, 3).at(1, 4).new();
         *
         * ```
         * @param sum - Sum of `Cage` `Cell`s.
         *
         * @returns new `Cage` builder with the given sum of `Cage` `Cell`s.
         *
         * @throws {@link InvalidPuzzleDefError} if the given `sum` is not within [1, `Grid.SUM`) range.
         */
        constructor(sum: number) {
            Cage.validateSum(sum);
            this._sum = sum;
        }

        /**
         * Adds given `Cell` by its `Row` and `Column` indices to `Cage` grouping for this Builder without constructing a `Cage` just yet.
         *
         * Used mainly for concise and readable Builder chaining when applied to static problem definitions.
         *
         * @param row - Index of a `Row` that the `Cell` is positioned at.
         * @param col - Index of a `Column` that the `Cell` is positioned at.
         *
         * @returns this Builder.
         *
         * @throws {@link InvalidPuzzleDefError} if the given `Cell` describes invalid or duplicate `Cell`
         * in respect to Builder's accumulated `Cell`s.
         */
        at(row: HouseIndex, col: HouseIndex) {
            return this.withCell(Cell.at(row, col));
        }

        /**
         * Adds given `Cell` to `Cage` grouping for this Builder without constructing a `Cage` just yet.
         *
         * @param val - `Cell` to add to `Cage` grouping.
         *
         * @returns this Builder.
         *
         * @throws {@link InvalidPuzzleDefError} if the given `Cell` describes duplicate `Cell`
         * in respect to Builder's accumulated `Cell`s.
         */
        withCell(val: Cell) {
            if (this._cellKeys.has(val.key)) {
                Cage.throwValidationError(`Found duplicate Cell: ${val.key}`);
            }
            this._cells.push(val);
            this._cellKeys.add(val.key);
            return this;
        }

        /**
         * Adds given `Cell`s to `Cage` grouping for this Builder without constructing a `Cage` just yet.
         *
         * @param val - `Cell`s to add to `Cage` grouping.
         *
         * @returns this Builder.
         *
         * @throws {@link InvalidPuzzleDefError} if at least one of given `Cell`s describe duplicate `Cell`
         * in respect to Builder's accumulated `Cell`s.
         */
        withCells(val: ReadonlyCells) {
            for (const cell of val) {
                this.withCell(cell);
            }
            return this;
        }

        /**
         * `Cell`s which denote the group that are currently accumulated by the Builder.
         */
        get cells(): ReadonlyCells {
            return this._cells;
        }

        /**
         * Amount of `Cell`s which denote the group that are currently accumulated by the Builder.
         */
        get cellCount() {
            return this._cells.length;
        }

        /**
         * Constructs new `Cage` with accumulated `Cell`s which denote a group and sum of these `Cell`s.
         *
         * @returns new `Cage` with accumulated `Cell`s which denote a group and sum of these `Cell`s.
         *
         * @throws {@link InvalidPuzzleDefError} if no `Cell`s were added to this Builder.
         */
        new() {
            Cage.validateCells(this._cells);
            return new Cage(this._sum, this._cells);
        }
    };

    private static throwValidationError(detailedMessage: string) {
        throw new InvalidPuzzleDefError(`Invalid Cage. ${detailedMessage}`);
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

/**
 * Mutable array of `Cage`s.
 */
export type Cages = Array<Cage>;

/**
 * Readonly array of `Cage`s.
 */
export type ReadonlyCages = ReadonlyArray<Cage>;
