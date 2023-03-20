import { Cell, ReadonlyCells } from '../../puzzle/cell';
import { Grid } from '../../puzzle/grid';
import { BitStore32, NumsSet, ReadonlyNumsSet } from './numsSet';
import { PowersOf2Lut } from './powersOf2Lut';

/**
 * Set of {@link Cell} indices with efficient storage & fast checking operations
 * which can be used to mark {@link Cell}s as included or excluded in {@link Cage}s and {@link Cage} areas.
 *
 * The range of this set is [0, 81) to be able to fit
 * all possible {@link Cell} indices on the {@link Grid} (see {@link Grid.CELL_COUNT}).
 *
 * Both memory and speed are of O(1) complexity due to the use of bitwise arithmetic on numbers.
 *
 * For performance reasons, implementations of this interface are NEITHER required to do range checks,
 * NOR to guarantee correct work for the numbers outside of the range (<0, >80).
 *
 * @public
 */
export interface ReadonlyCellIndicesSet extends ReadonlyNumsSet<ReadonlyCellIndicesSet> {

    /**
     * Returns readonly array of the bit storages used for efficient checking for this numbers set.
     */
    get bitStores(): ReadonlyArray<BitStore32>;

    /**
     * Produces {@link Cell}s which are included in this set.
     *
     * @returns {Cell}s which are included in this set.
     */
    cells(): ReadonlyCells;

    /**
     * Creates new set which is the _difference_ between this set
     * and the given `val` set,
     * meaning produced set has values from this set
     * WITHOUT the values in the `val` set.
     *
     * @param val - Set used to produce difference with this set.
     *
     * @returns New set which is the _difference_ between this set
     * and the given `val` set,
     */
    _(val: ReadonlyCellIndicesSet): ReadonlyCellIndicesSet;

    /**
     * Creates new set which has the numbers *not* present in this set.
     *
     * @returns New set which has the numbers *not* present in this set.
     */
    not(): ReadonlyCellIndicesSet;

}

type CellIndexToBitStoreLocator = {
    bitStoreIndex: number;
    bitPosition: number;
}

/**
 * Extends {@link ReadonlyCellIndicesSet} with fast manipulation operations.
 *
 * Both memory and speed are of O(1) complexity due to the use of bitwise arithmetic on numbers.
 *
 * @see ReadonlyCellIndicesSet
 * @see NumsSet
 *
 * @public
 */
export class CellIndicesSet implements NumsSet<ReadonlyCellIndicesSet> {

    //
    // It is enough to have 3 bit stores of size 32 bits each
    // as the amount of required indices is up to 81:
    //
    //  - `this._bitStores[0]` represents numbers in the range of [0, 31]
    //  - `this._bitStores[1]` represents numbers in the range of [32, 63]
    //  - `this._bitStores[2]` represents numbers in the range of [64, 80] (not all bits are utilized in the last bit store)
    //
    private readonly _bitStores: Array<BitStore32> = [ 0, 0, 0 ];

    // As the built-in `number` is used as a bit storage, it can hold up to 32 bits.
    private static readonly _BITS_PER_BIT_STORE = 32;

    // Caching data about bit store index and bit position within the bit store to enable fast access.
    private static readonly _CELL_INDEX_TO_BIT_STORE_LOCATORS: ReadonlyArray<CellIndexToBitStoreLocator> = Grid.CELL_INDICES.map(cellIndex => {
        const bitStoreIndex = ~~(cellIndex / CellIndicesSet._BITS_PER_BIT_STORE);
        const bitPosition = cellIndex - Math.imul(bitStoreIndex, CellIndicesSet._BITS_PER_BIT_STORE);
        return { bitStoreIndex, bitPosition };
    });

    /**
     * Lookup table for {@link Cell}s represented as the array of arrays
     * indexed by bit store and then by unique number for the 32-bit _power of 2_ integer.
     */
    private static readonly _LOOKUP_TABLE: ReadonlyArray<PowersOf2Lut<Cell>> = (() => {
        // Creating empty lookup tables for each bit store.
        const val: Array<PowersOf2Lut<Cell>> = [
            new PowersOf2Lut<Cell>(),
            new PowersOf2Lut<Cell>(),
            new PowersOf2Lut<Cell>()
        ];

        // Iterating over all possible `Cell` indices on the `Grid`.
        for (const index of Grid.CELL_INDICES) {
            //
            // Calculating index of the bit store (in the [0, 2] range):
            //
            //  - for the first 32 values (in the [0, 31] range) the value is `0`;
            //  - for the next 32 values (in the [32, 63] range) the value is `1`;
            //  - for the last 17 values (in the [64, 80] range) the value is `2`.
            //
            // Same as `Math.trunc(index / this._BITS_PER_BIT_STORE)` but `~~` is faster.
            //
            const bitStoreIndex = ~~(index / this._BITS_PER_BIT_STORE);

            //
            // Calculating index of the `Cell` `Row` from absolute `Cell` index on the `Grid`.
            //
            // Same as `Math.trunc(index / Grid.GRID_SIDE_CELL_COUNT)` but `~~` is faster.
            //
            const row = ~~(index / Grid.SIDE_CELL_COUNT);

            // Calculating index of the `Cell` `Column` from absolute `Cell` index on the `Grid`.
            const col = index % Grid.SIDE_CELL_COUNT;

            // Creating `Cell` with calculated `Row` and `Column` indices.
            const cell = Cell.at(row, col);

            // Storing `Cell` value in the lookup table.
            val[bitStoreIndex].set(index % this._BITS_PER_BIT_STORE, cell);
        }

        return val;
    })();

