import { findSumCombinationsForHouse } from '../../combinatorial/combinatorial';
import { Combo } from '../../combinatorial/combo';
import { Strategy } from '../strategy';

export class InitPermsForCagesStrategy extends Strategy {
    execute() {
        this._model.houseModels.forEach(houseM => {
            const combosForHouse = findSumCombinationsForHouse(houseM);
            houseM.cageModels.forEach((cageModel, index) => {
                const combosKeySet = new Set();
                const combos = new Array<Combo>();
                combosForHouse.forEach(comboRow => {
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
