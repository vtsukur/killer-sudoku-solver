import { findSumCombinationsForHouse } from '../../combinatorial/combinatorial';

export function initPermsForCagesStrategy() {
    this.model.houseModels.forEach(houseModel => {
        const combosForHouse = findSumCombinationsForHouse(houseModel);
        houseModel.debugCombosForHouse = combosForHouse;
        houseModel.cageModels.forEach((cageModel, idx) => {
            const combosKeySet = new Set();
            const combos = [];
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

    this.cageModelsToReevaluatePerms = this.model.cageModelsMap.values();
}
