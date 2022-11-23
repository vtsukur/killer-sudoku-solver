import { findSumCombinationsForHouse } from '../../combinatorial/index';
import { BaseStrategy } from '../baseStrategy';

export class InitPermsForCagesStrategy extends BaseStrategy {
    constructor(model) {
        super(model);
    }

    apply() {
        this.model.houseSolvers.forEach(houseSolver => {
            const combosForHouse = findSumCombinationsForHouse(houseSolver);
            houseSolver.debugCombosForHouse = combosForHouse;
            houseSolver.cages.forEach((cage, idx) => {
                const cageModel = this.model.cageModelsMap.get(cage.key);
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
    }
}
