import { Cell } from '../../puzzle/cell';
import { GridSizeAndCellPositionsIteration } from '../../puzzle/gridSizeAndCellPositionsIteration';
import { BitStore32, NumsCheckingSet, ReadonlyNumsCheckingSet } from './numsCheckingSet';

/**
 * Checking set of {@link Cell} indices with efficient storage & fast checking operations
 * which can be used to mark {@link Cell}s as included or excluded in {@link Cage}s and {@link Cage} areas.
 *
 * The range of this checking set is [0, 81) to be able to fit
 * all possible {@link Cell} indices on the {@link Grid} (see {@link Grid.CELL_COUNT}).
 *
 * Both memory and speed are of O(1) complexity due to the use of bitwise arithmetic on numbers.
 *
 * For performance reasons, implementations of this interface are NEITHER required to do range checks,
 * NOR to guarantee correct work for the numbers outside of the range (<0, >80).
 *
 * @public
 */
export interface ReadonlyCellIndicesCheckingSet extends ReadonlyNumsCheckingSet<ReadonlyCellIndicesCheckingSet> {

    /**
     * Returns readonly array of the bit storages used for efficient checking for this numbers set.
     */
    get bitStores(): ReadonlyArray<BitStore32>;

    /**
     * Produces {@link Cell}s which are included in this checking set.
     *
     * @returns {Cell}s which are included in this checking set.
     */
    cells(): ReadonlyArray<Cell>;

    /**
     * Creates new checking set which has only the numbers
     * present in this set `AND` the given `val` checking set.
     *
     * @param val - Another checking set to `AND` with this set.
     *
     * @returns New checking set which has only the numbers
     * present in this set `AND` the given `val` checking set.
     */
    and(val: ReadonlyCellIndicesCheckingSet): ReadonlyCellIndicesCheckingSet;

    /**
     * Creates new checking set which has the numbers NOT present in this set.
     *
     * @returns New checking set which has the numbers NOT present in this set.
     */
    not(): ReadonlyCellIndicesCheckingSet;

}

type CellIndexToBitStoreLocator = {
    bitStoreIndex: number;
    bitPosition: number;
}

/**
 * Extends {@link ReadonlyCellIndicesCheckingSet} with fast manipulation operations.
 *
 * Both memory and speed are of O(1) complexity due to the use of bitwise arithmetic on numbers.
 *
 * @see {ReadonlyCellIndicesCheckingSet}
 * @see {NumsCheckingSet}
 *
 * @public
 */
