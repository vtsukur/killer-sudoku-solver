import { SumAddendsCombinatorics } from '../math';
import { Combo, ReadonlyCombos } from '../math/combo';
import { Bits32Set, ReadonlyBits32Set } from './bits32Set';
import { BitStore32 } from './numsSet';
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
        this._combosSet.deleteCombo(combo);
    }

    clone() {
        const copy = new SumAddendsCombosSet(this._combinatorics);
        for (const combo of this.values) {
            copy.add(combo);
        }
        return copy;
    }

}

interface ReadonlyCombosSet extends ReadonlyBits32Set<CombosSet> {

    // TODO rename to `combos` or `val`
    values: Iterable<Combo>;

    size: number;

}

class CombosSet extends Bits32Set<ReadonlyCombosSet> implements ReadonlyCombosSet {

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

    get values() {
        return this.combos;
    }

    get size() {
        // TODO optimize
        return this.combos.length;
    }

    reduce(combos: ReadonlySumAddendsCombosSet) {
        this._bitStore &= combos.underlyingCombosSet.bitStore;
        this.updateCache();

        return this._combinatorics.combosNumsSetLut.reduce(this._bitStore, SudokuNumsSet.newEmpty(), SudokuNumsSet.accumulator);
    }

    addCombo(combo: Combo) {
        this.add(this._combinatorics.indexOf(combo));
    }

    deleteCombo(combo: Combo) {
        this.delete(this._combinatorics.indexOf(combo));
    }

    get combos() {
        if (this._isDirtyCache) {
            this._combos = this._combinatorics.combosLut.collect(this._bitStore);
            this._isDirtyCache = false;
        }
        return this._combos;
    }

    fill() {
        this._bitStore = this._combinatorics.combosSet.underlyingCombosSet.bitStore;
        this.updateCache();
    }

    static newEmpty(combinatorics: SumAddendsCombinatorics) {
        return new CombosSet(0, combinatorics);
    }

}
