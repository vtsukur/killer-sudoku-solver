import * as _ from 'lodash';
import { Cage } from '../../../../puzzle/cage';
import { Cell } from '../../../../puzzle/cell';
import { House } from '../../../../puzzle/house';
import { Combo, ReadonlyCombos } from '../../../math';
import { CageModel } from '../../../models/elements/cageModel';
import { HouseModel } from '../../../models/elements/houseModel';
import { NonetModel } from '../../../models/elements/nonetModel';
import { MasterModel } from '../../../models/masterModel';
import { SudokuNumsSet } from '../../../sets';
import { CageSlicer } from '../../../transform/cageSlicer';
import { NumsReduction } from '../../numsReduction';
import { Strategy } from '../../strategy';

export class FindAndReduceCagePermsByHouseStrategy extends Strategy {

    execute() {
        if (this._context.reduction.isNotEmpty) return;

        const reduction = this._context.reduction;

        this._model.houseModels.forEach(houseM => {
            _.range(1, House.CELL_COUNT + 1).forEach((num: number) => {
                const cageMsWithNum = new Array<CageModel>();
                // consider overlapping vs non-overlapping cages
                houseM.cageModels.forEach(cageM => {
                    if (cageM.cage.placement.isSingleCell) return;
                    const hasNumInCells = cageM.cellMs.some(cellM => cellM.hasNumOpt(num));
                    if (hasNumInCells) {
                        cageMsWithNum.push(cageM);
                    }
                });
                if (cageMsWithNum.length !== 1) return;

                const cageMToReDefine = cageMsWithNum[0];

                const numPlacementClues = cageMToReDefine.findNumPlacementClues(num);
                let singleCellForNum: Cell | undefined = undefined;
                for (const clue of numPlacementClues) {
                    if (!_.isUndefined(clue.singleCellForNum)) {
                        singleCellForNum = clue.singleCellForNum;
                    }
                }

                if (!_.isUndefined(singleCellForNum)) {
                    const singleOptionCellM = this._model.cellModelOf(singleCellForNum as Cell);
                    reduction.tryReduceNumOpts(singleOptionCellM, SudokuNumsSet.ofSingle(num));
                }

                cageMToReDefine.reduceToCombinationsContaining(num, reduction);
            });
        });

        // reduce house by cages with single combination
        for (const cageM of this._model.cageModelsMap.values()) {
            if (cageM.cage.placement.isSingleCell || !cageM.hasSingleCombination() || !cageM.cage.placement.isWithinHouse) continue;

            const combo = cageM.combos[0];

            if (cageM.cage.placement.isWithinRow) {
                reduceByHouse(cageM, this._model.rowModels[cageM.anyRow()], this._model, combo, reduction);
            } else if (cageM.cage.placement.isWithinColumn) {
                reduceByHouse(cageM, this._model.columnModels[cageM.anyColumn()], this._model, combo, reduction);
            }

            if (cageM.cage.placement.isWithinNonet) {
                reduceByHouse(cageM, this._model.nonetModels[cageM.anyNonet()], this._model, combo, reduction);
            }
        }

        // reduce house by cages where numbers are within specific row/column/nonet
        for (const cageM of this._model.cageModelsMap.values()) {
            if (cageM.cage.placement.isSingleCell || !cageM.hasSingleCombination()) continue;

            for (const numPlacementClue of cageM.findNumPlacementClues()) {
                if (!_.isUndefined(numPlacementClue.row)) {
                    reduceByHouse(cageM, this._model.rowModels[numPlacementClue.row], this._model, Combo.of(numPlacementClue.num), reduction);
                } else if (!_.isUndefined(numPlacementClue.col)) {
                    reduceByHouse(cageM, this._model.columnModels[numPlacementClue.col], this._model, Combo.of(numPlacementClue.num), reduction);
                }

                if (!_.isUndefined(numPlacementClue.nonet)) {
                    reduceByHouse(cageM, this._model.nonetModels[numPlacementClue.nonet], this._model, Combo.of(numPlacementClue.num), reduction);
                }
            }
        }

        // reduce house by cages where numbers are a part of all combinations and within specific row/column/nonet
        for (const cageM of this._model.cageModelsMap.values()) {
            if (cageM.hasSingleCombination() || cageM.cage.placement.isWithinHouse) continue;

            for (const numPlacementClue of cageM.findNumPlacementClues()) {
                if (!numPlacementClue.presentInAllCombos) continue;

                if (!_.isUndefined(numPlacementClue.row)) {
                    reduceByHouse(cageM, this._model.rowModels[numPlacementClue.row], this._model, Combo.of(numPlacementClue.num), reduction);
                } else if (!_.isUndefined(numPlacementClue.col)) {
                    reduceByHouse(cageM, this._model.columnModels[numPlacementClue.col], this._model, Combo.of(numPlacementClue.num), reduction);
                }

                if (!_.isUndefined(numPlacementClue.nonet)) {
                    reduceByHouse(cageM, this._model.nonetModels[numPlacementClue.nonet], this._model, Combo.of(numPlacementClue.num), reduction);
                }
            }
        }

        // reduce house by cages where numbers are only within specific cell
        for (const cageM of this._model.cageModelsMap.values()) {
            if (cageM.cage.placement.isSingleCell || cageM.cage.placement.isWithinHouse || cageM.comboCount < 2) continue;
            for (const numPlacementClue of cageM.findNumPlacementClues()) {
                if (!(_.isUndefined(numPlacementClue.singleCellForNum))) {
                    const cageLeft = CageSlicer.slice(cageM.cage, Cage.ofSum(numPlacementClue.num).withCell(numPlacementClue.singleCellForNum).new(), this._model);
                    checkAssumptionCage(cageLeft, numPlacementClue.singleCellForNumCombos as ReadonlyCombos, numPlacementClue.singleCellForNum, numPlacementClue.num, this._model, reduction);
                }
            }
        }

        for (const cageM of this._model.cageModelsMap.values()) {
            if (cageM.cage.placement.isSingleCell || cageM.cage.placement.isWithinHouse || cageM.comboCount !== 1 || cageM.cellCount > 5) continue;

            const slices = CageSlicer.sliceBy(cageM.cage, (cell) => cell.row);
            if (slices.length > 2) continue;

            const firstSingleCellSlice = slices.find((sliceCells) => sliceCells.length === 1);
            if (_.isUndefined(firstSingleCellSlice)) continue;

            const firstSingleCell = firstSingleCellSlice[0];
            const firstSingleCellM = this._model.cellModelOf(firstSingleCell);
            const firstSingleCellMCombo = cageM.combos[0];

            for (const num of firstSingleCellM.numOpts()) {
                const shortCombo = firstSingleCellMCombo.reduce(num);
                const cageLeft = CageSlicer.slice(cageM.cage, Cage.ofSum(num).withCell(firstSingleCell).new(), this._model);
                checkAssumptionCage(cageLeft, [ shortCombo ], firstSingleCell, num, this._model, reduction);
            }
        }

        // reduce house when specific number are within nonet's row or column
        this._model.nonetModels.forEach(nonetM => {
            const numMap = new Map();
            _.range(1, House.CELL_COUNT + 1).forEach(num => numMap.set(num, {
                rows: new Set(),
                cols: new Set()
            }));

            for (const { row, col } of nonetM.cells) {
                const cellM = this._model.cellModelAt(row, col);
                if (cellM.solved) continue;

                for (const num of cellM.numOpts()) {
                    const entry = numMap.get(num);
                    entry.rows.add(row);
                    entry.cols.add(col);
                }
            }

            _.range(1, House.CELL_COUNT + 1).forEach(num => {
                const entry = numMap.get(num);
                if (entry.rows.size === 1) {
                    const index = entry.rows.values().next().value;
                    reduceNonetBasedByRowOrColumn(this._model.rowModels[index], num, nonetM, this._model, reduction);
                }
                if (entry.cols.size === 1) {
                    const index = entry.cols.values().next().value;
                    reduceNonetBasedByRowOrColumn(this._model.columnModels[index], num, nonetM, this._model, reduction);
                }
            });
        });
    }

}

