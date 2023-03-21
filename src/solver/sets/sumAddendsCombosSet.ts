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

    update(combos: ReadonlyCombos): ReadonlySudokuNumsSet;

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

    update(combos: ReadonlyCombos) {
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
        this._combosSet = combinatorics.combosSet.clone();
    }

    get values() {
        return this._combosSet.combos;
    }

    get size() {
        return this._combosSet.combos.length;
    }

    init() {
        const nums = SudokuNumsSet.newEmpty();

        for (const combo of this._combinatorics.val) {
            nums.addAll(combo.numsSet);
            this.add(combo);
        }

        return nums;
    }

    update(combos: ReadonlyCombos) {
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

export interface ReadonlyCombosSet extends ReadonlyBits32Set<CombosSet> {

    clone(): CombosSet;

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

    // private _combos: ReadonlyArray<Combo>;

    private constructor(
            val: BitStore32,
            combinatorics: SumAddendsCombinatorics) {
        super(val);
        this._combinatorics = combinatorics;
        // this._combos = combos;
    }

    protected updateCache(): void {
        // this._combos = powersOf2Lut.collect(this._bitStore).map(index => this._combinatorics.val[index]);
    }

    get combos() {
        return powersOf2Lut.collect(this._bitStore).map(index => this._combinatorics.val[index]);
    }

    static newRefSet(sumAddendsCombinatorics: SumAddendsCombinatorics): ReadonlyCombosSet {
        // let bitStore = 0;
        // for (const num of CachedNumRanges.ZERO_TO_N_LTE_81[sumAddendsCombinatorics.val.length]) {
        //     bitStore |= 1 << num;
        // }
        return new CombosSet(0, sumAddendsCombinatorics);
    }

    clone(): CombosSet {
        return new CombosSet(this._bitStore, this._combinatorics);
    }

}
