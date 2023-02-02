import { RichSet } from '../../../util/richSet';
import { Combo, combosForHouse } from '../../math';
import { Strategy } from '../strategy';

export class InitPermsForCagesStrategy extends Strategy {
    execute() {
        this._model.houseModels.forEach(houseM => {
            const houseCombos = combosForHouse(houseM);
            houseM.cageModels.forEach((cageModel, index) => {
                const combosKeySet = new RichSet();
                const combos = new Array<Combo>();
                houseCombos.forEach(comboRow => {
                    const combo = comboRow[index];
                    const key = combo.key;
                    if (!combosKeySet.has(key)) {
                        combos.push(combo);
                        combosKeySet.add(key);
                    }
                });
                cageModel.updateCombinations(combos);
            });
        });

        this._context.setCageModelsToReduceToAll();
    }
}
