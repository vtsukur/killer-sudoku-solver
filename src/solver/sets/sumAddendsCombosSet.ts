import { CachedNumRanges } from '../../util/cachedNumRanges';
import { SumAddendsCombinatorics } from '../math';
import { Combo, ComboKey, ReadonlyCombos } from '../math/combo';
import { Bits32Set, ReadonlyBits32Set } from './bits32Set';
import { BitStore32 } from './numsSet';
import { PowersOf2Lut } from './powersOf2Lut';
import { ReadonlySudokuNumsSet, SudokuNumsSet } from './sudokuNumsSet';

export interface ISumAddendsCombosSet {

    values: Iterable<Combo>;

    size: number;

    init(): ReadonlySudokuNumsSet;

    reduce(combos: ReadonlyCombos): ReadonlySudokuNumsSet;

    add(combo: Combo): void;

    delete(combo: Combo): void;

    clone(): ISumAddendsCombosSet;

}

export class SumAddendsCombosSet implements ISumAddendsCombosSet {

    private readonly _combinatorics: SumAddendsCombinatorics;
    private readonly _combosMap = new Map<ComboKey, Combo>();

    constructor(combinatorics: SumAddendsCombinatorics) {
        this._combinatorics = combinatorics;
    }

    get values() {
        return this._combosMap.values();
    }

    get size() {
        return this._combosMap.size;
    }

    init() {
        const nums = SudokuNumsSet.newEmpty();

        for (const combo of this._combinatorics.val) {
            nums.addAll(combo.numsSet);
            this.add(combo);
        }

        return nums;
    }

    reduce(combos: ReadonlyCombos) {
        const nums = SudokuNumsSet.newEmpty();

        const newCombosSet = new Set<ComboKey>();

        for (const combo of combos) {
            nums.addAll(combo.numsSet);
            newCombosSet.add(combo.key);
        }

        for (const combo of this.values) {
            if (!newCombosSet.has(combo.key)) {
                this.delete(combo);
            }
        }

        return nums;
    }

    add(combo: Combo) {
        this._combosMap.set(combo.key, combo);
    }

    delete(combo: Combo) {
        this._combosMap.delete(combo.key);
    }

    clone() {
        const copy = new SumAddendsCombosSet(this._combinatorics);
        for (const combo of this.values) {
            copy.add(combo);
        }
        return copy;
    }

}

export class SumAddendsCombosSetPerf implements ISumAddendsCombosSet {

    private readonly _combinatorics: SumAddendsCombinatorics;
    private readonly _combosSet: CombosSet;

    constructor(combinatorics: SumAddendsCombinatorics) {
        this._combinatorics = combinatorics;
        this._combosSet = CombosSet.newEmpty(combinatorics);
    }

    get values() {
        return this._combosSet.combos;
    }

    get size() {
        return this._combosSet.combos.length;
    }

    init() {
        this._combosSet.fill();
        return this._combinatorics.allNumsSet;
    }

    reduce(combos: ReadonlyCombos) {
        const nums = SudokuNumsSet.newEmpty();

        const newCombosSet = new Set<ComboKey>();

        for (const combo of combos) {
            nums.addAll(combo.numsSet);
            newCombosSet.add(combo.key);
        }

        for (const combo of this.values) {
            if (!newCombosSet.has(combo.key)) {
                this.delete(combo);
            }
        }

        return nums;
    }

    add(combo: Combo) {
        this._combosSet.add(this._combinatorics.indexOf(combo));
    }

    delete(combo: Combo) {
        this._combosSet.delete(this._combinatorics.indexOf(combo));
    }

    clone() {
        const copy = new SumAddendsCombosSetPerf(this._combinatorics);
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

    private _isDirtyCache = true;

    private constructor(
            val: BitStore32,
            combinatorics: SumAddendsCombinatorics) {
        super(val);
        this._combinatorics = combinatorics;
    }

    protected updateCache(): void {
        this._isDirtyCache = true;
    }

    get combos() {
        if (this._isDirtyCache) {
            this._combos = powersOf2Lut.collect(this._bitStore).map(index => this._combinatorics.val[index]);
            this._isDirtyCache = false;
        }
        return this._combos;
    }

    fill() {
        this._bitStore = this._combinatorics.combosSet.bitStore;
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
