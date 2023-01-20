import * as _ from 'lodash';
import { Cage } from '../../../puzzle/cage';
import { Cell } from '../../../puzzle/cell';
import { House } from '../../../puzzle/house';
import { CageModel } from '../../models/elements/cageModel';
import { HouseModel } from '../../models/elements/houseModel';
import { NonetModel } from '../../models/elements/nonetModel';
import { MasterModel } from '../../models/masterModel';
import { CageSlicer } from '../../transform/cageSlicer';
import { Strategy } from '../strategy';

export class FindAndReduceCagePermsByHouseStrategy extends Strategy {
    execute() {
        if (this._context.hasModelsTouchedByReduction) return;
    
        let cageMsToReduce = new Set<CageModel>();
    
        this._model.houseModels.forEach(houseM => {
            _.range(1, House.SIZE + 1).forEach((num: number) => {
                const cageMsWithNum = new Array<CageModel>();
                // consider overlapping vs non-overlapping cages
                houseM.cageModels.forEach(cageM => {
                    if (cageM.positioningFlags.isSingleCellCage) return;
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
                    singleOptionCellM.reduceNumOptions(new Set([num]));
                }
    
                const reducedCellMs = cageMToReDefine.reduceToCombinationsContaining(num);
                
                if (!reducedCellMs.length) return;
                reducedCellMs.forEach(cellM => {
                    cageMsToReduce = new Set([...cageMsToReduce, ...cellM.withinCageModels]);
                });
            });
        });
    
        // reduce house by cages with single combination
        for (const cageM of this._model.cageModelsMap.values()) {
            if (cageM.positioningFlags.isSingleCellCage || !cageM.hasSingleCombination() || !cageM.positioningFlags.isWithinHouse) continue;
    
            const combo = cageM.combos.next().value;
    
            if (cageM.positioningFlags.isWithinRow) {
                const rowReduced = reduceByHouse(cageM, this._model.rowModels[cageM.anyRow()], this._model, combo);
                cageMsToReduce = new Set([...cageMsToReduce, ...rowReduced]);
            } else if (cageM.positioningFlags.isWithinColumn) {
                const columnReduced = reduceByHouse(cageM, this._model.columnModels[cageM.anyColumn()], this._model, combo);
                cageMsToReduce = new Set([...cageMsToReduce, ...columnReduced]);
            }
    
            if (cageM.positioningFlags.isWithinNonet) {
                const nonetReduced = reduceByHouse(cageM, this._model.nonetModels[cageM.anyNonet()], this._model, combo);
                cageMsToReduce = new Set([...cageMsToReduce, ...nonetReduced]);
            }
        }
    
        // reduce house by cages where numbers are within specific row/column/nonet
        for (const cageM of this._model.cageModelsMap.values()) {
            if (cageM.positioningFlags.isSingleCellCage || !cageM.hasSingleCombination()) continue;
    
            for (const numPlacementClue of cageM.findNumPlacementClues()) {
                if (!_.isUndefined(numPlacementClue.row)) {
                    const rowReduced = reduceByHouse(cageM, this._model.rowModels[numPlacementClue.row], this._model, [ numPlacementClue.num ]);
                    cageMsToReduce = new Set([...cageMsToReduce, ...rowReduced]);
                } else if (!_.isUndefined(numPlacementClue.col)) {
                    const columnReduced = reduceByHouse(cageM, this._model.columnModels[numPlacementClue.col], this._model, [ numPlacementClue.num ]);
                    cageMsToReduce = new Set([...cageMsToReduce, ...columnReduced]);
                }
    
                if (!_.isUndefined(numPlacementClue.nonet)) {
                    const nonetReduced = reduceByHouse(cageM, this._model.nonetModels[numPlacementClue.nonet], this._model, [ numPlacementClue.num ]);
                    cageMsToReduce = new Set([...cageMsToReduce, ...nonetReduced]);
                }
            }
        }
    
        // reduce house by cages where numbers are a part of all combinations and within specific row/column/nonet
        for (const cageM of this._model.cageModelsMap.values()) {
            if (cageM.canHaveDuplicateNums || cageM.hasSingleCombination() || cageM.positioningFlags.isWithinHouse) continue;
    
            for (const numPlacementClue of cageM.findNumPlacementClues()) {
                if (!numPlacementClue.presentInAllCombos) continue;
    
                if (!_.isUndefined(numPlacementClue.row)) {
                    const rowReduced = reduceByHouse(cageM, this._model.rowModels[numPlacementClue.row], this._model, [ numPlacementClue.num ]);
                    cageMsToReduce = new Set([...cageMsToReduce, ...rowReduced]);
                } else if (!_.isUndefined(numPlacementClue.col)) {
                    const columnReduced = reduceByHouse(cageM, this._model.columnModels[numPlacementClue.col], this._model, [ numPlacementClue.num ]);
                    cageMsToReduce = new Set([...cageMsToReduce, ...columnReduced]);
                }
    
                if (!_.isUndefined(numPlacementClue.nonet)) {
                    const nonetReduced = reduceByHouse(cageM, this._model.nonetModels[numPlacementClue.nonet], this._model, [ numPlacementClue.num ]);
                    cageMsToReduce = new Set([...cageMsToReduce, ...nonetReduced]);
                }
            }
        }
    
        // reduce house by cages where numbers are only within specific cell
        for (const cageM of this._model.cageModelsMap.values()) {
            if (cageM.positioningFlags.isSingleCellCage || cageM.positioningFlags.isWithinHouse || cageM.comboCount < 2) continue;
            for (const numPlacementClue of cageM.findNumPlacementClues()) {
                if (!(_.isUndefined(numPlacementClue.singleCellForNum))) {
                    const cageLeft = CageSlicer.slice(cageM.cage, Cage.ofSum(numPlacementClue.num).cell(numPlacementClue.singleCellForNum).mk());
                    const furtherReduce = checkAssumptionCage(cageLeft, numPlacementClue.singleCellForNumCombos as Array<Array<number>>, numPlacementClue.singleCellForNum, numPlacementClue.num, this._model);
                    cageMsToReduce = new Set([...cageMsToReduce, ...furtherReduce]);
                }
            }
        }
    
        for (const cageM of this._model.cageModelsMap.values()) {
            if (cageM.positioningFlags.isSingleCellCage || cageM.positioningFlags.isWithinHouse || cageM.comboCount !== 1 || cageM.cellCount > 5) continue;
    
            const slices = CageSlicer.sliceBy(cageM.cage, (cell) => cell.row);
            if (slices.length > 2) continue;
    
            const firstSingleCellSlice = slices.find((sliceCells) => sliceCells.length === 1);
            if (_.isUndefined(firstSingleCellSlice)) continue;
    
            const firstSingleCell = firstSingleCellSlice[0];
            const firstSingleCellM = this._model.cellModelOf(firstSingleCell);
            const firstSingleCellMCombo = new Set<number>(cageM.combos.next().value);
    
            for (const num of firstSingleCellM.numOpts()) {
                const shortComboSet = new Set<number>(firstSingleCellMCombo);
                shortComboSet.delete(num);
                const shortCombo = Array.from(shortComboSet);
    
                const cageLeft = CageSlicer.slice(cageM.cage, Cage.ofSum(num).cell(firstSingleCell).mk());
                const furtherReduce = checkAssumptionCage(cageLeft, [ shortCombo ], firstSingleCell, num, this._model);
                cageMsToReduce = new Set([...cageMsToReduce, ...furtherReduce]);
            }
        }
    
        // reduce house when specific number are within nonet's row or column
        this._model.nonetModels.forEach(nonetM => {
            const numMap = new Map();
            _.range(1, House.SIZE + 1).forEach(num => numMap.set(num, {
                rows: new Set(),
                cols: new Set()
            }));
    
            for (const { row, col } of nonetM.cellsIterator()) {
                const cellM = this._model.cellModelAt(row, col);
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
                    const index = entry.rows.values().next().value;
                    const furtherReduce = reduceNonetBasedByRowOrColumn(this._model.rowModels[index], num, nonetM, this._model);
                    cageMsToReduce = new Set([...cageMsToReduce, ...furtherReduce]);
                }
                if (entry.cols.size === 1) {
                    const index = entry.cols.values().next().value;
                    const furtherReduce = reduceNonetBasedByRowOrColumn(this._model.columnModels[index], num, nonetM, this._model);
                    cageMsToReduce = new Set([...cageMsToReduce, ...furtherReduce]);
                }
            });
        });
    
