import { Cage } from '../../../../../src/puzzle/cage';
import { CageModel } from '../../../../../src/solver/models/elements/cageModel';
import { CombosSet, ReadonlyCombosSet } from '../../../../../src/solver/sets';
import { MasterModelReduction } from '../../../../../src/solver/strategies/reduction/masterModelReduction';
import { Lockable } from './lockable';
import { LockableCellModel } from './lockableCellModel';
import { LockableCombosSet } from './lockableCombosSet';

export class LockableCageModel extends CageModel implements Lockable {

    private _isLocked = false;

    private readonly _lockableCellMs: ReadonlyArray<LockableCellModel>;

    constructor(cage: Cage, cellMs: Array<LockableCellModel>, comboSet?: LockableCombosSet) {
        super(cage, cellMs, comboSet);
        this._lockableCellMs = cellMs;
    }

    protected newSumAddendsCombosSet(): CombosSet {
        return LockableCombosSet.newEmpty(this._sumAddendsCombinatorics);
    }

    initialReduce(reduction?: MasterModelReduction) {
        if (!this._isLocked) {
            super.initialReduce(reduction);
        }
    }

    reduceCombos(combos: ReadonlyCombosSet, reduction: MasterModelReduction) {
        if (!this._isLocked) {
            super.reduceCombos(combos, reduction);
        }
    }

    reduce(reduction: MasterModelReduction) {
        if (!this._isLocked) {
            super.reduce(reduction);
        }
    }

    reduceToCombinationsContaining(withNum: number, reduction: MasterModelReduction) {
        if (!this._isLocked) {
            super.reduceToCombinationsContaining(withNum, reduction);
        }
    }

    lock() {
        this._isLocked = true;
        for (const cellM of this._lockableCellMs) {
            cellM.lock();
        }
        (this.comboSet as LockableCombosSet).lock();
    }

}
