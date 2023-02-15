import { Grid } from '../../puzzle/grid';
import { CachedNumRanges } from './cachedNumRanges';
import { BitStore32, ReadonlyCheckingSet } from './readonlyCheckingSet';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ReadonlyGridRangeNumCheckingSet extends ReadonlyCheckingSet<ReadonlyGridRangeNumCheckingSet> {
    get bitStore(): ReadonlyArray<BitStore32>;
}

type NumToBitStoreBucketMapEntry = {
    bucketIndex: number;
    shiftWithinBucket: number;
}

export class GridRangeNumCheckingSet implements ReadonlyGridRangeNumCheckingSet {
    private _bitStore: Array<BitStore32> = [ 0, 0, 0 ];

    private static _BIT_STORE_BUCKET_SIZE = Grid.CELL_COUNT / 3;

    private static _NUM_TO_BIT_STORE_BUCKET_MAPPING: ReadonlyArray<NumToBitStoreBucketMapEntry> = (() => {
        const val = new Array<NumToBitStoreBucketMapEntry>(Grid.CELL_COUNT);
        for (const num of CachedNumRanges.ZERO_TO_N_LT_81[Grid.CELL_COUNT]) {
            const bucketIndex = Math.floor(num / GridRangeNumCheckingSet._BIT_STORE_BUCKET_SIZE);
            val[num] = {
                bucketIndex,
                shiftWithinBucket: num - bucketIndex * GridRangeNumCheckingSet._BIT_STORE_BUCKET_SIZE
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
            const entry = GridRangeNumCheckingSet._NUM_TO_BIT_STORE_BUCKET_MAPPING[num];

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
            this._bitStore[entry.bucketIndex] |= 1 << entry.shiftWithinBucket;
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
     * @see {ReadonlyGridRangeNumCheckingSet.bitStore}
     */
    get bitStore() {
        return this._bitStore;
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
        //      this._bitStore[x]                   = 0b10010101
        //      val.bitStore[x]                     = 0b10000100
        //      this._bitStore[x] & val.bitStore[x] = 0b10000100
        //
        //      0b10000100 === 0b10000100
        //      (this._bitStore[x] & val.bitStore[x]) === val.bitStore[x]
        //
        // ```
        //
        // Example for `hasAll` returning `false`
        // (applied to a single bit store with index `x` for simplicity):
        // ```
        //      this._bitStore[x]                   = 0b10010101
        //      val.bitStore[x]                     = 0b00001100
        //      this._bitStore[x] & val.bitStore[x] = 0b00000100
        //
        //      0b00001100 !== 0b00000100
        //      (this._bitStore[x] & val.bitStore[x]) !== val.bitStore[x]
        // ```
        //
        return (
            (this._bitStore[0] & val.bitStore[0]) === val.bitStore[0] // numbers in range [0, 26]
            &&
            (this._bitStore[1] & val.bitStore[1]) === val.bitStore[1] // numbers in range [27, 53]
            &&
            (this._bitStore[2] & val.bitStore[2]) === val.bitStore[2] // numbers in range [54, 80]
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
        //      this._bitStore[x]                   = 0b10010101
        //      val.bitStore[x]                     = 0b01101000
        //      this._bitStore[x] & val.bitStore[x] = 0b00000100
        //
        //      (this._bitStore[x] & val.bitStore[x]) === 0
        //
        // ```
        //
        // Example for `doesNotHaveAny` returning `false`
        // (applied to a single bit store with index `x` for simplicity):
        // ```
        //      this._bitStore[x]                   = 0b10010101
        //      val.bitStore[x]                     = 0b00001100
        //      this._bitStore[x] & val.bitStore[x] = 0b00000100
        //
        //      (this._bitStore[x] & val.bitStore[x]) !== 0
        // ```
        //
        return (
            (this._bitStore[0] & val.bitStore[0]) === 0 // numbers in range [0, 26]
            &&
            (this._bitStore[1] & val.bitStore[1]) === 0 // numbers in range [27, 53]
            &&
            (this._bitStore[2] & val.bitStore[2]) === 0 // numbers in range [54, 80]
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
        //      this._bitStore[x]                    = 0b10010001
        //      val.bitStore[x]                      = 0b01001000
        //      this._bitStore[x] |= val.bitStore[x] = 0b11011001
        // ```
        //
        this._bitStore[0] |= val.bitStore[0]; // for numbers in range [0, 26]
        this._bitStore[1] |= val.bitStore[1]; // for numbers in range [27, 53]
        this._bitStore[2] |= val.bitStore[2]; // for numbers in range [54, 80]
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
        //      this._bitStore[x]                     = 0b10011001
        //      val.bitStore[x]                       = 0b01001001
        //      ~val.bitStore[x]                      = 0b10110110
        //      this._bitStore[x] &= ~val.bitStore[x] = 0b10010000
        // ```
        //
        this._bitStore[0] &= ~val.bitStore[0]; // for numbers in range [0, 26]
        this._bitStore[1] &= ~val.bitStore[1]; // for numbers in range [27, 53]
        this._bitStore[2] &= ~val.bitStore[2]; // for numbers in range [54, 80]
    }
}
