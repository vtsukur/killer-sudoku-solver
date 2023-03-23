import { CachedNumRanges } from '../../util/cachedNumRanges';
import { SumAddendsCombinatorics } from '../math';
import { Combo, ReadonlyCombos } from '../math/combo';
import { Bits32Set, ReadonlyBits32Set } from './bits32Set';
import { BitStore32 } from './numsSet';
import { PowersOf2Lut } from './powersOf2Lut';
import { SudokuNumsSet } from './sudokuNumsSet';

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
        return this._combosSet.reduce(combos);
    }

    add(combo: Combo) {
        this._combosSet.addCombo(combo);
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

    // private _numsSet: SudokuNumsSet;

    private _isDirtyCache = true;

    constructor(
            val: BitStore32,
            combinatorics: SumAddendsCombinatorics) {
        super(val);
        this._combinatorics = combinatorics;
        // this._numsSet = SudokuNumsSet.newEmpty();
    }

    protected updateCache(): void {
        this._isDirtyCache = true;
    }

    reduce(combos: ReadonlySumAddendsCombosSet) {
        this._bitStore &= combos.underlyingCombosSet.bitStore;
        this.updateCache();

        const numsSet = SudokuNumsSet.newEmpty();
        for (const combo of this.combos) {
            numsSet.addAll(combo.numsSet);
        }
        return numsSet;
    }

    addCombo(combo: Combo) {
        this.add(this._combinatorics.indexOf(combo));
        // this._numsSet.addAll(combo.numsSet);
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
        this.updateCache();
    }

    static newEmpty(sumAddendsCombinatorics: SumAddendsCombinatorics) {
        return new CombosSet(0, sumAddendsCombinatorics);
    }

}
