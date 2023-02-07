import { Combo, combosAndPermsForHouse } from '../../math';
import { Strategy } from '../strategy';

export class InitPermsForCagesStrategy extends Strategy {
    execute() {
        this._model.houseModels.forEach(houseM => {
            const houseCombos = combosAndPermsForHouse(houseM);
            houseM.cageModels.forEach((cageModel, index) => {
                const combosKeySet = new Set();
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
