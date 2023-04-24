export class PowersOf2Lut<T> {

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
    private static readonly _K = 37;

    private readonly _vals: Array<T>;

    constructor() {
        this._vals = new Array<T>(PowersOf2Lut._K);
    }

    static lutIndex(rightMostBit: number) {
        return rightMostBit % this._K;
    };

    static rightMostBit(val: number) {
        //
        // Producing a number that has only 1 bit set to `1` -
        // and that bit is a number's bit at the rightmost position.
        // This number is a _power of 2_.
        //
        return val & -val;
    };

    static resetRightMostBit(val: number, rightMostBit: number) {
        //
        // Reset rightmost `1` bit to `0` so that the next iteration
        // find next `1` bit (if present) in the right-to-left direction.
        //
        return val ^ rightMostBit;
    };

    set(index: number, val: T) {
        //
        // Calculating index of the entry in the lookup table.
        //
        //  - `index % this._BITS_PER_BIT_STORE` returns index of the `Cell`s bit in the bit store.
        //  - `1 << (index % this._BITS_PER_BIT_STORE)` produces a number which has only 1 bit set -
        //    and that bit is a `Cell`s bit. This number is a _power of 2_.
        //  - modulo on `K` produces unique small number for 32-bit _power of 2_ integer.
        //
        // Example:
        //  - `index`                                                                 // => `35`
        //  - `index % this._BITS_PER_BIT_STORE`                                      // => `3`
        //  - `1 << (index % this._BITS_PER_BIT_STORE)`                               // => `8`
        //  - `(1 << (index % this._BITS_PER_BIT_STORE)) % this._POWERS_OF_TWO_LUT_K` // => `34` (see {@link _POWERS_OF_TWO_LUT_K})
        //
        const lutIndex = (1 << index) % PowersOf2Lut._K;

        // Storing `Cell` value in the lookup table.
        this._vals[lutIndex] = val;
    }

    get(rightMostBit: number) {
        // Calculating index of the entry in the lookup table.
        const lutIndex = rightMostBit % PowersOf2Lut._K;

        // Extracting value by index.
        return this._vals[lutIndex];
    }

    collect(bits: number, to: Array<T> = new Array<T>): ReadonlyArray<T> {
        // Capturing bit store value.
        let i = bits;

        // For fast iteration consider `1` bits ONLY -- as these bits represent included numbers.
        while (i !== 0) {
            //
            // Produce a number which has only 1 bit set to `1` -
            // and that bit is a number's bit at the rightmost position.
            // This number is a _power of 2_.
            //
            const rightMostBit = PowersOf2Lut.rightMostBit(i);

            // Add a `Cell` from the lookup table.
            to.push(this.get(rightMostBit));

            //
            // Reset rightmost `1` bit to `0` so that the next iteration
            // find next `1` bit (if present) in the right-to-left direction.
            //
            i = PowersOf2Lut.resetRightMostBit(i, rightMostBit);
        }

        return to;
    }

    reduce<V extends T>(bits: number, accumulator: V, fn: (accumulator: V, current: T) => void): T {
        // Capturing bit store value.
        let i = bits;

        // For fast iteration consider `1` bits ONLY -- as these bits represent included numbers.
        while (i !== 0) {
            //
            // Produce a number which has only 1 bit set to `1` -
            // and that bit is a number's bit at the rightmost position.
            // This number is a _power of 2_.
            //
            const rightMostBit = PowersOf2Lut.rightMostBit(i);

            // Add a `Cell` from the lookup table.
            fn(accumulator, this.get(rightMostBit));

            //
            // Reset rightmost `1` bit to `0` so that the next iteration
            // find next `1` bit (if present) in the right-to-left direction.
            //
            i = PowersOf2Lut.resetRightMostBit(i, rightMostBit);
        }

        return accumulator;
    }

}