    /**
     * Constructs new set from the unique numbers in the given array
     * or from another {@link ReadonlyCellIndicesSet}.
     *
     * In case array is specified, only unique numbers are added to the set.
     * Number duplicates are silently ignored.
     *
     * Set is constructed as empty if no numbers are given.
     *
     * @param val - Readonly array of numbers or {@link ReadonlyCellIndicesSet} to construct this set from.
     */
    constructor(val: ReadonlyArray<number> | ReadonlyCellIndicesSet) {
        if (Array.isArray(val)) {
            for (const num of val) {
                this.addOne(num);
            }
        } else {
            const anotherSet = val as ReadonlyCellIndicesSet;
            this._bitStores[0] = anotherSet.bitStores[0];
            this._bitStores[1] = anotherSet.bitStores[1];
            this._bitStores[2] = anotherSet.bitStores[2];
        }
    }

    /**
     * Constructs new set from the unique numbers specified via rest parameters.
     *
     * Only unique numbers are added to the set. Number duplicates are silently ignored.
     *
     * Set is constructed as empty if no numbers are given.
     *
     * @param val - Array of numbers to construct this set from.
     *
     * @returns new set from the given numbers.
     */
    static of(...val: ReadonlyArray<number>) {
        return new CellIndicesSet(val);
    }

    private static readonly _EMPTY_ARRAY = [];

    /**
     * Constructs new empty set.
     *
     * This method of construction for an empty set is preferable in terms of readability, memory and performance
     * over `CellIndicesSet.of()` as it avoids construction of an empty array argument.
     *
     * @returns new set.
     */
    static newEmpty() {
        return new CellIndicesSet(this._EMPTY_ARRAY);
    }

    /**
     * @see ReadonlyCellIndicesSet.bitStores
     */
    get bitStores() {
        return this._bitStores;
    }

    /**
     * @see ReadonlyNumsSet.hasAll
     */
    hasAll(val: ReadonlyCellIndicesSet) {
        //
        // Applying bitwise AND to check that each bit store of this set
        // has `1`s at the same positions as each bit store of the `val` set.
        //
        // Example for `hasAll` returning `true`
        // (applied to a single bit store of index `x` for simplicity):
        // ```
        //      this._bitStores[x]                    = 0b10010101
        //      val.bitStores[x]                      = 0b10000100
        //      this._bitStores[x] & val.bitStores[x] = 0b10000100
        //
        //      0b10000100 === 0b10000100
        //      (this._bitStores[x] & val.bitStores[x]) === val.bitStores[x]
        //
        // ```
        //
        // Example for `hasAll` returning `false`
        // (applied to a single bit store of index `x` for simplicity):
        // ```
        //      this._bitStores[x]                    = 0b10010101
        //      val.bitStores[x]                      = 0b00001100
        //      this._bitStores[x] & val.bitStores[x] = 0b00000100
        //
        //      0b00001100 !== 0b00000100
        //      (this._bitStores[x] & val.bitStores[x]) !== val.bitStores[x]
        // ```
        //
        return (
            (this._bitStores[0] & val.bitStores[0]) === val.bitStores[0] // numbers in the range of [0, 31]
            &&
            (this._bitStores[1] & val.bitStores[1]) === val.bitStores[1] // numbers in the range of [32, 63]
            &&
            (this._bitStores[2] & val.bitStores[2]) === val.bitStores[2] // numbers in the range of [64, 80]
        );
    }

    /**
     * @see ReadonlyNumsSet.doesNotHave
     */
    doesNotHave(val: number) {
        const entry = CellIndicesSet._CELL_INDEX_TO_BIT_STORE_LOCATORS[val];
        return (this._bitStores[entry.bitStoreIndex] & (1 << entry.bitPosition)) === 0;
    }