        this._context.cageModelsToReevaluatePerms = Array.from(cageMsToReduce.values());
    }    
}

const reduceByHouse = (cageM: CageModel, houseM: HouseModel, model: MasterModel, combo: Array<number>) => {
    let cageMsToReduce = new Set<CageModel>();

    for (const { row, col } of houseM.cellsIterator()) {
        if (cageM.hasCellAt(row, col)) continue;

        const cellM = model.cellModelAt(row, col);
        let shouldReduce = false;
        for (const num of combo) {
            if (cellM.hasNumOpt(num)) {
                cellM.deleteNumOpt(num);
                shouldReduce = true;
            }
        }
        if (shouldReduce) {
            cageMsToReduce = new Set([...cageMsToReduce, ...cellM.withinCageModels]);
        }
    }

    return cageMsToReduce;
};

const checkAssumptionCage = (assumptionCage: Cage, combos: Array<Array<number>>, cell: Cell, num: number, model: MasterModel) => {
    const positioningFlags = CageModel.positioningFlagsFor(assumptionCage.cells);
    if (positioningFlags.isWithinHouse) {
        const reducedSingleCellForNumCombos = new Array<Array<number>>();
        for (const combo of combos) {
            const comboSet = new Set<number>(combo);
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

    return new Set<CageModel>();
};

const checkIfHouseStaysValidWithLeftoverCage = (houseM: HouseModel, leftoverCage: Cage, leftOverCageCombos: Array<Array<number>>) => {
    const leftoverCageCellKeys = new Set(leftoverCage.cells.map(cell => cell.key));
    const cageMsWithoutLeftover = new Array<CageModel>();
    houseM.cageModels.forEach((cageM: CageModel) => {
        if (cageM.positioningFlags.isSingleCellCage) return;

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
};

const reduceNonetBasedByRowOrColumn = (houseM: HouseModel, num: number, nonetM: NonetModel, model: MasterModel) => {
    let cageMsToReduce = new Set<CageModel>();

    for (const { row, col } of houseM.cellsIterator()) {
        const cellM = model.cellModelAt(row, col);
        if (cellM.cell.nonet === nonetM.index) continue;
        if (cellM.hasNumOpt(num)) {
            cellM.deleteNumOpt(num);
            cageMsToReduce = new Set([...cageMsToReduce, ...cellM.withinCageModels]);
        }
    }

    return cageMsToReduce;
};
