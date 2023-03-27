import { SumAddendsCombinatorics } from '../math';
import { Combo, ReadonlyCombos } from '../math/combo';
import { Bits32Set, ReadonlyBits32Set } from './bits32Set';
import { BitStore32 } from './numsSet';
import { SudokuNumsSet } from './sudokuNumsSet';

export interface ReadonlyCombosSet extends ReadonlyBits32Set<CombosSet> {

    combos: Iterable<Combo>;

    size: number;

}

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

    protected onUpdate(): void {
        this._isDirtyCache = true;
    }

    get size() {
        // TODO optimize
        return this.combos.length;
    }

    reduce(combos: ReadonlyCombosSet) {
        this._bitStore &= combos.bitStore;
        this.onUpdate();

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
        this._bitStore = this._combinatorics.combosSet.bitStore;
        this.onUpdate();
        return this._combinatorics.allNumsSet;
    }

    clone() {
        return new CombosSet(this._bitStore, this._combinatorics);
    }

    static newEmpty(combinatorics: SumAddendsCombinatorics) {
        return new CombosSet(0, combinatorics);
    }

    static newFilled(combinatorics: SumAddendsCombinatorics) {
        const val = CombosSet.newEmpty(combinatorics);
        val.fill();
        return val;
    }

    static from(combinatorics: SumAddendsCombinatorics, combos: ReadonlyCombos) {
        const val = CombosSet.newEmpty(combinatorics);
        for (const combo of combos) {
            val.addCombo(combo);
        }
        return val;
    }

}

export type ReadonlyCombosSets = ReadonlyArray<ReadonlyCombosSet>;
