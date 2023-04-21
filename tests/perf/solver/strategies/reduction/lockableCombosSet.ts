import { Combo } from '../../../../../src/solver/math';
import { SumCombinatorics } from '../../../../../src/solver/math';
import { BitStore32, CombosSet, ReadonlyCombosSet } from '../../../../../src/solver/sets';
import { Lockable } from './lockable';

export class LockableCombosSet extends CombosSet implements Lockable {

    private _isLocked = false;

    protected constructor(
            val: BitStore32,
            combinatorics: SumCombinatorics) {
        super(val, combinatorics);
    }

    static newEmpty(combinatorics: SumCombinatorics) {
        return new LockableCombosSet(0, combinatorics);
    }

    reduce(combos: ReadonlyCombosSet) {
        return !this._isLocked ? super.reduce(combos) : super.presentNumsSet;
    }

    add(val: number): this {
        return !this._isLocked ? super.add(val) : this;
    }

    addAll(val: ReadonlyCombosSet): this {
        return !this._isLocked ? super.addAll(val) : this;
    }

    addCombo(combo: Combo) {
        if (!this._isLocked) {
            super.addCombo(combo);
        }
    }

    delete(val: number): this {
        return !this._isLocked ? super.delete(val) : this;
    }

    deleteAll(val: ReadonlyCombosSet): this {
        return !this._isLocked ? super.deleteAll(val) : this;
    }

    deleteCombo(combo: Combo) {
        if (!this._isLocked) {
            super.deleteCombo(combo);
        }
    }

    deleteComboFailSafe(combo?: Combo) {
        if (!this._isLocked) {
            super.deleteComboFailSafe(combo);
        }
    }

    setCombosBits(val: number): void {
        if (!this._isLocked) {
            super.setCombosBits(val);
        }
    }

    union(val: ReadonlyCombosSet): this {
        return !this._isLocked ? super.union(val) : this;
    }

    fill() {
        return !this._isLocked ? super.fill() : super.presentNumsSet;
    }

    clear() {
        if (!this._isLocked) {
            return super.clear();
        } else {
            return this;
        }
    }

    lock() {
        this._isLocked = true;
    }

}
