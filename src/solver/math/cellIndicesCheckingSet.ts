// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Cell } from '../../puzzle/cell';
import { GridSizeAndCellPositionsIteration } from '../../puzzle/gridSizeAndCellPositionsIteration';
import { CachedNumRanges } from './cachedNumRanges';
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
    // as the amount of required values is 81:
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private static _POWERS_OF_2_TO_BIT_INDEX: any = (() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const val: any = {};
        CachedNumRanges.ZERO_TO_N_LTE_81[this._BITS_PER_BIT_STORE].forEach(bitIndex => {
            val[1 << bitIndex] = bitIndex;
        });
        return val;
    })();

    private static _BITSTORE_INDEX_OFFSETS: ReadonlyArray<number> = [
        0,
        this._BITS_PER_BIT_STORE,
        Math.imul(this._BITS_PER_BIT_STORE, 2)
    ];

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
        while (bitStoreIndex < 3) {
            let i = this._bitStores[bitStoreIndex];
            const indexOffset = CellIndicesCheckingSet._BITSTORE_INDEX_OFFSETS[bitStoreIndex];
            while (i !== 0) {
                const rightMostBit = i & -i;
                const indexWithinStore = CellIndicesCheckingSet._POWERS_OF_2_TO_BIT_INDEX[rightMostBit];
                const absIndex = indexOffset + indexWithinStore;
                const row = ~~(absIndex / 9);
                const col = absIndex % 9;
                val.push(Cell.at(row, col));
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
        not._bitStores[0] = ~this._bitStores[0];
        not._bitStores[1] = ~this._bitStores[1];
        not._bitStores[2] = (~this._bitStores[2] & 0b11111111111111111); // right bits after index 80 should be cleared.
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
