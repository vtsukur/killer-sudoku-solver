import { findSumCombinationsForHouse } from '../../combinatorial/combinatorial';
import { Context } from '../context';

export function initPermsForCagesStrategy(this: Context) {
    this.model.houseModels.forEach(houseModel => {
        const combosForHouse = findSumCombinationsForHouse(houseModel);
        houseModel.cageModels.forEach((cageModel, idx) => {
            const combosKeySet = new Set();
            const combos = new Array<Set<number>>();
            combosForHouse.forEach(combo => {
                const comboSet = combo[idx];
                const key = Array.from(combo[idx]).join();
                if (!combosKeySet.has(key)) {
                    combos.push(comboSet);
                    combosKeySet.add(key);
                }
            });
            cageModel.updateCombinations(combos);
        });
    });

    this.cageModelsToReevaluatePerms = Array.from(this.model.cageModelsMap.values());
}