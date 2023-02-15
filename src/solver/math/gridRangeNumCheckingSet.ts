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
        return (this._bitStore[0] & val.bitStore[0]) === val.bitStore[0] &&
            (this._bitStore[1] & val.bitStore[1]) === val.bitStore[1] &&
            (this._bitStore[2] & val.bitStore[2]) === val.bitStore[2];
    }

    /**
     * @see {ReadonlyheckingSet.doesNotHaveAny}
     */
    doesNotHaveAny(val: ReadonlyGridRangeNumCheckingSet) {
        return (this._bitStore[0] & val.bitStore[0]) === 0 &&
            (this._bitStore[1] & val.bitStore[1]) === 0 &&
            (this._bitStore[2] & val.bitStore[2]) === 0;
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
        this._bitStore[0] |= val.bitStore[0];
        this._bitStore[1] |= val.bitStore[1];
        this._bitStore[2] |= val.bitStore[2];
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
        this._bitStore[0] &= ~val.bitStore[0];
        this._bitStore[1] &= ~val.bitStore[1];
        this._bitStore[2] &= ~val.bitStore[2];
    }
}
