import { CachedNumRanges } from '../../util/cachedNumRanges';
import { SumAddendsCombinatorics } from '../math';
import { Combo, ComboKey, ReadonlyCombos } from '../math/combo';
import { Bits32Set, ReadonlyBits32Set } from './bits32Set';
import { BitStore32 } from './numsSet';
import { PowersOf2Lut } from './powersOf2Lut';

export class SumAddendsCombosSet {

    private readonly _combosMap = new Map<ComboKey, Combo>();

    get values() {
        return this._combosMap.values();
    }

    get size() {
        return this._combosMap.size;
    }

    add(combo: Combo) {
        this._combosMap.set(combo.key, combo);
    }

    delete(combo: Combo) {
        this._combosMap.delete(combo.key);
    }

}

export class SumAddendsCombosSetPerf {

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

    add(combo: Combo) {
        this._combosSet.add(this._combinatorics.indexOf(combo));
    }

    delete(combo: Combo) {
        this._combosSet.delete(this._combinatorics.indexOf(combo));
    }

}

export interface ReadonlyCombosSet extends ReadonlyBits32Set<CombosSet> {

    clone(): CombosSet;

}

const powersOf2Lut = new PowersOf2Lut<number>();

export class CombosSet extends Bits32Set<ReadonlyCombosSet> implements ReadonlyCombosSet {

    private readonly _combinatorics: SumAddendsCombinatorics;

    private _combos: ReadonlyArray<Combo>;

    private constructor(
            val: BitStore32,
            combinatorics: SumAddendsCombinatorics,
            combos: ReadonlyCombos = combinatorics.val) {
        super(val);
        this._combinatorics = combinatorics;
        this._combos = combos;
    }

    protected updateCache(): void {
        // this._combos = powersOf2Lut.collect(this._bitStore).map(index => this._combinatorics.val[index]);
    }

    get combos() {
        return powersOf2Lut.collect(this._bitStore).map(index => this._combinatorics.val[index]);
    }

    static newRefSet(sumAddendsCombinatorics: SumAddendsCombinatorics): ReadonlyCombosSet {
        let bitStore = 0;
        for (const num of CachedNumRanges.ZERO_TO_N_LTE_81[sumAddendsCombinatorics.val.length]) {
            bitStore |= 1 << num;
        }
        return new CombosSet(bitStore, sumAddendsCombinatorics);
    }

    clone(): CombosSet {
        return new CombosSet(this._bitStore, this._combinatorics, this.combos);
    }

}
