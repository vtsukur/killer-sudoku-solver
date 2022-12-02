import _ from 'lodash';
import { House } from '../../../problem/house';

export function findAndReduceCagePermsByHouseStrategy() {
    if (this.hasCageModelsToReevaluatePerms) return;

    let cageModelsToReduce = new Set();

    this.model.houseModels.forEach(houseModel => {
        _.range(1, House.SIZE + 1).forEach(num => {
            const cageModelsWithNum = [];
            // consider overlapping vs non-overlapping cages
            houseModel.cageModels.forEach(cageModel => {
                if (cageModel.isSingleCellCage) return;
                const hasNumInCells = cageModel.cellModels.some(cellModel => cellModel.hasNumOpt(num));
                if (hasNumInCells) {
                    cageModelsWithNum.push(cageModel);
                }
            });
            if (cageModelsWithNum.length !== 1) return;

            const cageModelToReDefine = cageModelsWithNum[0];
            const reducedCellModels = cageModelToReDefine.reduceToCombinationsContaining(num);
            
            if (!reducedCellModels.length) return;
            reducedCellModels.forEach(cellModel => {
                cageModelsToReduce = new Set([...cageModelsToReduce, ...cellModel.withinCageModels]);
            });
        });
    });

    for (const cageModel of this.model.cageModelsMap.values()) {
        if (cageModel.isSingleCellCage || !cageModel.hasSingleCombination() || !cageModel.isWithinHouse) continue;

        const combo = cageModel.combos.next().value;

        if (cageModel.isWithinRow) {
            const rowReduced = reduceByHouse(cageModel, this.model.rowModels[cageModel.anyRow()], this.model, combo);
            cageModelsToReduce = new Set([...cageModelsToReduce, ...rowReduced]);
        } else if (cageModel.isWithinColumn) {
            const columnReduced = reduceByHouse(cageModel, this.model.columnModels[cageModel.anyColumnIdx()], this.model, combo);
            cageModelsToReduce = new Set([...cageModelsToReduce, ...columnReduced]);
        }

        if (cageModel.isWithinNonet) {
            const nonetReduced = reduceByHouse(cageModel, this.model.nonetModels[cageModel.anySubgridIdx()], this.model, combo);
            cageModelsToReduce = new Set([...cageModelsToReduce, ...nonetReduced]);
        }
    }

    this.cageModelsToReevaluatePerms = cageModelsToReduce.size > 0 ? cageModelsToReduce.values() : undefined;
}

const reduceByHouse = (cageModel, house, model, combo) => {
    let cageModelsToReduce = new Set();

    for (const { row, col } of house.cellIterator()) {
        if (cageModel.hasCellAt(row, col)) continue;

        const cellM = model.cellModelAt(row, col);
        let shouldReduce = false;
        for (const num of combo) {
            if (cellM.hasNumOpt(num)) {
                cellM.deleteNumOpt(num);
                shouldReduce = true;
            }
        }
        if (shouldReduce) {
            cageModelsToReduce = new Set([...cageModelsToReduce, ...cellM.withinCageModels]);
        }
    }

    return cageModelsToReduce;
}
