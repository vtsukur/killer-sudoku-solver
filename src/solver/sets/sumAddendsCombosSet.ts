import { CachedNumRanges } from '../../util/cachedNumRanges';
import { SumAddendsCombinatorics } from '../math';
import { Combo, ComboKey, ReadonlyCombos } from '../math/combo';
import { Bits32Set, ReadonlyBits32Set } from './bits32Set';
import { BitStore32 } from './numsSet';
import { PowersOf2Lut } from './powersOf2Lut';
import { ReadonlySudokuNumsSet, SudokuNumsSet } from './sudokuNumsSet';

export interface ReadonlySumAddendsCombosSet {

    values: Iterable<Combo>;

    size: number;

    underlyingCombosSet: ReadonlyCombosSet;

}

export class SumAddendsCombosSet implements ReadonlySumAddendsCombosSet {

    private readonly _combinatorics: SumAddendsCombinatorics;
    private readonly _combosSet: CombosSet;

    constructor(combinatorics: SumAddendsCombinatorics, combos?: ReadonlyCombos) {
        this._combinatorics = combinatorics;
        this._combosSet = CombosSet.newEmpty(combinatorics);
        if (combos) {
            for (const combo of combos) {
                this.add(combo);
            }
        }
    }

    static newFilled(combinatorics: SumAddendsCombinatorics) {
        const val = new SumAddendsCombosSet(combinatorics);
        val._combosSet.fill();
        return val;
    }

    get values() {
        return this._combosSet.combos;
    }

    get size() {
        return this._combosSet.combos.length;
    }

    get underlyingCombosSet() {
        return this._combosSet;
    }

    init() {
        this._combosSet.fill();
        return this._combinatorics.allNumsSet;
    }

    reduce(combos: ReadonlySumAddendsCombosSet) {
        const nums = SudokuNumsSet.newEmpty();

        const newCombosSet = new Set<ComboKey>();

        for (const combo of combos.values) {
            nums.addAll(combo.numsSet);
            newCombosSet.add(combo.key);
        }

        for (const combo of this.values) {
            if (!newCombosSet.has(combo.key)) {
                this.delete(combo);
            }
        }

        return nums;
        // return this._combosSet.reduce(combos);
    }

    add(combo: Combo) {
        this._combosSet.add(this._combinatorics.indexOf(combo));
    }

    delete(combo: Combo) {
        this._combosSet.delete(this._combinatorics.indexOf(combo));
    }

    clone() {
        const copy = new SumAddendsCombosSet(this._combinatorics);
        for (const combo of this.values) {
            copy.add(combo);
        }
        return copy;
    }

}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ReadonlyCombosSet extends ReadonlyBits32Set<CombosSet> {

    //clone(): CombosSet;

}

const powersOf2Lut = (() => {
    // Creating empty lookup tables for each bit store.
    const val = new PowersOf2Lut<number>();

    // Iterating over all possible Sudoku numbers.
    for (const index of CachedNumRanges.ZERO_TO_N_LTE_81[32]) {
        val.set(index, index);
    }

    return val;
})();

export class CombosSet extends Bits32Set<ReadonlyCombosSet> implements ReadonlyCombosSet {

    private readonly _combinatorics: SumAddendsCombinatorics;

    private static _NO_COMBOS = [];

    private _combos: ReadonlyArray<Combo> = CombosSet._NO_COMBOS;

    private _numsSet: SudokuNumsSet;

    private _isDirtyCache = true;

    private constructor(
            val: BitStore32,
            combinatorics: SumAddendsCombinatorics) {
        super(val);
        this._combinatorics = combinatorics;
        this._numsSet = SudokuNumsSet.newEmpty();
    }

    protected updateCache(): void {
        this._isDirtyCache = true;
    }

    reduce(combos: ReadonlySumAddendsCombosSet): ReadonlySudokuNumsSet {
        this._bitStore &= combos.underlyingCombosSet.bitStore;
        this._numsSet = SudokuNumsSet.newEmpty();
        for (const combo of this.combos) {
            this._numsSet.addAll(combo.numsSet);
        }
        return this._numsSet;
    }

    get combos() {
        if (this._isDirtyCache) {
            this._combos = powersOf2Lut.collect(this._bitStore).map(index => this._combinatorics.val[index]);
            this._isDirtyCache = false;
        }
        return this._combos;
    }

    fill() {
        this._bitStore = this._combinatorics.combosSet.underlyingCombosSet.bitStore;
        this._numsSet = new SudokuNumsSet(this._combinatorics.allNumsSet);
        this.updateCache();
    }

    static newEmpty(sumAddendsCombinatorics: SumAddendsCombinatorics) {
        return new CombosSet(0, sumAddendsCombinatorics);
    }

    static newRefSet(sumAddendsCombinatorics: SumAddendsCombinatorics): ReadonlyCombosSet {
        let bitStore = 0;
        for (const num of CachedNumRanges.ZERO_TO_N_LTE_81[sumAddendsCombinatorics.val.length]) {
            bitStore |= 1 << num;
        }
        return new CombosSet(bitStore, sumAddendsCombinatorics);
    }

}
