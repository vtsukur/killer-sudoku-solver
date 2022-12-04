import _ from 'lodash';
import { House } from '../../../problem/house';
import { CageModel } from '../../models/elements/cageModel';

export function findAndReduceCagePermsByHouseStrategy() {
    if (this.hasCageModelsToReevaluatePerms) return;

    let cageModelsToReduce = new Set();

    this.model.houseModels.forEach(houseModel => {
        _.range(1, House.SIZE + 1).forEach(num => {
            const cageModelsWithNum = [];
            // consider overlapping vs non-overlapping cages
            houseModel.cageModels.forEach(cageModel => {
                if (cageModel.positioningFlags.isSingleCellCage) return;
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
        if (cageModel.positioningFlags.isSingleCellCage || !cageModel.hasSingleCombination() || !cageModel.positioningFlags.isWithinHouse) continue;

        const combo = cageModel.combos.next().value;

        if (cageModel.positioningFlags.isWithinRow) {
            const rowReduced = reduceByHouse(cageModel, this.model.rowModels[cageModel.anyRow()], this.model, combo);
            cageModelsToReduce = new Set([...cageModelsToReduce, ...rowReduced]);
        } else if (cageModel.positioningFlags.isWithinColumn) {
            const columnReduced = reduceByHouse(cageModel, this.model.columnModels[cageModel.anyColumn()], this.model, combo);
            cageModelsToReduce = new Set([...cageModelsToReduce, ...columnReduced]);
        }

        if (cageModel.positioningFlags.isWithinNonet) {
            const nonetReduced = reduceByHouse(cageModel, this.model.nonetModels[cageModel.anyNonet()], this.model, combo);
            cageModelsToReduce = new Set([...cageModelsToReduce, ...nonetReduced]);
        }
    }

    for (const cageModel of this.model.cageModelsMap.values()) {
        if (cageModel.positioningFlags.isSingleCellCage || !cageModel.hasSingleCombination() || cageModel.positioningFlags.isWithinHouse) continue;

        const combo = cageModel.combos.next().value;

        for (const numPlacementClue of cageModel.findNumPlacementClues()) {
            if (!_.isUndefined(numPlacementClue.row)) {
                const rowReduced = reduceByHouse(cageModel, this.model.rowModels[numPlacementClue.row], this.model, [ numPlacementClue.num ]);
                cageModelsToReduce = new Set([...cageModelsToReduce, ...rowReduced]);    
            } else if (!_.isUndefined(numPlacementClue.col)) {
                const columnReduced = reduceByHouse(cageModel, this.model.columnModels[numPlacementClue.col], this.model, [ numPlacementClue.num ]);
                cageModelsToReduce = new Set([...cageModelsToReduce, ...columnReduced]);    
            }

            if (!_.isUndefined(numPlacementClue.nonet)) {
                const nonetReduced = reduceByHouse(cageModel, this.model.nonetModels[numPlacementClue.nonet], this.model, [ numPlacementClue.num ]);
                cageModelsToReduce = new Set([...cageModelsToReduce, ...nonetReduced]);    
            }
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
