import { findSumCombinationsForHouse } from '../../combinatorial/combinatorial';
import { Strategy } from '../strategy';

export class InitPermsForCagesStrategy extends Strategy {
    execute() {
        this._model.houseModels.forEach(houseM => {
            const combosForHouse = findSumCombinationsForHouse(houseM);
            houseM.cageModels.forEach((cageModel, index) => {
                const combosKeySet = new Set();
                const combos = new Array<Set<number>>();
                combosForHouse.forEach(combo => {
                    const comboSet = combo[index];
                    const key = Array.from(combo[index]).join();
                    if (!combosKeySet.has(key)) {
                        combos.push(comboSet);
                        combosKeySet.add(key);
                    }
                });
                cageModel.updateCombinations(combos);
            });
        });
    
        this._context.setCageModelsToTryReduceForToAll();
    }    
}
