// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Cell } from '../../puzzle/cell';
import { Grid } from '../../puzzle/grid';
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
    private static readonly _CELL_INDEX_TO_BIT_STORE_LOCATORS: ReadonlyArray<CellIndexToBitStoreLocator> = Grid.CELL_INDICES_RANGE.map(cellIndex => {
        const bitStoreIndex = Math.floor(cellIndex / CellIndicesCheckingSet._BITS_PER_BIT_STORE);
        const bitPosition = cellIndex - bitStoreIndex * CellIndicesCheckingSet._BITS_PER_BIT_STORE;
        return { bitStoreIndex, bitPosition };
    });

    /**
     * Constructs new checking set from the unique numbers in the given array.
     *
     * In case array is specified, only unique numbers are added to the checking set.
     * Number duplicates are silently ignored.
     *
     * Checking set is constructed as empty if no numbers are given.
     *
     * @param val - Array of numbers to construct this checking set from.
     */
    constructor(val?: ReadonlyArray<number>) {
        if (val) {
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
        return this._bitStores[0] === val.bitStores[0] &&
            this._bitStores[1] === val.bitStores[1] &&
            this._bitStores[2] === val.bitStores[2];
    }

    /**
     * @see {NumsCheckingSet.clone}
     */
    clone() {
        const val = new CellIndicesCheckingSet();
        val._bitStores[0] = this._bitStores[0];
        val._bitStores[1] = this._bitStores[1];
        val._bitStores[2] = this._bitStores[2];
        return val;
    }

}
