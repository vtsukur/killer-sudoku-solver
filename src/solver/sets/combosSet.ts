import { Combo, ISumAddendsCombinatorics, ReadonlyCombos } from '../math/combo';
import { Bits32Set, ReadonlyBits32Set } from './bits32Set';
import { BitStore32 } from './numsSet';
import { SudokuNumsSet } from './sudokuNumsSet';

export interface ReadonlyCombosSet extends ReadonlyBits32Set<CombosSet> {

    combos: Iterable<Combo>;

    size: number;

}

export class CombosSet extends Bits32Set<ReadonlyCombosSet> implements ReadonlyCombosSet {

    private readonly _combinatorics: ISumAddendsCombinatorics;

    private static _NO_COMBOS = [];

    private _combos: ReadonlyArray<Combo> = CombosSet._NO_COMBOS;

    private _isDirtyCache = true;

    protected constructor(
            val: BitStore32,
            combinatorics: ISumAddendsCombinatorics) {
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

        return this.presentNumsSet;
    }

    protected get presentNumsSet() {
        return this._combinatorics.combosNumsSetLut.reduce(this._bitStore, SudokuNumsSet.newEmpty(), SudokuNumsSet.accumulator);
    }

    hasCombo(combo?: Combo) {
        return combo ? this.has(this._combinatorics.optimisticIndexOf(combo)) : false;
    }

    addCombo(combo: Combo) {
        this.add(this._combinatorics.optimisticIndexOf(combo));
    }

    setCombosBits(val: BitStore32) {
        this._bitStore = val;
        this.onUpdate();
    }

    deleteCombo(combo: Combo) {
        this.delete(this._combinatorics.optimisticIndexOf(combo));
    }

    deleteComboFailSafe(combo?: Combo) {
        if (combo) {
            const index = this._combinatorics.indexOf(combo);
            if (index !== undefined) {
                this.delete(index);
            }
        }
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

    clear() {
        this._bitStore = 0;
        this.onUpdate();
        return this;
    }

    clone() {
        return new CombosSet(this._bitStore, this._combinatorics);
    }

    static newEmpty(combinatorics: ISumAddendsCombinatorics) {
        return new CombosSet(0, combinatorics);
    }

    static newFilled(combinatorics: ISumAddendsCombinatorics) {
        const val = CombosSet.newEmpty(combinatorics);
        val.fill();
        return val;
    }

    static from(combinatorics: ISumAddendsCombinatorics, combos: ReadonlyCombos) {
        const val = CombosSet.newEmpty(combinatorics);
        for (const combo of combos) {
            val.addCombo(combo);
        }
        return val;
    }

}

export type ReadonlyCombosSets = ReadonlyArray<ReadonlyCombosSet>;
