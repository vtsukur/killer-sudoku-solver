import { findSumCombinationsForHouse } from '../../combinatorial/combinatorial';
import { Context } from '../context';

export function initPermsForCagesStrategy(this: Context) {
    this.model.houseModels.forEach(houseM => {
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

    this.cageModelsToReevaluatePerms = Array.from(this.model.cageModelsMap.values());
}