const reduceByHouse = (cageM: CageModel, houseM: HouseModel, model: MasterModel, combo: Combo, reduction: NumsReduction) => {
    for (const { row, col } of houseM.cells) {
        if (cageM.hasCellAt(row, col)) continue;

        const cellM = model.cellModelAt(row, col);
        for (const num of combo) {
            reduction.tryDeleteNumOpt(cellM, num);
        }
    }
};

const checkAssumptionCage = (assumptionCage: Cage, combos: ReadonlyCombos, cell: Cell, num: number, model: MasterModel, reduction: NumsReduction) => {
    const placement = assumptionCage.placement;
    if (placement.isWithinHouse) {
        const reducedSingleCellForNumCombos = new Array<Combo>();
        for (const combo of combos) {
            reducedSingleCellForNumCombos.push(combo.reduce(num));
        }
        let reduce = false;
        if (placement.isWithinRow) {
            if (!checkIfHouseStaysValidWithLeftoverCage(model.rowModels[assumptionCage.firstCell.row], assumptionCage, reducedSingleCellForNumCombos)) {
                reduce = true;
            }
        }
        if (placement.isWithinColumn) {
            if (!checkIfHouseStaysValidWithLeftoverCage(model.columnModels[assumptionCage.firstCell.col], assumptionCage, reducedSingleCellForNumCombos)) {
                reduce = true;
            }
        }
        if (placement.isWithinNonet) {
            if (!checkIfHouseStaysValidWithLeftoverCage(model.nonetModels[assumptionCage.firstCell.nonet], assumptionCage, reducedSingleCellForNumCombos)) {
                reduce = true;
            }
        }
        if (reduce) {
            reduction.deleteNumOpt(model.cellModelOf(cell), num);
        }
    }
};

const checkIfHouseStaysValidWithLeftoverCage = (houseM: HouseModel, leftoverCage: Cage, leftOverCageCombos: Array<Combo>) => {
    const leftoverCageCellKeys = new Set(leftoverCage.cells.map(cell => cell.key));
    const cageMsWithoutLeftover = new Array<CageModel>();
    houseM.cageModels.forEach((cageM: CageModel) => {
        if (cageM.cage.placement.isSingleCell) return;

        let overlaps = false;
        for (const cellM of cageM.cellMs) {
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
                let conflictWithCombo = false;
                for (const num of leftOverCageCombo) {
                    if (cageCombo.has(num)) {
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
};

const reduceNonetBasedByRowOrColumn = (houseM: HouseModel, num: number, nonetM: NonetModel, model: MasterModel, reduction: NumsReduction) => {
    for (const { row, col } of houseM.cells) {
        const cellM = model.cellModelAt(row, col);
        if (cellM.cell.nonet === nonetM.index) continue;
        if (cellM.hasNumOpt(num)) {
            reduction.deleteNumOpt(cellM, num);
        }
    }
};
