import { Cell, ReadonlyCells } from '../../puzzle/cell';
import { Grid } from '../../puzzle/grid';
import { Bits32, NumsSet, ReadonlyNumsSet } from './numsSet';
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
     * Returns readonly array of the bit stores used for efficient checking for this set.
     */
    get bits(): ReadonlyArray<Bits32>;

    /**
     * {@link Cell}s which are included in this set.
     */
    get cells(): ReadonlyCells;

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

type CellIndexToBitsLocator = {
    bitsIndex: number;
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
    //  - `this._bits[0]` represents numbers in the range of [0, 31]
    //  - `this._bits[1]` represents numbers in the range of [32, 63]
    //  - `this._bits[2]` represents numbers in the range of [64, 80] (not all bits are utilized in the last bit store)
    //
    private readonly _bits: Array<Bits32> = [ 0, 0, 0 ];

    // As the built-in `number` is used as a bit storage, it can hold up to 32 bits.
    private static readonly _BITS_PER_BIT_STORE = 32;

    // Caching data about bit store index and bit position within the bit store to enable fast access.
    private static readonly _CELL_INDEX_TO_BIT_STORE_LOCATORS: ReadonlyArray<CellIndexToBitsLocator> = Grid.CELL_INDICES.map(cellIndex => {
        const bitsIndex = ~~(cellIndex / CellIndicesSet._BITS_PER_BIT_STORE);
        const bitPosition = cellIndex - Math.imul(bitsIndex, CellIndicesSet._BITS_PER_BIT_STORE);
        return { bitsIndex, bitPosition };
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
            const bitsIndex = ~~(index / this._BITS_PER_BIT_STORE);

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
            val[bitsIndex].set(index % this._BITS_PER_BIT_STORE, cell);
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
                this.add(num);
            }
        } else {
            const anotherSet = val as ReadonlyCellIndicesSet;
            this._bits[0] = anotherSet.bits[0];
            this._bits[1] = anotherSet.bits[1];
            this._bits[2] = anotherSet.bits[2];
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
     * @see ReadonlyCellIndicesSet.bits
     */
    get bits() {
        return this._bits;
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
        //      this._bits[x]               = 0b10010101
        //      val.bits[x]                 = 0b10000100
        //      this._bits[x] & val.bits[x] = 0b10000100
        //
        //      0b10000100 === 0b10000100
        //      (this._bits[x] & val.bits[x]) === val.bits[x]
        //
        // ```
        //
        // Example for `hasAll` returning `false`
        // (applied to a single bit store of index `x` for simplicity):
        // ```
        //      this._bits[x]               = 0b10010101
        //      val.bits[x]                 = 0b00001100
        //      this._bits[x] & val.bits[x] = 0b00000100
        //
        //      0b00001100 !== 0b00000100
        //      (this._bits[x] & val.bits[x]) !== val.bits[x]
        // ```
        //
        return (
            (this._bits[0] & val.bits[0]) === val.bits[0] // numbers in the range of [0, 31]
            &&
            (this._bits[1] & val.bits[1]) === val.bits[1] // numbers in the range of [32, 63]
            &&
            (this._bits[2] & val.bits[2]) === val.bits[2] // numbers in the range of [64, 80]
        );
    }

    /**
     * @see ReadonlyNumsSet.doesNotHave
     */
    doesNotHave(val: number) {
        const entry = CellIndicesSet._CELL_INDEX_TO_BIT_STORE_LOCATORS[val];
        return (this._bits[entry.bitsIndex] & (1 << entry.bitPosition)) === 0;
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
        //      this._bits[x]               = 0b10010101
        //      val.bits[x]                 = 0b01101000
        //      this._bits[x] & val.bits[x] = 0b00000000 (no overlaps on the same bit positions)
        //
        //      (this._bits[x] & val.bits[x]) === 0
        // ```
        //
        // Example for `doesNotHaveAny` returning `false`
        // (applied to a single bit store of index `x` for simplicity):
        // ```
        //      this._bits[x]               = 0b10010101
        //      val.bits[x]                 = 0b00001100
        //      this._bits[x] & val.bits[x] = 0b00000100 (one overlap on the bit position 3)
        //
        //      (this._bits[x] & val.bits[x]) !== 0
        // ```
        //
        return (
            (this._bits[0] & val.bits[0]) === 0 // numbers in the range of [0, 31]
            &&
            (this._bits[1] & val.bits[1]) === 0 // numbers in the range of [32, 63]
            &&
            (this._bits[2] & val.bits[2]) === 0 // numbers in the range of [64, 80]
        );
    }

    /**
     * @see ReadonlyCellIndicesSet.cells
     */
    get cells() {
        const val = new Array<Cell>();
        let bitsIndex = 0;

        while (bitsIndex < 3) {
            CellIndicesSet._LOOKUP_TABLE[bitsIndex].collect(this._bits[bitsIndex], val);
            ++bitsIndex;
        }

        return val;
    }

    /**
     * @see NumsSet.union
     *
     * @returns This set.
     */
    union(val: ReadonlyCellIndicesSet): this {
        //
        // Applying bitwise AND onto each bit store of this set and the `val` set
        // to produce `1`s on the positions where both sets have `1`s.
        //
        // Example (applied to a single bit store of index `x` for simplicity):
        // ```
        //      this._bits[x]               = 0b10010101
        //      val.bits[x]                 = 0b01111100
        //      this._bits[x] & val.bits[x] = 0b00010100 (`1` on positions 3 and 5)
        // ```
        //
        this._bits[0] = this._bits[0] & val.bits[0];
        this._bits[1] = this._bits[1] & val.bits[1];
        this._bits[2] = this._bits[2] & val.bits[2];

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
        //      this._bits[x]               = 0b10010101
        //      val.bits[x]                 = 0b01111100
        //      this._bits[x] & val.bits[x] = 0b10000001 (`1` on positions 3 and 5 are set to `0`)
        // ```
        //
        and._bits[0] = this._bits[0] ^ val.bits[0];
        and._bits[1] = this._bits[1] ^ val.bits[1];
        and._bits[2] = this._bits[2] ^ val.bits[2];

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
        //       this._bits[x] = 0b10010101
        //      ~this._bits[x] = 0b01101010
        // ```
        //
        not._bits[0] = ~this._bits[0];
        not._bits[1] = ~this._bits[1];

        //
        // Additional bitwise AND is applied to the last bit store
        // to erase `1`s for `Cell` indices which are out of range
        // so that irrelevant `Cell`s will *not* be mapped as _included_ in the set.
        //
        not._bits[2] = (~this._bits[2] & 0b11111111111111111);

        return not;
    }

    /**
     * @see NumsSet.add
     *
     * @returns This set.
     */
    add(val: number): this {
        const entry = CellIndicesSet._CELL_INDEX_TO_BIT_STORE_LOCATORS[val];

        //
        // Applying bitwise OR with left-wise shift to set bit at position `entry.bitsndex` to `1`.
        //
        // Examples:
        //  - for `entry.bitsIndex = 0`, `bits` will be bitwise OR-ed with `0b00000001`;
        //  - for `entry.bitsIndex = 1`, `bits` will be bitwise OR-ed with `0b00000010`;
        //  - for `entry.bitsIndex = 2`, `bits` will be bitwise OR-ed with `0b00000100`;
        //  - ...
        //  - for `entry.bitsIndex = 8`, `bits` will be bitwise OR-ed with `0b10000000`;
        //  - and so on, up to `entry.bitsIndex` value of 27 per one bit store.
        //
        this._bits[entry.bitsIndex] |= 1 << entry.bitPosition;

        return this;
    }

    /**
     * @see NumsSet.addAll
     *
     * @returns This set.
     */
    addAll(val: ReadonlyCellIndicesSet): this {
        //
        // Applying bitwise OR assignment on the bit stores of this set
        // to merge `1`s from the bit stores of the `val` set.
        //
        // Example (applied to a single bit store of index `x` for simplicity):
        // ```
        //      this._bits[x]                = 0b10010001
        //      val.bits[x]                  = 0b01001000
        //      this._bits[x] |= val.bits[x] = 0b11011001
        // ```
        //
        this._bits[0] |= val.bits[0]; // for numbers in the range of [0, 31]
        this._bits[1] |= val.bits[1]; // for numbers in the range of [32, 63]
        this._bits[2] |= val.bits[2]; // for numbers in the range of [64, 80]

        return this;
    }

    /**
     * @see SudokuNumsSet.delete
     *
     * @returns This set.
     */
    delete(val: number): this {
        const entry = CellIndicesSet._CELL_INDEX_TO_BIT_STORE_LOCATORS[val];

        //
        // Applying bitwise AND and bitwise NOT to set bit at position `entry.bitsIndex` to `0`.
        //
        // Examples:
        //  - for `entry.bitsIndex = 0`, `bits` will be bitwise AND-ed with `0b11111110`;
        //  - for `entry.bitsIndex = 1`, `bits` will be bitwise AND-ed with `0b11111101`;
        //  - for `entry.bitsIndex = 2`, `bits` will be bitwise AND-ed with `0b11111011`;
        //  - ...
        //  - for `entry.bitsIndex = 8`, `bits` will be bitwise AND-ed with `0b01111111`;
        //  - and so on, up to `entry.bitsIndex` value of 27 per one bit store.
        //
        this._bits[entry.bitsIndex] &= ~(1 << entry.bitPosition);

        return this;
    }

    /**
     * @see NumsSet.deleteAll
     *
     * @returns This set.
     */
    deleteAll(val: ReadonlyCellIndicesSet): this {
        //
        // Applying bitwise AND assignment on the bit stores of this set
        // to merge `1`s from the bit stores of the `val` set.
        //
        // Example (applied to a single bit store of index `x` for simplicity):
        // ```
        //      this._bits[x]                  = 0b10011001
        //      val.bits[x]                    = 0b01001001
        //      ~val.bits[x]                   = 0b10110110 (bit inversion gives us value that can be `&`-ed on)
        //      this._bits[x] &= ~val._bits[x] = 0b10010000
        // ```
        //
        this._bits[0] &= ~val.bits[0]; // for numbers in the range of [0, 31]
        this._bits[1] &= ~val.bits[1]; // for numbers in the range of [32, 63]
        this._bits[2] &= ~val.bits[2]; // for numbers in the range of [64, 80]

        return this;
    }

    /**
     * @see ReadonlyNumsSet.equals
     */
    equals(val: ReadonlyCellIndicesSet) {
        return (
            this._bits[0] === val.bits[0] &&
            this._bits[1] === val.bits[1] &&
            this._bits[2] === val.bits[2]
        );
    }

    /**
     * @see ReadonlyNumsSet.isEmpty
     */
    get isEmpty(): boolean {
        return (
            this._bits[0] === 0 &&
            this._bits[1] === 0 &&
            this._bits[2] === 0
        );
    }

    /**
     * @see ReadonlyNumsSet.isNotEmpty
     */
    get isNotEmpty(): boolean {
        return (
            this._bits[0] !== 0 ||
            this._bits[1] !== 0 ||
            this._bits[2] !== 0
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
