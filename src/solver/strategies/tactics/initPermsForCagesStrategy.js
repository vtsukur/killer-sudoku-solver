import { findSumCombinationsForHouse } from '../../combinatorial/combinatorial';
import { BaseStrategy } from '../baseStrategy';

export class InitPermsForCagesStrategy extends BaseStrategy {
    constructor() {
        super();
    }

    apply(ctx) {
        ctx.model.houseModels.forEach(houseModel => {
            const combosForHouse = findSumCombinationsForHouse(houseModel);
            houseModel.debugCombosForHouse = combosForHouse;
            houseModel.cages.forEach((cage, idx) => {
                const cageModel = ctx.model.cageModelsMap.get(cage.key);
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

        ctx.cageModelsToReevaluatePerms = ctx.model.cageModelsMap.values();
    }
}
