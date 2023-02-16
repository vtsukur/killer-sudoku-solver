import { Grid } from '../../puzzle/grid';
import { CachedNumRanges } from './cachedNumRanges';
import { BitStore32, ReadonlyCheckingSet } from './readonlyCheckingSet';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ReadonlyGridRangeNumCheckingSet extends ReadonlyCheckingSet<ReadonlyGridRangeNumCheckingSet> {
    get bitStores(): ReadonlyArray<BitStore32>;
}

type NumToBitStoreMapEntry = {
    index: number;
    shift: number;
}

export class GridRangeNumCheckingSet implements ReadonlyGridRangeNumCheckingSet {
    private _bitStores: Array<BitStore32> = [ 0, 0, 0 ];

    private static _BIT_STORE_SIZE = 32;

    private static _NUM_TO_BIT_STORE_MAPPING: ReadonlyArray<NumToBitStoreMapEntry> = (() => {
        const val = new Array<NumToBitStoreMapEntry>(Grid.CELL_COUNT);
        for (const num of CachedNumRanges.ZERO_TO_N_LT_81[Grid.CELL_COUNT]) {
            const bucketIndex = Math.floor(num / GridRangeNumCheckingSet._BIT_STORE_SIZE);
            val[num] = {
                index: bucketIndex,
                shift: num - bucketIndex * GridRangeNumCheckingSet._BIT_STORE_SIZE
            };
        }
        return val;
    })();

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
    private constructor(val: ReadonlyArray<number>) {
        for (const num of val) {
            const entry = GridRangeNumCheckingSet._NUM_TO_BIT_STORE_MAPPING[num];

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
            this._bitStores[entry.index] |= 1 << entry.shift;
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
        return new GridRangeNumCheckingSet(val);
    }

    /**
     * @see {ReadonlyGridRangeNumCheckingSet.bitStores}
     */
    get bitStores() {
        return this._bitStores;
    }

    /**
     * @see {ReadonlyCheckingSet.hasAll}
     */
    hasAll(val: ReadonlyGridRangeNumCheckingSet) {
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
     * @see {ReadonlyheckingSet.doesNotHaveAny}
     */
    doesNotHaveAny(val: ReadonlyGridRangeNumCheckingSet) {
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
        //
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
     * Adds all numbers from another checking set to this checking set.
     *
     * This method changes this checking set and does NOT modify `val` checking set.
     *
     * Only the numbers which are NOT yet present in this checking set are added.
     * Duplicate numbers are ignored.
     *
     * @param val - Another checking set containing numbers to add to this set.
     */
    add(val: ReadonlyGridRangeNumCheckingSet) {
        //
        // Applying bitwise OR assignment on the bit stores of this checking set
        // to merge `1`s from the bit stores of `val` checking set.
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
    }

    /**
     * Removes all numbers present in another checking set from this checking set.
     *
     * This method changes this checking set and does NOT modify `val` checking set.
     *
     * Only the numbers which are present in this checking set are removed.
     * Missing numbers are ignored.
     *
     * @param val - Another checking set containing numbers to remove from this checking set.
     */
    remove(val: ReadonlyGridRangeNumCheckingSet) {
        //
        // Applying bitwise AND assignment on the bit stores of this checking set
        // to merge `1`s from the bit stores of `val` checking set.
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
    }
}