    /**
     * @see ReadonlyNumsSet.doesNotHaveAny
     */
    doesNotHaveAny(val: ReadonlyCellIndicesSet) {
        //
        // Applying bitwise AND to check that each bit store of this set
        // does *not* have `1`s at the same positions as each bit store of the `val` set.
        //
        // Example for `doesNotHaveAny` returning `true`
        // (applied to a single bit store of index `x` for simplicity):
        // ```
        //      this._bitStores[x]                    = 0b10010101
        //      val.bitStores[x]                      = 0b01101000
        //      this._bitStores[x] & val.bitStores[x] = 0b00000000 (no overlaps on the same bit positions)
        //
        //      (this._bitStores[x] & val.bitStores[x]) === 0
        // ```
        //
        // Example for `doesNotHaveAny` returning `false`
        // (applied to a single bit store of index `x` for simplicity):
        // ```
        //      this._bitStores[x]                    = 0b10010101
        //      val.bitStores[x]                      = 0b00001100
        //      this._bitStores[x] & val.bitStores[x] = 0b00000100 (one overlap on the bit position 3)
        //
        //      (this._bitStores[x] & val.bitStores[x]) !== 0
        // ```
        //
        return (
            (this._bitStores[0] & val.bitStores[0]) === 0 // numbers in the range of [0, 31]
            &&
            (this._bitStores[1] & val.bitStores[1]) === 0 // numbers in the range of [32, 63]
            &&
            (this._bitStores[2] & val.bitStores[2]) === 0 // numbers in the range of [64, 80]
        );
    }

    /**
     * @see ReadonlyCellIndicesSet.cells
     */
    cells() {
        const val = new Array<Cell>();
        let bitStoreIndex = 0;

        while (bitStoreIndex < 3) {
            CellIndicesSet._LOOKUP_TABLE[bitStoreIndex].collect(this._bitStores[bitStoreIndex], val);
            bitStoreIndex++;
        }

        return val;
    }

    /**
     * @see NumsSet.union
     *
     * @returns This set.
     */
    union(val: ReadonlyCellIndicesSet): CellIndicesSet {
        //
        // Applying bitwise AND onto each bit store of this set and the `val` set
        // to produce `1`s on the positions where both sets have `1`s.
        //
        // Example (applied to a single bit store of index `x` for simplicity):
        // ```
        //      this._bitStores[x]                    = 0b10010101
        //      val.bitStores[x]                      = 0b01111100
        //      this._bitStores[x] & val.bitStores[x] = 0b00010100 (`1` on positions 3 and 5)
        // ```
        //
        this._bitStores[0] = this._bitStores[0] & val.bitStores[0];
        this._bitStores[1] = this._bitStores[1] & val.bitStores[1];
        this._bitStores[2] = this._bitStores[2] & val.bitStores[2];

        return this;
    }

    /**
     * @see ReadonlyCellIndicesSet._
     */
    _(val: ReadonlyCellIndicesSet): ReadonlyCellIndicesSet {
        const and = CellIndicesSet.newEmpty();

        //
        // Applying bitwise XOR onto each bit store of this set and the `val` set
        // to produce `0`s on the positions where both sets have `1`s.
        //
        // Example (applied to a single bit store of index `x` for simplicity):
        // ```
        //      this._bitStores[x]                    = 0b10010101
        //      val.bitStores[x]                      = 0b01111100
        //      this._bitStores[x] & val.bitStores[x] = 0b10000001 (`1` on positions 3 and 5 are set to `0`)
        // ```
        //
        and._bitStores[0] = this._bitStores[0] ^ val.bitStores[0];
        and._bitStores[1] = this._bitStores[1] ^ val.bitStores[1];
        and._bitStores[2] = this._bitStores[2] ^ val.bitStores[2];

        return and;
    }

    /**
     * @see ReadonlyCellIndicesSet.not
     */
    not(): ReadonlyCellIndicesSet {
        const not = CellIndicesSet.newEmpty();

        //
        // Applying bitwise NOT onto each bit store of this set
        // to turn `0`s into `1`s and `1`s into `0`s.
        //
        // Example (applied to a single bit store of index `x` for simplicity):
        // ```
        //      this._bitStores[x]   = 0b10010101
        //       ~this._bitStores[x] = 0b01101010
        // ```
        //
        not._bitStores[0] = ~this._bitStores[0];
        not._bitStores[1] = ~this._bitStores[1];

        //
        // Additional bitwise AND is applied to the last bit store
        // to erase `1`s for `Cell` indices which are out of range
        // so that irrelevant `Cell`s will *not* be mapped as _included_ in the set.
        //
        not._bitStores[2] = (~this._bitStores[2] & 0b11111111111111111);

        return not;
    }

