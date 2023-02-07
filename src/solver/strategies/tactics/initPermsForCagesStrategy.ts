import { combosAndPermsForHouse } from '../../math';
import { Strategy } from '../strategy';

export class InitPermsForCagesStrategy extends Strategy {
    execute() {
        this._model.houseModels.forEach(houseM => {
            const sumCombos = combosAndPermsForHouse(houseM).actualSumCombos;
            houseM.cageModels.forEach((cageModel, index) => {
                cageModel.updateCombinations(sumCombos[index]);
            });
        });

        this._context.setCageModelsToReduceToAll();
    }
}
