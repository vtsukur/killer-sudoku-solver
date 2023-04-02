import * as _ from 'lodash';
import { Cage } from '../../../puzzle/cage';
import { Cell } from '../../../puzzle/cell';
import { HouseIndex } from '../../../puzzle/house';
import { Sets } from '../../../util/sets';
import { InvalidSolverStateError } from '../../invalidSolverStateError';
import { Combo, ReadonlyCombos, SumAddendsCombinatorics } from '../../math';
import { CombosSet, ReadonlyCombosSet, SudokuNumsSet } from '../../sets';
import { CellModel } from './cellModel';
import { CellsPlacement } from '../../../puzzle/cellsPlacement';
import { MasterModelReduction } from '../../strategies/reduction/masterModelReduction';
import { CageModelOfSize2Reducer } from '../../strategies/reduction/cageModelOfSize2Reducer';
import { CageModelReducer } from '../../strategies/reduction/cageModelReducer';

type Clue = {
    num: number;
    row?: number;
    col?: number;
    nonet?: number;
    singleCellForNum?: Cell;
    singleCellForNumCombos?: ReadonlyCombos;
    presentInAllCombos?: boolean;
}

type Context = {
    processedCellMs: Set<CellModel>;
    remainingCellMs: Set<CellModel>,
    processedNums: Set<number>,
    numbersStack: Array<number>,
    cellMsStack: Array<CellModel>,
    processCell: (cellM: CellModel, step: number, fn: () => boolean | void) => boolean | void;
    mayNotProceedWithNum: (num: number) => boolean;
    processNum: (num: number, step: number, fn: () => boolean | void) => boolean | void;
    remainingCellM: () => CellModel;
};

export class CageModel {

    readonly cage;
    readonly cellMs;

    private _firstCell;
    private _cellCount;
    private _sumAddendsCombinatorics: SumAddendsCombinatorics;
    comboSet: CombosSet;
    private _reducer?: CageModelReducer;

    constructor(cage: Cage, cellMs: Array<CellModel>, comboSet?: CombosSet) {
        this.cage = cage;
        this._firstCell = cage.firstCell;
        this.cellMs = cellMs;
        this._cellCount = cage.cellCount;
        this._sumAddendsCombinatorics = SumAddendsCombinatorics.enumerate(this.cage.sum, this.cage.cellCount);
        if (comboSet) {
            this.comboSet = comboSet.clone();
        } else {
            this.comboSet = this.newSumAddendsCombosSet();
        }
        this.updateReducers();
    }

    updateReducers() {
        if (this._cellCount === 2) {
            this._reducer = new CageModelOfSize2Reducer(this);
        }
    }

    private newSumAddendsCombosSet(): CombosSet {
        return CombosSet.newEmpty(this._sumAddendsCombinatorics);
    }

    deepCopyWithSameCellModels() {
        return new CageModel(this.cage, [...this.cellMs], this.comboSet);
    }

    initialReduce(reduction?: MasterModelReduction) {
        const nums = this.comboSet.fill();
        if (reduction) {
            for (const cellM of this.cellMs) {
                reduction.tryReduceNumOpts(cellM, nums);
            }
        } else {
            for (const cellM of this.cellMs) {
                cellM.reduceNumOpts(nums);
            }
        }
    }

    anyRow() {
        return this._firstCell.row;
    }

    anyColumn() {
        return this._firstCell.col;
    }

    anyNonet() {
        return this._firstCell.nonet;
    }

    hasCellAt(row: HouseIndex, col: HouseIndex) {
        return this.cellMs.some(cellM => cellM.cell.row === row && cellM.cell.col === col);
    }

    reduceCombos(combos: ReadonlyCombosSet, reduction: MasterModelReduction) {
        const nums = this.comboSet.reduce(combos);
        for (const cellM of this.cellMs) {
            reduction.tryReduceNumOpts(cellM, nums, this);
        }
    }

    reduce(reduction: MasterModelReduction) {
        if (this._cellCount === 2) {
            this._reducer?.reduce(reduction);
        } else if (this._cellCount === 3) {
            this.reduceOptimalForSize3(reduction);
        } else if (this._cellCount === 4) {
            this.reduceSmallCage(reduction);
        } else {
            this.reduceLargeCage(reduction);
        }
    }

