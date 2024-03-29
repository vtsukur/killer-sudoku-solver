import { Combo, ReadonlyCombos, SumCombinatorics } from '../math';
import { Bits32Set, ReadonlyBits32Set } from './bits32Set';
import { Bits32 } from './numsSet';
import { SudokuNumsSet } from './sudokuNumsSet';

export interface ReadonlyCombosSet extends ReadonlyBits32Set<CombosSet> {

    combos: Iterable<Combo>;

    size: number;

}

export class CombosSet extends Bits32Set<ReadonlyCombosSet> implements ReadonlyCombosSet {

    private readonly _combinatorics: SumCombinatorics;

    private static _NO_COMBOS = [];

    private _combos: ReadonlyArray<Combo> = CombosSet._NO_COMBOS;

    private _isDirtyCache = true;

    protected constructor(
            val: Bits32,
            combinatorics: SumCombinatorics) {
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
        this._bits &= combos.bits;
        this.onUpdate();

        return this.presentNumsSet;
    }

    protected get presentNumsSet() {
        return this._combinatorics.combosNumsSetLut.reduce(this._bits, SudokuNumsSet.newEmpty(), SudokuNumsSet.accumulator);
    }

    hasCombo(combo?: Combo) {
        return combo ? this.has(combo.index) : false;
    }

    addCombo(combo: Combo) {
        this.add(combo.index);
    }

    setCombosBits(val: Bits32) {
        this._bits = val;
        this.onUpdate();
    }

    deleteCombo(combo: Combo) {
        this.delete(combo.index);
    }

    deleteComboFailSafe(combo?: Combo) {
        if (combo) {
            this.delete(combo.index);
        }
    }

    get combos() {
        if (this._isDirtyCache) {
            this._combos = this._combinatorics.combosLut.collect(this._bits);
            this._isDirtyCache = false;
        }
        return this._combos;
    }

    fill() {
        this._bits = this._combinatorics.combosSet.bits;
        this.onUpdate();
        return this._combinatorics.allNumsSet;
    }

    clear() {
        this._bits = 0;
        this.onUpdate();
        return this;
    }

    clone() {
        return new CombosSet(this._bits, this._combinatorics);
    }

    static newEmpty(combinatorics: SumCombinatorics) {
        return new CombosSet(0, combinatorics);
    }

    static newFilled(combinatorics: SumCombinatorics) {
        const val = CombosSet.newEmpty(combinatorics);
        val.fill();
        return val;
    }

    static from(combinatorics: SumCombinatorics, combos: ReadonlyCombos) {
        const val = CombosSet.newEmpty(combinatorics);
        for (const combo of combos) {
            val.addCombo(combo);
        }
        return val;
    }

}

export type ReadonlyCombosSets = ReadonlyArray<ReadonlyCombosSet>;
