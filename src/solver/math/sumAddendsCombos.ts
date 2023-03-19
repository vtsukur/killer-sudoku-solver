import { Combo, ComboKey } from './combo';

export class SumAddendsCombos {

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

    delete(key: ComboKey) {
        this._combosMap.delete(key);
    }

}