export class CellIndicesCheckingSet implements
        ReadonlyCellIndicesCheckingSet,
        NumsCheckingSet<ReadonlyCellIndicesCheckingSet, CellIndicesCheckingSet> {

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
    private static readonly _CELL_INDEX_TO_BIT_STORE_LOCATORS: ReadonlyArray<CellIndexToBitStoreLocator> = GridSizeAndCellPositionsIteration.GRID_CELL_INDICES_RANGE.map(cellIndex => {
        const bitStoreIndex = Math.floor(cellIndex / CellIndicesCheckingSet._BITS_PER_BIT_STORE);
        const bitPosition = cellIndex - bitStoreIndex * CellIndicesCheckingSet._BITS_PER_BIT_STORE;
        return { bitStoreIndex, bitPosition };
    });

    /**
     * Magic number `k` that produces unique small number for a 32-bit _power of 2_ integer `n`
     * with `n % k` (modulp) operation.
     *
     * These `n % k` numbers are used to index the lookup table.
     *
     * Full table of association between the _power of 2_ (`n`) and this `k`:
     *
     * ----------
     *  n   |   k
     * ----------
     *  0   |   1
     *  1   |   2
     *  2   |   4
     *  3   |   8
     *  4   |  16
     *  5   |  32
     *  6   |  27
     *  7   |  17
     *  8   |  34
     *  9   |  31
     * 10   |  25
     * 11   |  13
     * 12   |  26
     * 13   |  15
     * 14   |  30
     * 15   |  23
     * 16   |   9
     * 17   |  18
     * 18   |  36
     * 19   |  35
     * 20   |  33
     * 21   |  29
     * 22   |  21
     * 23   |   5
     * 24   |  10
     * 25   |  20
     * 26   |   3
     * 27   |   6
     * 28   |  12
     * 29   |  24
     * 30   |  11
     * 31   | -22
     * ----------
     */
    private static readonly _POWERS_OF_TWO_LUT_K = 37;

    private static _newPowersOfTwoLookUpTable() {
        return new Array<Cell>(this._POWERS_OF_TWO_LUT_K);
    }

    /**
     * Lookup table for {@link Cell}s represented as the array of arrays
     * indexed by bit store and then by unique number for the 32-bit _power of 2_ integer.
     */
    private static readonly _BITS_TO_CELLS_LUT: ReadonlyArray<ReadonlyArray<Cell>> = (() => {
        // Creating empty lookup tables for each bit store.
        const val: Array<Array<Cell>> = [
            this._newPowersOfTwoLookUpTable(),
            this._newPowersOfTwoLookUpTable(),
            this._newPowersOfTwoLookUpTable()
        ];

        // Iterating over all possible `Cell` indices on the `Grid`.
        for (const index of GridSizeAndCellPositionsIteration.GRID_CELL_INDICES_RANGE) {
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
            // Calculating index of the entry in the lookup table.
            //
            //  - `index % this._BITS_PER_BIT_STORE` returns index of the `Cell`s bit in the bit store.
            //  - `1 << (index % this._BITS_PER_BIT_STORE)` produces a number which has only bit set -
            //    and that bit is a `Cell`s bit. This number is a _power of 2_.
            //  - modulo on `K` produces unique small number for 32-bit _power of 2_ integer.
            //
            // Example:
            //  - `index`                                                                 // => `35`
            //  - `index % this._BITS_PER_BIT_STORE`                                      // => `3`
            //  - `1 << (index % this._BITS_PER_BIT_STORE)`                               // => `8`
            //  - `(1 << (index % this._BITS_PER_BIT_STORE)) % this._POWERS_OF_TWO_LUT_K` // => `34` (see {@link _POWERS_OF_TWO_LUT_K})
            //
            const lutIndex = (1 << (index % this._BITS_PER_BIT_STORE)) % this._POWERS_OF_TWO_LUT_K;

            //
            // Calculating index of the `Cell` `Row` from absolute `Cell` index on the `Grid`.
            //
            // Same as `Math.trunc(index / GridSizeAndCellPositionsIteration.GRID_SIDE_CELL_COUNT)` but `~~` is faster.
            //
            const row = ~~(index / GridSizeAndCellPositionsIteration.GRID_SIDE_CELL_COUNT);

            // Calculating index of the `Cell` `Column` from absolute `Cell` index on the `Grid`.
            const col = index % GridSizeAndCellPositionsIteration.GRID_SIDE_CELL_COUNT;

            // Storing `Cell` value in the lookup table.
            val[bitStoreIndex][lutIndex] = Cell.at(row, col);
        }

        return val;
    })();

    /**
     * Constructs new checking set from the unique numbers in the given array
     * or from another {@link ReadonlyCellIndicesCheckingSet}.
     *
     * In case array is specified, only unique numbers are added to the checking set.
     * Number duplicates are silently ignored.
     *
     * Checking set is constructed as empty if no numbers are given.
     *
     * @param val - Readonly array of numbers or {@link ReadonlyCellIndicesCheckingSet} to construct this checking set from.
     */
    constructor(val: ReadonlyArray<number> | ReadonlyCellIndicesCheckingSet) {
        if (Array.isArray(val)) {
            for (const num of val) {
                const entry = CellIndicesCheckingSet._CELL_INDEX_TO_BIT_STORE_LOCATORS[num];

                //
                // Applying bitwise OR with left-wise shift to mark bit at position `num` as `1`.
                //
                // Examples:
                //  - for `num = 0`, `bitStore` will be bitwise OR-ed with `0b00000001`;
                //  - for `num = 1`, `bitStore` will be bitwise OR-ed with `0b00000010`;
                //  - for `num = 2`, `bitStore` will be bitwise OR-ed with `0b00000100`;
                //  - ...
                //  - for `num = 8`, `bitStore` will be bitwise OR-ed with `0b10000000`;
                //  - and so on, up to `num` value of 27 per one bit store.
                //
                // For `num = 1` and `num = 4` `bitStore` will be `0b00010010`.
                //
                this._bitStores[entry.bitStoreIndex] |= 1 << entry.bitPosition;
            }
        } else {
            const anotherSet = val as ReadonlyCellIndicesCheckingSet;
            this._bitStores[0] = anotherSet.bitStores[0];
            this._bitStores[1] = anotherSet.bitStores[1];
            this._bitStores[2] = anotherSet.bitStores[2];
        }
    }

    /**
     * Constructs new checking set from the unique numbers specified via rest parameters.
     *
     * Only unique numbers are added to the checking set. Number duplicates are silently ignored.
     *
     * Checking set is constructed as empty if no numbers are given.
     *
     * @param val - Array of numbers to construct this checking set from.
     *
     * @returns new checking set from the given numbers.
     */
    static of(...val: ReadonlyArray<number>) {
        return new CellIndicesCheckingSet(val);
    }

    private static readonly _EMPTY_ARRAY = [];

    /**
     * Constructs new empty checking set.
     *
     * This method of construction for an empty set is preferable in terms of readability, memory and performance
     * over `CellIndicesCheckingSet.of()` as it avoids construction of an empty array argument.
     *
     * @returns new checking set.
     */
    static newEmpty() {
        return new CellIndicesCheckingSet(this._EMPTY_ARRAY);
    }

    /**
     * @see {ReadonlyCellIndicesCheckingSet.bitStores}
     */
    get bitStores() {
        return this._bitStores;
    }

    /**
     * @see {ReadonlyNumsCheckingSet.hasAll}
     */
    hasAll(val: ReadonlyCellIndicesCheckingSet) {
        //
        // Applying bitwise AND to check that each bit store of this checking set
        // has `1`s at the same positions as each bit store of the `val` checking set.
        //
        // Example for `hasAll` returning `true`
        // (applied to a single bit store with index `x` for simplicity):
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
        // (applied to a single bit store with index `x` for simplicity):
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
            (this._bitStores[0] & val.bitStores[0]) === val.bitStores[0] // numbers in range [0, 31]
            &&
            (this._bitStores[1] & val.bitStores[1]) === val.bitStores[1] // numbers in range [32, 63]
            &&
            (this._bitStores[2] & val.bitStores[2]) === val.bitStores[2] // numbers in range [64, 80]
        );
    }

    /**
     * @see {ReadonlyNumsCheckingSet.doesNotHave}
     */
    doesNotHave(val: number) {
        const entry = CellIndicesCheckingSet._CELL_INDEX_TO_BIT_STORE_LOCATORS[val];
        return (this._bitStores[entry.bitStoreIndex] & (1 << entry.bitPosition)) === 0;
    }

    /**
     * @see {ReadonlyNumsCheckingSet.doesNotHaveAny}
     */
    doesNotHaveAny(val: ReadonlyCellIndicesCheckingSet) {
        //
        // Applying bitwise AND to check that each bit store of this checking set
        // does NOT have `1`s at the same positions as each bit store of the `val` checking set.
        //
        // Example for `doesNotHaveAny` returning `true`
        // (applied to a single bit store with index `x` for simplicity):
        // ```
        //      this._bitStores[x]                    = 0b10010101
        //      val.bitStores[x]                      = 0b01101000
        //      this._bitStores[x] & val.bitStores[x] = 0b00000000 (no overlaps on the same bit positions)
        //
        //      (this._bitStores[x] & val.bitStores[x]) === 0
        // ```
        //
        // Example for `doesNotHaveAny` returning `false`
        // (applied to a single bit store with index `x` for simplicity):
        // ```
        //      this._bitStores[x]                    = 0b10010101
        //      val.bitStores[x]                      = 0b00001100
        //      this._bitStores[x] & val.bitStores[x] = 0b00000100 (one overlap on the bit position 3)
        //
        //      (this._bitStores[x] & val.bitStores[x]) !== 0
        // ```
        //
        return (
            (this._bitStores[0] & val.bitStores[0]) === 0 // numbers in range [0, 31]
            &&
            (this._bitStores[1] & val.bitStores[1]) === 0 // numbers in range [32, 63]
            &&
            (this._bitStores[2] & val.bitStores[2]) === 0 // numbers in range [64, 80]
        );
    }

    /**
     * @see {ReadonlyCellIndicesCheckingSet.cells}
     */
    cells() {
        const val = new Array<Cell>();
        let bitStoreIndex = 0;

        // For each bit store ...
        while (bitStoreIndex < 3) {
            // ... take the bit store
            let i = this._bitStores[bitStoreIndex];
            // ... iterate only over `1` bits -- as this bits represent `Cell`s
            while (i !== 0) {
                //
                // Produces a number which has only bit set -
                // and that bit is a `Cell`s bit at the rightmost position.
                // This number is a _power of 2_.
                //
                const rightMostBit = i & -i;

                // Calculating index of the entry in the lookup table.
                const lutIndex = rightMostBit % CellIndicesCheckingSet._POWERS_OF_TWO_LUT_K;

                // Adding a `Cell` from the lookup table.
                val.push(CellIndicesCheckingSet._BITS_TO_CELLS_LUT[bitStoreIndex][lutIndex]);

                // Erasing rightmost `1` bit to `0` to proceed to the next `1` bit (if present) in the follow-up iteration.
                i = i ^ rightMostBit;
            }
            bitStoreIndex++;
        }

        return val;
    }

    /**
     * @see {ReadonlyCellIndicesCheckingSet.and}
     */
    and(val: ReadonlyCellIndicesCheckingSet): ReadonlyCellIndicesCheckingSet {
        const and = CellIndicesCheckingSet.newEmpty();

        //
        // Applying bitwise AND onto each bit store of this checking set and the `val` checking set
        // to produce `1`s on the positions where both sets have `1`s.
        //
        // Example (applied to a single bit store with index `x` for simplicity):
        // ```
        //      this._bitStores[x]                    = 0b10010101
        //      val.bitStores[x]                      = 0b01111100
        //      this._bitStores[x] & val.bitStores[x] = 0b00010100 (`1` on positions 3 and 5)
        // ```
        //
        and._bitStores[0] = this._bitStores[0] & val.bitStores[0];
        and._bitStores[1] = this._bitStores[1] & val.bitStores[1];
        and._bitStores[2] = this._bitStores[2] & val.bitStores[2];

        return and;
    }

    /**
     * @see {ReadonlyCellIndicesCheckingSet.not}
     */
    not(): ReadonlyCellIndicesCheckingSet {
        const not = CellIndicesCheckingSet.newEmpty();

        //
        // Applying bitwise NOT onto each bit store of this checking set
        // to turn `0`s into `1`s and `1`s into `0`s.
        //
        // Example (applied to a single bit store with index `x` for simplicity):
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
        // so that irrelevant `Cell`s will NOT be mapped as _included_ in the set.
        //
        not._bitStores[2] = (~this._bitStores[2] & 0b11111111111111111);

        return not;
    }

    /**
     * @see {NumsCheckingSet.add}
     */
    add(val: ReadonlyCellIndicesCheckingSet) {
        //
        // Applying bitwise OR assignment on the bit stores of this checking set
        // to merge `1`s from the bit stores of the `val` checking set.
        //
        // Example (applied to a single bit store with index `x` for simplicity):
        // ```
        //      this._bitStores[x]                     = 0b10010001
        //      val.bitStores[x]                       = 0b01001000
        //      this._bitStorse[x] |= val.bitStores[x] = 0b11011001
        // ```
        //
        this._bitStores[0] |= val.bitStores[0]; // for numbers in range [0, 31]
        this._bitStores[1] |= val.bitStores[1]; // for numbers in range [32, 63]
        this._bitStores[2] |= val.bitStores[2]; // for numbers in range [64, 80]

        return this;
    }

    /**
     * @see {NumsCheckingSet.remove}
     */
    remove(val: ReadonlyCellIndicesCheckingSet) {
        //
        // Applying bitwise AND assignment on the bit stores of this checking set
        // to merge `1`s from the bit stores of the `val` checking set.
        //
        // Example (applied to a single bit store with index `x` for simplicity):
        // ```
        //      this._bitStores[x]                      = 0b10011001
        //      val.bitStores[x]                        = 0b01001001
        //      ~val.bitStores[x]                       = 0b10110110 (bit inversion gives us value that can be `&`-ed on)
        //      this._bitStores[x] &= ~val.bitStores[x] = 0b10010000
        // ```
        //
        this._bitStores[0] &= ~val.bitStores[0]; // for numbers in range [0, 31]
        this._bitStores[1] &= ~val.bitStores[1]; // for numbers in range [32, 63]
        this._bitStores[2] &= ~val.bitStores[2]; // for numbers in range [64, 80]

        return this;
    }

    /**
     * @see {ReadonlyNumsCheckingSet.equals}
     */
    equals(val: ReadonlyCellIndicesCheckingSet) {
        return (
            this._bitStores[0] === val.bitStores[0] &&
            this._bitStores[1] === val.bitStores[1] &&
            this._bitStores[2] === val.bitStores[2]
        );
    }

    /**
     * @see {NumsCheckingSet.clone}
     */
    clone() {
        return new CellIndicesCheckingSet(this);
    }

}
