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
import { NumsReduction } from '../../strategies/numsReduction';

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
    private _comboSet: CombosSet;

    constructor(cage: Cage, cellMs: Array<CellModel>, comboSet?: CombosSet) {
        this.cage = cage;
        this._firstCell = cage.firstCell;
        this.cellMs = cellMs;
        this._cellCount = cage.cellCount;
        this._sumAddendsCombinatorics = SumAddendsCombinatorics.enumerate(this.cage.sum, this.cage.cellCount);
        if (comboSet) {
            this._comboSet = comboSet.clone();
        } else {
            this._comboSet = this.newSumAddendsCombosSet();
        }
    }

    private newSumAddendsCombosSet(): CombosSet {
        return CombosSet.newEmpty(this._sumAddendsCombinatorics);
    }

    deepCopyWithSameCellModels() {
        return new CageModel(this.cage, [...this.cellMs], this._comboSet);
    }

    initialReduce(reduction?: NumsReduction) {
        const nums = this._comboSet.fill();
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

    reduceCombos(combos: ReadonlyCombosSet, reduction: NumsReduction) {
        const nums = this._comboSet.reduce(combos);
        for (const cellM of this.cellMs) {
            reduction.tryReduceNumOpts(cellM, nums);
        }
    }

    reduce(currentReduction: NumsReduction, newReduction: NumsReduction) {
        if (this._cellCount === 2) {
            this.reduce2CellsCage(newReduction);
        } else if (this._cellCount === 3) {
            this.reduceOptimalForSize3(currentReduction, newReduction);
        } else if (this._cellCount === 4) {
            this.reduceSmallCage(currentReduction, newReduction);
        } else {
            this.reduceLargeCage(currentReduction, newReduction);
        }
    }

    private reduce2CellsCage(reduction: NumsReduction) {
        // [PERFORMANCE] Storing `CellModel`s to access the array once for each `CellModel`.
        const cellM0 = this.cellMs[0];
        const cellM1 = this.cellMs[1];

        for (const combo of this._comboSet.combos) {
            // [PERFORMANCE] Storing `Combo`'s unique numbers to access the object once for each number.
            const num0 = combo.number0;
            const num1 = combo.number1;

            // [PERFORMANCE] Checking the presence of each `Combo` number for each `CellModel` just once.
            const cell0HasNum0 = cellM0.hasNumOpt(num0);
            const cell0HasNum1 = cellM0.hasNumOpt(num1);
            const cell1HasNum0 = cellM1.hasNumOpt(num0);
            const cell1HasNum1 = cellM1.hasNumOpt(num1);

            // [PERFORMANCE] Proceeding to reduction only if at least one `Combo` number is absent in at least one `CellModel`.
            if (!(cell0HasNum0 && cell0HasNum1 && cell1HasNum0 && cell1HasNum1)) {
                if (!cell0HasNum0) {
                    if (!cell1HasNum0) {
                        if (cell0HasNum1) reduction.deleteNumOpt(cellM0, num1);
                        if (cell1HasNum1) reduction.deleteNumOpt(cellM1, num1);
                        this.deleteCombo(combo);
                    } else if (cell1HasNum1) {
                        reduction.deleteNumOpt(cellM1, num1);
                    }
                } else if (!cell1HasNum1) {
                    reduction.deleteNumOpt(cellM0, num0);
                }
                if (!cell0HasNum1) {
                    if (!cell1HasNum1) {
                        if (cell0HasNum0) reduction.deleteNumOpt(cellM0, num0);
                        if (cell1HasNum0) reduction.deleteNumOpt(cellM1, num0);
                        this.deleteCombo(combo);
                    } else if (cell1HasNum0) {
                        reduction.deleteNumOpt(cellM1, num0);
                    }
                } else if (!cell1HasNum0) {
                    reduction.deleteNumOpt(cellM0, num1);
                }
            }
        }
    }

    private reduceOptimalForSize3(currentReduction: NumsReduction, newReduction: NumsReduction) {
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
                    newReduction.deleteNumOpt(cellM0, num0);
                }
            }
        }

        for (const combo of this._comboSet.combos) {
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
        return this._comboSet.combos.filter(combo => combo.has(num));
    }

    private deleteCombo(combo: Combo) {
        this._comboSet.deleteCombo(combo);
    }

    private reduceSmallCage(currentReduction: NumsReduction, newReduction: NumsReduction) {
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

        this._comboSet = this.newSumAddendsCombosSet();

        this.cellMs.forEach(cellM => {
            context.processCell(cellM, 0, () => {
                Array.from(cellM.numOpts()).forEach(num => {
                    context.processNum(num, 0, () => {
                        if (!this.hasSumMatchingPermutationsRecursive(num, 1, context)) {
                            newReduction.deleteNumOpt(cellM, num);
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
                this._comboSet.addCombo(combo);
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

    private reduceLargeCage(currentReduction: NumsReduction, newReduction: NumsReduction) {
        const presentNums = SudokuNumsSet.newEmpty();
        for (const cellM of this.cellMs) {
            presentNums.addAll(cellM.numOptsSet());
        }

        const commonComboNums = SudokuNumsSet.newEmpty();
        for (const num of SudokuNumsSet.NUM_RANGE) {
            let hasNumInAllCombos = true;
            for (const combo of this._comboSet.combos) {
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
        for (const combo of this._comboSet.combos) {
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
                    newReduction.tryDeleteNumOpt(cellM, num);
                }
            }

            for (const noLongerValidCombo of noLongerValidCombos) {
                this._comboSet.deleteCombo(noLongerValidCombo);
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
                for (const combo of this._comboSet.combos) {
                    if (combo.has(num)) {
                        singleCellForNumCombos.push(combo);
                    }
                }
                clue.singleCellForNumCombos = singleCellForNumCombos;
            }
            if (placement.isWithinHouse || cells.length === 1) {
                clue.presentInAllCombos = Array.from(this._comboSet.combos).every(combo => {
                    return combo.has(num);
                });
                clues.push(clue);
            }
        }

        return clues;
    }

    reduceToCombinationsContaining(withNum: number, reduction: NumsReduction) {
        if (this.hasSingleCombination() || !this._comboSet.size) return new Set();

        const newCombosMap = this.newSumAddendsCombosSet();
        const deleteCombos = [];
        const newNumOptions = SudokuNumsSet.newEmpty();

        for (const combo of this._comboSet.combos) {
            if (combo.numsSet.has(withNum)) {
                newCombosMap.addCombo(combo);
                newNumOptions.addAll(combo.numsSet);
            } else {
                deleteCombos.push(combo);
            }
        }

        if (deleteCombos.length > 0) {
            this._comboSet = newCombosMap;
            this.cellMs.forEach(cellM => {
                reduction.tryReduceNumOpts(cellM, newNumOptions);
            });
        }
    }

    hasSingleCombination() {
        return this._comboSet.size === 1;
    }

    get cellCount() {
        return this._cellCount;
    }

    get combos() {
        return Array.from(this._comboSet.combos);
    }

    get comboCount() {
        return this._comboSet.size;
    }

}