    /**
     * @see NumsSet.addAll
     *
     * @returns This set.
     */
    addAll(val: ReadonlyCellIndicesSet): CellIndicesSet {
        //
        // Applying bitwise OR assignment on the bit stores of this set
        // to merge `1`s from the bit stores of the `val` set.
        //
        // Example (applied to a single bit store of index `x` for simplicity):
        // ```
        //      this._bitStores[x]                     = 0b10010001
        //      val.bitStores[x]                       = 0b01001000
        //      this._bitStorse[x] |= val.bitStores[x] = 0b11011001
        // ```
        //
        this._bitStores[0] |= val.bitStores[0]; // for numbers in the range of [0, 31]
        this._bitStores[1] |= val.bitStores[1]; // for numbers in the range of [32, 63]
        this._bitStores[2] |= val.bitStores[2]; // for numbers in the range of [64, 80]

        return this;
    }

    /**
     * Adds given number to this set.
     *
     * This method changes this set.
     *
     * The given number is added only if it is *not* yet present in this set.
     * Duplicate number is ignored.
     *
     * @param val - Number to add to this set.
     *
     * @returns This numbers set.
     */
    addOne(val: number) {
        const entry = CellIndicesSet._CELL_INDEX_TO_BIT_STORE_LOCATORS[val];

        //
        // Applying bitwise OR with left-wise shift to set bit at position `entry.bitStoreIndex` to `1`.
        //
        // Examples:
        //  - for `entry.bitStoreIndex = 0`, `bitStore` will be bitwise OR-ed with `0b00000001`;
        //  - for `entry.bitStoreIndex = 1`, `bitStore` will be bitwise OR-ed with `0b00000010`;
        //  - for `entry.bitStoreIndex = 2`, `bitStore` will be bitwise OR-ed with `0b00000100`;
        //  - ...
        //  - for `entry.bitStoreIndex = 8`, `bitStore` will be bitwise OR-ed with `0b10000000`;
        //  - and so on, up to `entry.bitStoreIndex` value of 27 per one bit store.
        //
        this._bitStores[entry.bitStoreIndex] |= 1 << entry.bitPosition;
    }

    /**
     * @see NumsSet.deleteAll
     *
     * @returns This set.
     */
    deleteAll(val: ReadonlyCellIndicesSet): CellIndicesSet {
        //
        // Applying bitwise AND assignment on the bit stores of this set
        // to merge `1`s from the bit stores of the `val` set.
        //
        // Example (applied to a single bit store of index `x` for simplicity):
        // ```
        //      this._bitStores[x]                      = 0b10011001
        //      val.bitStores[x]                        = 0b01001001
        //      ~val.bitStores[x]                       = 0b10110110 (bit inversion gives us value that can be `&`-ed on)
        //      this._bitStores[x] &= ~val.bitStores[x] = 0b10010000
        // ```
        //
        this._bitStores[0] &= ~val.bitStores[0]; // for numbers in the range of [0, 31]
        this._bitStores[1] &= ~val.bitStores[1]; // for numbers in the range of [32, 63]
        this._bitStores[2] &= ~val.bitStores[2]; // for numbers in the range of [64, 80]

        return this;
    }

    /**
     * @see SudokuNumsSet.delete
     *
     * @returns This set.
     */
    delete(val: number): CellIndicesSet {
        const entry = CellIndicesSet._CELL_INDEX_TO_BIT_STORE_LOCATORS[val];

        //
        // Applying bitwise AND and bitwise NOT to set bit at position `entry.bitStoreIndex` to `0`.
        //
        // Examples:
        //  - for `entry.bitStoreIndex = 0`, `bitStore` will be bitwise AND-ed with `0b11111110`;
        //  - for `entry.bitStoreIndex = 1`, `bitStore` will be bitwise AND-ed with `0b11111101`;
        //  - for `entry.bitStoreIndex = 2`, `bitStore` will be bitwise AND-ed with `0b11111011`;
        //  - ...
        //  - for `entry.bitStoreIndex = 8`, `bitStore` will be bitwise AND-ed with `0b01111111`;
        //  - and so on, up to `entry.bitStoreIndex` value of 27 per one bit store.
        //
        this._bitStores[entry.bitStoreIndex] &= ~(1 << entry.bitPosition);

        return this;
    }

    /**
     * @see ReadonlyNumsSet.equals
     */
    equals(val: ReadonlyCellIndicesSet) {
        return (
            this._bitStores[0] === val.bitStores[0] &&
            this._bitStores[1] === val.bitStores[1] &&
            this._bitStores[2] === val.bitStores[2]
        );
    }

    /**
     * Clones this set by creating new instance based on the copy of the state of this set.
     *
     * @returns New set based on the copy of the state of this set.
     */
    clone() {
        return new CellIndicesSet(this);
    }

}
