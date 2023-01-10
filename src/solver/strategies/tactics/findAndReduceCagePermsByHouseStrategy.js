import _ from 'lodash';
import { Cage } from '../../../puzzle/cage';
import { House } from '../../../puzzle/house';
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

            const numPlacementClues = cageModelToReDefine.findNumPlacementClues(num);
            let singleCellForNum = undefined;
            for (const clue of numPlacementClues) {
                if (!_.isUndefined(clue.singleCellForNum)) {
                    singleCellForNum = clue.singleCellForNum;
                }
            }

            if (!_.isUndefined(singleCellForNum)) {
                const singleOptionCellM = this.model.cellModelOf(singleCellForNum);
                singleOptionCellM.reduceNumOptions(new Set([num]));
            }

            const reducedCellModels = cageModelToReDefine.reduceToCombinationsContaining(num);
            
            if (!reducedCellModels.length) return;
            reducedCellModels.forEach(cellModel => {
                cageModelsToReduce = new Set([...cageModelsToReduce, ...cellModel.withinCageModels]);
            });
        });
    });

    // reduce house by cages with single combination
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

    // reduce house by cages where numbers are within specific row/column/nonet
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

    // reduce house by cages where numbers are a part of all combinations and within specific row/column/nonet
    for (const cageModel of this.model.cageModelsMap.values()) {
        if (cageModel.canHaveDuplicateNums || cageModel.hasSingleCombination() || cageModel.positioningFlags.isWithinHouse) continue;

        for (const numPlacementClue of cageModel.findNumPlacementClues()) {
            if (!numPlacementClue.presentInAllCombos) continue;

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

    // reduce house by cages where numbers are only within specific cell
    for (const cageModel of this.model.cageModelsMap.values()) {
        if (cageModel.positioningFlags.isSingleCellCage || cageModel.positioningFlags.isWithinHouse || cageModel.comboCount < 2) continue;
        for (const numPlacementClue of cageModel.findNumPlacementClues()) {
            if (!(_.isUndefined(numPlacementClue.singleCellForNum))) {
                const cageLeft = CageSlicer.slice(cageModel.cage, Cage.ofSum(numPlacementClue.num).cell(numPlacementClue.singleCellForNum).mk());
                const furtherReduce = checkAssumptionCage(cageLeft, numPlacementClue.singleCellForNumCombos, numPlacementClue.singleCellForNum, numPlacementClue.num, this.model);
                cageModelsToReduce = new Set([...cageModelsToReduce, ...furtherReduce]);
            }
        }
    }

    for (const cageModel of this.model.cageModelsMap.values()) {
        if (cageModel.positioningFlags.isSingleCellCage || cageModel.positioningFlags.isWithinHouse || cageModel.comboCount !== 1 || cageModel.cellCount > 5) continue;

        const slices = CageSlicer.sliceBy(cageModel.cage, (cell) => cell.row);
        if (slices.length > 2) continue;

        const firstSingleCellSlice = slices.find((sliceCells) => sliceCells.length === 1);
        if (_.isUndefined(firstSingleCellSlice)) continue;

        const firstSingleCell = firstSingleCellSlice[0];
        const firstSingleCellM = this.model.cellModelOf(firstSingleCell);
        const firstSingleCellMCombo = new Set(cageModel.combos.next().value);

        for (const num of firstSingleCellM.numOpts()) {
            const shortComboSet = new Set(firstSingleCellMCombo);
            shortComboSet.delete(num);
            const shortCombo = Array.from(shortComboSet);

            const cageLeft = CageSlicer.slice(cageModel.cage, Cage.ofSum(num).cell(firstSingleCell).mk());
            const furtherReduce = checkAssumptionCage(cageLeft, [ shortCombo ], firstSingleCell, num, this.model);
            cageModelsToReduce = new Set([...cageModelsToReduce, ...furtherReduce]);
        }
    }

    // reduce house when specific number are within nonet's row or column
    this.model.nonetModels.forEach(nonetM => {
        const numMap = new Map();
        _.range(1, House.SIZE + 1).forEach(num => numMap.set(num, {
            rows: new Set(),
            cols: new Set()
        }));

        for (const { row, col } of nonetM.cellIterator()) {
            const cellM = this.model.cellModelAt(row, col);
            if (cellM.solved) continue;

            for (const num of cellM.numOpts()) {
                const entry = numMap.get(num);
                entry.rows.add(row);
                entry.cols.add(col);
            }
        }

        _.range(1, House.SIZE + 1).forEach(num => {
            const entry = numMap.get(num);
            if (entry.rows.size === 1) {
                const idx = entry.rows.values().next().value;
                const furtherReduce = reduceNonetBasedByRowOrColumn(this.model.rowModels[idx], num, nonetM, this.model);
                cageModelsToReduce = new Set([...cageModelsToReduce, ...furtherReduce]);
            }
            if (entry.cols.size === 1) {
                const idx = entry.cols.values().next().value;
                const furtherReduce = reduceNonetBasedByRowOrColumn(this.model.columnModels[idx], num, nonetM, this.model);
                cageModelsToReduce = new Set([...cageModelsToReduce, ...furtherReduce]);
            }
        });
    });

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

const checkAssumptionCage = (assumptionCage, combos, cell, num, model) => {
    const positioningFlags = CageModel.positioningFlagsFor(assumptionCage.cells);
    if (positioningFlags.isWithinHouse) {
        const reducedSingleCellForNumCombos = [];
        for (const combo of combos) {
            const comboSet = new Set(combo);
            comboSet.delete(num);
            reducedSingleCellForNumCombos.push(Array.from(comboSet));
        }
        let reduce = false;
        if (positioningFlags.isWithinRow) {
            if (!checkIfHouseStaysValidWithLeftoverCage(model.rowModels[assumptionCage.cells[0].row], assumptionCage, reducedSingleCellForNumCombos)) {
                reduce = true;
            }
        }
        if (positioningFlags.isWithinColumn) {
            if (!checkIfHouseStaysValidWithLeftoverCage(model.columnModels[assumptionCage.cells[0].col], assumptionCage, reducedSingleCellForNumCombos)) {
                reduce = true;
            }
        }
        if (positioningFlags.isWithinNonet) {
            if (!checkIfHouseStaysValidWithLeftoverCage(model.nonetModels[assumptionCage.cells[0].nonet], assumptionCage, reducedSingleCellForNumCombos)) {
                reduce = true;
            }
        }
        if (reduce) {
            const cellMToReduce = model.cellModelOf(cell);
            cellMToReduce.deleteNumOpt(num);
            return new Set(cellMToReduce.withinCageModels);
        }
    }

    return new Set();
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

const reduceNonetBasedByRowOrColumn = (houseM, num, nonetM, model) => {
    let cageModelsToReduce = new Set();

    for (const { row, col } of houseM.cellIterator()) {
        const cellM = model.cellModelAt(row, col);
        if (cellM.cell.nonet === nonetM.idx) continue;
        if (cellM.hasNumOpt(num)) {
            cellM.deleteNumOpt(num);
            cageModelsToReduce = new Set([...cageModelsToReduce, ...cellM.withinCageModels])
        }
    }

    return cageModelsToReduce;
};
