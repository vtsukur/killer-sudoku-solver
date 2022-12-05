import _ from 'lodash';
import { Cage } from '../../../problem/cage';
import { House } from '../../../problem/house';
import { CageModel } from '../../models/elements/cageModel';
import { CageSlicer } from '../../transform/cageSlicer';

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
        if (cageModel.positioningFlags.isSingleCellCage || !cageModel.hasSingleCombination()) continue;

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

    for (const cageModel of this.model.cageModelsMap.values()) {
        if (cageModel.positioningFlags.isSingleCellCage || cageModel.positioningFlags.isWithinHouse || cageModel.comboCount < 2) continue;
        for (const numPlacementClue of cageModel.findNumPlacementClues()) {
            if (!(_.isUndefined(numPlacementClue.singleCellForNum))) {
                const cageLeft = CageSlicer.slice(cageModel.cage, Cage.ofSum(numPlacementClue.num).cell(numPlacementClue.singleCellForNum).mk());
                const cageLeftPositioningFlags = CageModel.positioningFlagsFor(cageLeft.cells);
                if (cageLeftPositioningFlags.isWithinHouse) {
                    const reducedSingleCellForNumCombos = [];
                    for (const combo of numPlacementClue.singleCellForNumCombos) {
                        const comboSet = new Set(combo);
                        comboSet.delete(numPlacementClue.num);
                        reducedSingleCellForNumCombos.push(Array.from(comboSet));
                    }
                    if (cageLeftPositioningFlags.isWithinRow) {
                        if (!checkIfHouseStaysValidWithLeftoverCage(this.model.rowModels[cageLeft.cells[0].row], cageLeft, reducedSingleCellForNumCombos)) {
                            const cellMToReduce = this.model.cellModelOf(numPlacementClue.singleCellForNum);
                            cellMToReduce.deleteNumOpt(numPlacementClue.num);
                            cageModelsToReduce = new Set([...cageModelsToReduce, ...cellMToReduce.withinCageModels]);
                        }
                    }
                }
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

const checkIfHouseStaysValidWithLeftoverCage = (houseM, leftoverCage, leftOverCageCombos) => {
    const leftoverCageCellKeys = new Set(leftoverCage.cells.map(cell => cell.key));
    const cageMsWithoutLeftover = [];
    houseM.cageModels.forEach(cageM => {
        if (cageM.positioningFlags.isSingleCellCage) return;

        let overlaps = false;
        for (const cellM of cageM.cellModels) {
            if (leftoverCageCellKeys.has(cellM.cell.key)) {
                overlaps = true;
                break;
            }
        }
        if (!overlaps) {
            cageMsWithoutLeftover.push(cageM);
        }
    });
    
    const noLongerValidCombos = [];
    for (const leftOverCageCombo of leftOverCageCombos) { // [1,2,4]
        for (const cageM of cageMsWithoutLeftover) {
            if (cageM.comboCount === 0) continue;

            let noConflictWithAllCombos = false;
            for (const cageCombo of cageM.combos) { // [1,5], [2,4]
                const cageComboSet = new Set(cageCombo);

                let conflictWithCombo = false;
                for (const num of leftOverCageCombo) {
                    if (cageComboSet.has(num)) {
                        conflictWithCombo = true;
                        break;
                    }
                }
                noConflictWithAllCombos = noConflictWithAllCombos || !conflictWithCombo;
            }
            if (!noConflictWithAllCombos) {
                noLongerValidCombos.push(leftOverCageCombo);
                break;
            }
        }
    }

    const valid = (noLongerValidCombos.length !== leftOverCageCombos.length);
    return valid;
}
