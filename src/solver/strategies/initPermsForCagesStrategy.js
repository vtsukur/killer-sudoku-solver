import { findSumCombinationsForHouse } from '../combinatorial';
import { BaseModelStrategy } from './baseModelStrategy';

export class InitPermsForCagesStrategy extends BaseModelStrategy {
    constructor(model) {
        super(model);
    }

    apply() {
        this.model.houseSolvers.forEach(houseSolver => {
            const combosForHouse = findSumCombinationsForHouse(houseSolver);
            houseSolver.debugCombosForHouse = combosForHouse;
            houseSolver.cages.forEach((cage, idx) => {
                const cageSolver = this.model.cagesSolversMap.get(cage.key);
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
                cageSolver.updateCombinations(combos);
            });
        });
    }
}