    private reduceOptimalForSize3(reduction: MasterModelReduction) {
        const PERMS_OF_3 = [
            [0, 1, 2],
            [0, 2, 1],
            [1, 0, 2],
            [1, 2, 0],
            [2, 0, 1],
            [2, 1, 0]
        ];

        const cellMs = this.cellMs;

        for (const cellM0 of cellMs) {
            const cellM0Index = cellMs.findIndex(c => c === cellM0);
            const remainingCellMs = [...cellMs];
            remainingCellMs.splice(cellM0Index, 1);
            const cellM1 = remainingCellMs[0];
            const cellM2 = remainingCellMs[1];

            for (const num0 of cellM0.numOpts()) {
                let numStands = false;
                for (const combo of this.combosWithNum(num0)) {
                    const reducedCombo = combo.reduce(num0);
                    const num1 = reducedCombo.number0;
                    const num2 = reducedCombo.number1;

                    const hasFirstPerm = cellM1.hasNumOpt(num1) && cellM2.hasNumOpt(num2);
                    const hasSecondPerm = cellM1.hasNumOpt(num2) && cellM2.hasNumOpt(num1);
                    const hasAtLeastOnePerm = hasFirstPerm || hasSecondPerm;
                    numStands = numStands || hasAtLeastOnePerm;

                    if (hasAtLeastOnePerm) break;
                }
                if (!numStands) {
                    reduction.deleteNumOpt(cellM0, num0, this);
                }
            }
        }

        for (const combo of this.comboSet.combos) {
            let comboStands = false;
            for (const perm of PERMS_OF_3) {
                const cellM0HasIt = cellMs[0].hasNumOpt(combo.nthNumber(perm[0]));
                const cellM1HasIt = cellMs[1].hasNumOpt(combo.nthNumber(perm[1]));
                const cellM2HasIt = cellMs[2].hasNumOpt(combo.nthNumber(perm[2]));
                const someCellHasIt = cellM0HasIt && cellM1HasIt && cellM2HasIt;
                comboStands = comboStands || someCellHasIt;
            }
            if (!comboStands) {
                this.deleteCombo(combo);
            }
        }
    }

    private combosWithNum(num: number) {
        return this.comboSet.combos.filter(combo => combo.has(num));
    }

    private deleteCombo(combo: Combo) {
        this.comboSet.deleteCombo(combo);
    }

    private reduceSmallCage(reduction: MasterModelReduction) {
        const context: Context = {
            processedCellMs: new Set(),
            remainingCellMs: new Set(this.cellMs),
            processedNums: new Set(),
            numbersStack: new Array(this._cellCount),
            cellMsStack: new Array(this._cellCount),
            processCell: function(cellM: CellModel, step: number, fn: () => boolean | void) {
                if (this.processedCellMs.has(cellM)) return;
                this.processedCellMs.add(cellM); this.remainingCellMs.delete(cellM);
                this.cellMsStack[step] = cellM;
                const retVal = fn();
                // this.cellMsStack[step] = undefined;
                this.processedCellMs.delete(cellM); this.remainingCellMs.add(cellM);
                return retVal;
            },
            mayNotProceedWithNum: function(num: number) {
                return this.processedNums.has(num);
            },
            processNum: function(num: number, step: number, fn: () => boolean | void) {
                if (this.mayNotProceedWithNum(num)) return;
                this.processedNums.add(num);
                this.numbersStack[step] = num;
                const retVal = fn();
                // this.numbersStack[step] = undefined;
                this.processedNums.delete(num);
                return retVal;
            },
            remainingCellM: function() {
                return context.remainingCellMs.values().next().value;
            }
        };

        this.comboSet = this.newSumAddendsCombosSet();

        this.cellMs.forEach(cellM => {
            context.processCell(cellM, 0, () => {
                Array.from(cellM.numOpts()).forEach(num => {
                    context.processNum(num, 0, () => {
                        if (!this.hasSumMatchingPermutationsRecursive(num, 1, context)) {
                            reduction.deleteNumOpt(cellM, num, this);
                        }
                    });
                });
            });
        });
    }

    private hasSumMatchingPermutationsRecursive(currentSum: number, step: number, context: Context) {
        if (currentSum > this.cage.sum) { return false; }

        let has = false;

        if (step === (this._cellCount - 1)) {
            const lastNum = this.cage.sum - currentSum;
            if (context.mayNotProceedWithNum(lastNum)) return false;
            const lastCellM = context.remainingCellM();
            has = lastCellM.hasNumOpt(lastNum);
            if (has) {
                const sortedNums = [...context.numbersStack];
                sortedNums[this._cellCount - 1] = lastNum;
                sortedNums.sort();
                const combo = new Combo(sortedNums);
                this.comboSet.addCombo(combo);
            }
        } else {
            this.cellMs.forEach(cellM => {
                context.processCell(cellM, step, () => {
                    Array.from(cellM.numOpts()).forEach(num => {
                        context.processNum(num, step, () => {
                            has = this.hasSumMatchingPermutationsRecursive(currentSum + num, step + 1, context) || has;
                        });
                    });
                });
            });
        }

        return has;
    }

    private reduceLargeCage(reduction: MasterModelReduction) {
        const presentNums = SudokuNumsSet.newEmpty();
        for (const cellM of this.cellMs) {
            presentNums.addAll(cellM.numOptsSet());
        }

        const commonComboNums = SudokuNumsSet.newEmpty();
        for (const num of SudokuNumsSet.NUM_RANGE) {
            let hasNumInAllCombos = true;
            for (const combo of this.comboSet.combos) {
                hasNumInAllCombos = hasNumInAllCombos && combo.has(num);
            }
            if (hasNumInAllCombos) {
                commonComboNums.add(num);
            }
        }

        for (const commonNum of commonComboNums.nums) {
            if (!presentNums.has(commonNum)) {
                throw new InvalidSolverStateError(`Common combo num ${commonNum} not found in CellModels for Cage ${this.cage.key}`);
            }
        }

        const validCombos = [];
        const validComboNums = SudokuNumsSet.newEmpty();
        const noLongerValidCombos = new Array<Combo>();
        const noLongerValidComboNums = SudokuNumsSet.newEmpty();
        for (const combo of this.comboSet.combos) {
            let validCombo = true;
            for (const num of combo) {
                if (commonComboNums.has(num)) continue;

                if (!presentNums.has(num)) {
                    validCombo = false;
                    break;
                }
            }

            if (validCombo) {
                validCombos.push(combo);
                validComboNums.addAll(combo.numsSet);
            } else {
                noLongerValidCombos.push(combo);
                noLongerValidComboNums.addAll(combo.numsSet);
            }
        }

        if (noLongerValidCombos.length > 0) {
            const numOptsToDelete = new Set<number>();
            for (const num of noLongerValidComboNums.nums) {
                if (!validComboNums.has(num) && presentNums.has(num)) {
                    numOptsToDelete.add(num);
                }
            }

            for (const cellM of this.cellMs) {
                for (const num of numOptsToDelete) {
                    reduction.tryDeleteNumOpt(cellM, num, this);
                }
            }

            for (const noLongerValidCombo of noLongerValidCombos) {
                this.comboSet.deleteCombo(noLongerValidCombo);
            }
        }
    }

    findNumPlacementClues(forNum?: number) {
        const numToCells = new Map();
        const numOptsFn = (cellM: CellModel) => {
            if (_.isUndefined(forNum)) {
                return cellM.numOpts();
            } else if (cellM.hasNumOpt(forNum)) {
                return Sets.new(forNum);
            } else {
                return new Set();
            }
        };
        for (const cellM of this.cellMs) {
            for (const num of numOptsFn(cellM)) {
                if (!numToCells.has(num)) {
                    numToCells.set(num, []);
                }
                numToCells.get(num).push(cellM.cell);
            }
        }

        const clues = new Array<Clue>();
        for (const numToCellsEntry of numToCells.entries()) {
            const num = numToCellsEntry[0];
            const cells = numToCellsEntry[1];
            const placement = new CellsPlacement(cells);
            const clue: Clue = { num };
            if (placement.isWithinHouse) {
                if (placement.isWithinRow) {
                    clue.row = cells[0].row;
                } else if (placement.isWithinColumn) {
                    clue.col = cells[0].col;
                }
                if (placement.isWithinNonet) {
                    clue.nonet = cells[0].nonet;
                }
            }
            if (cells.length === 1) {
                clue.singleCellForNum = cells[0];
                const singleCellForNumCombos = [];
                for (const combo of this.comboSet.combos) {
                    if (combo.has(num)) {
                        singleCellForNumCombos.push(combo);
                    }
                }
                clue.singleCellForNumCombos = singleCellForNumCombos;
            }
            if (placement.isWithinHouse || cells.length === 1) {
                clue.presentInAllCombos = Array.from(this.comboSet.combos).every(combo => {
                    return combo.has(num);
                });
                clues.push(clue);
            }
        }

        return clues;
    }

    reduceToCombinationsContaining(withNum: number, reduction: MasterModelReduction) {
        if (this.hasSingleCombination() || !this.comboSet.size) return new Set();

        const newCombosMap = this.newSumAddendsCombosSet();
        const deleteCombos = [];
        const newNumOptions = SudokuNumsSet.newEmpty();

        for (const combo of this.comboSet.combos) {
            if (combo.numsSet.has(withNum)) {
                newCombosMap.addCombo(combo);
                newNumOptions.addAll(combo.numsSet);
            } else {
                deleteCombos.push(combo);
            }
        }

        if (deleteCombos.length > 0) {
            this.comboSet = newCombosMap;
            this.cellMs.forEach(cellM => {
                reduction.tryReduceNumOpts(cellM, newNumOptions);
            });
        }
    }

    hasSingleCombination() {
        return this.comboSet.size === 1;
    }

    get cellCount() {
        return this._cellCount;
    }

    get combos() {
        return Array.from(this.comboSet.combos);
    }

    get comboCount() {
        return this.comboSet.size;
    }

}
