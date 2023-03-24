import * as _ from 'lodash';
import { Cage } from '../../../puzzle/cage';
import { Cell, CellKey, ReadonlyCells } from '../../../puzzle/cell';
import { House, HouseIndex } from '../../../puzzle/house';
import { Sets } from '../../../util/sets';
import { InvalidSolverStateError } from '../../invalidSolverStateError';
import { Combo, ReadonlyCombos, SumAddendsCombinatorics } from '../../math';
import { CombosSet, ReadonlyCombosSet, ReadonlySudokuNumsSet, SudokuNumsSet } from '../../sets';
import { CellModel } from './cellModel';

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
    readonly positioningFlags;
    readonly cellMs;
    minRow;
    minCol;
    maxRow;
    maxCol;

    private _firstCell;
    private _cellsSet;
    private _cellCount;
    private _sumAddendsCombinatorics: SumAddendsCombinatorics;
    private _comboSet: CombosSet;

    constructor(cage: Cage, cellMs: Array<CellModel>, comboSet?: CombosSet) {
        this.cage = cage;
        this._cellsSet = new Set<CellKey>(cage.cells.map(cell => cell.key));
        this.positioningFlags = CageModel.positioningFlagsFor(cage.cells);
        this._firstCell = cage.firstCell;
        this.cellMs = cellMs;
        this.minRow = House.CELL_COUNT + 1;
        this.minCol = this.minRow;
        this.maxRow = 0;
        this.maxCol = this.maxRow;
        cage.cells.forEach(cell => {
            this.minRow = Math.min(this.minRow, cell.row);
            this.maxRow = Math.max(this.maxRow, cell.row);
            this.minCol = Math.min(this.minCol, cell.col);
            this.maxCol = Math.max(this.maxCol, cell.col);
        });
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

    static positioningFlagsFor(cells: ReadonlyCells) {
        return new CageModel.PositioningFlags(cells);
    }

    static isWithinHouse(cells: ReadonlyCells) {
        return this.positioningFlagsFor(cells).isWithinHouse;
    }

    private static PositioningFlags = class {

        readonly cells;
        readonly isSingleCellCage;
        readonly isWithinRow;
        readonly isWithinColumn;
        readonly isWithinNonet;
        readonly isWithinHouse;

        constructor(cells: ReadonlyCells) {
            this.cells = cells;
            this.isSingleCellCage = cells.length === 1;
            this.isWithinRow = this.isSingleCellCage || this.isSameForAll((cell: Cell) => cell.row);
            this.isWithinColumn = this.isSingleCellCage || this.isSameForAll((cell: Cell) => cell.col);
            this.isWithinNonet = this.isSingleCellCage || this.isSameForAll((cell: Cell) => cell.nonet);
            this.isWithinHouse = this.isWithinRow || this.isWithinColumn || this.isWithinNonet;
        }

        private isSameForAll(whatFn: (cell: Cell) => number) {
            return new Set(this.cells.map(whatFn)).size === 1;
        }

    };

    initialReduce() {
        const nums = this._comboSet.fill();
        this.updateCellMsNums(nums);
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

    reduceCombos(combos: ReadonlyCombosSet) {
        const nums = this._comboSet.reduce(combos);
        this.updateCellMsNums(nums);
    }

    private updateCellMsNums(nums: ReadonlySudokuNumsSet) {
        for (const cellM of this.cellMs) {
            cellM.reduceNumOpts(nums);
        }
    }

    reduce(): ReadonlySet<CellModel> {
        if (this.isEligibleForReductionOfSmallSize()) {
            if (this._cellCount === 2) {
                return this.reduceOptimalForSize2();
            } else if (this._cellCount === 3) {
                return this.reduceOptimalForSize3();
            } else {
                return this.reduceSmallCage();
            }
        } else {
            return this.reduceLargeCage();
        }
    }

    private isEligibleForReductionOfSmallSize() {
        return _.inRange(this._cellCount, 2, 5);
    }

    private reduceOptimalForSize2() {
        const modifiedCellMs = new Set<CellModel>();
        const combosToPotentiallyDeleteMap = new Map<string, Combo>();

        for (const oneCellM of this.cellMs) {
            const anotherCellM = this.cellMs[0] === oneCellM ? this.cellMs[1] : this.cellMs[0];
            for (const oneNum of oneCellM.numOpts()) {
                for (const combo of this.combosWithNum(oneNum)) {
                    const anotherNum = combo.number0 === oneNum ? combo.number1 : combo.number0;
                    if (!anotherCellM.hasNumOpt(anotherNum)) {
                        oneCellM.deleteNumOpt(oneNum);
                        modifiedCellMs.add(oneCellM);
                        combosToPotentiallyDeleteMap.set(combo.key, combo);
                    }
                }
            }
        }

        for (const comboToPotentiallyDelete of combosToPotentiallyDeleteMap.values()) {
            if (!this.cellMs[0].hasNumOpt(comboToPotentiallyDelete.number0) &&
                    !this.cellMs[0].hasNumOpt(comboToPotentiallyDelete.number1) &&
                    !this.cellMs[1].hasNumOpt(comboToPotentiallyDelete.number0) &&
                    !this.cellMs[1].hasNumOpt(comboToPotentiallyDelete.number1)) {
                this.deleteCombo(comboToPotentiallyDelete);
            }
        }

        return modifiedCellMs;
    }

    private reduceOptimalForSize3() {
        const modifiedCellMs = new Set<CellModel>();

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
                    cellM0.deleteNumOpt(num0);
                    modifiedCellMs.add(cellM0);
                }
            }
        }

        for (const combo of this._comboSet.values) {
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

        return modifiedCellMs;
    }

    private combosWithNum(num: number) {
        return Array.from(this._comboSet.values).filter(combo => combo.has(num));
    }

    private deleteCombo(combo: Combo) {
        this._comboSet.deleteCombo(combo);
    }

    private reduceSmallCage() {
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

        const modifiedCellMs = new Set<CellModel>();
        this.cellMs.forEach(cellM => {
            context.processCell(cellM, 0, () => {
                Array.from(cellM.numOpts()).forEach(num => {
                    context.processNum(num, 0, () => {
                        if (!this.hasSumMatchingPermutationsRecursive(num, 1, context)) {
                            cellM.deleteNumOpt(num);
                            modifiedCellMs.add(cellM);
                        }
                    });
                });
            });
        });

        return modifiedCellMs;
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

    private reduceLargeCage() {
        const presentNums = SudokuNumsSet.newEmpty();
        for (const cellM of this.cellMs) {
            presentNums.addAll(cellM.numOptsSet());
        }

        const commonComboNums = SudokuNumsSet.newEmpty();
        for (const num of SudokuNumsSet.NUM_RANGE) {
            let hasNumInAllCombos = true;
            for (const combo of this._comboSet.values) {
                hasNumInAllCombos = hasNumInAllCombos && combo.has(num);
            }
            if (hasNumInAllCombos) {
                commonComboNums.add(num);
            }
        }

        for (const commonNum of commonComboNums.nums()) {
            if (!presentNums.has(commonNum)) {
                throw new InvalidSolverStateError(`Common combo num ${commonNum} not found in CellModels for Cage ${this.cage.key}`);
            }
        }

        const validCombos = [];
        const validComboNums = SudokuNumsSet.newEmpty();
        const noLongerValidCombos = new Array<Combo>();
        const noLongerValidComboNums = SudokuNumsSet.newEmpty();
        for (const combo of this._comboSet.values) {
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

        const modifiedCellMs = new Set<CellModel>();
        if (noLongerValidCombos.length > 0) {
            const numOptsToDelete = new Set<number>();
            for (const num of noLongerValidComboNums.nums()) {
                if (!validComboNums.has(num) && presentNums.has(num)) {
                    numOptsToDelete.add(num);
                }
            }

            for (const cellM of this.cellMs) {
                for (const num of numOptsToDelete) {
                    if (cellM.hasNumOpt(num)) {
                        cellM.deleteNumOpt(num);
                        modifiedCellMs.add(cellM);
                    }
                }
            }

            for (const noLongerValidCombo of noLongerValidCombos) {
                this._comboSet.deleteCombo(noLongerValidCombo);
            }
        }

        return modifiedCellMs;
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
            const positioningFlags = CageModel.positioningFlagsFor(cells);
            const clue: Clue = { num };
            if (positioningFlags.isWithinHouse) {
                if (positioningFlags.isWithinRow) {
                    clue.row = cells[0].row;
                } else if (positioningFlags.isWithinColumn) {
                    clue.col = cells[0].col;
                }
                if (positioningFlags.isWithinNonet) {
                    clue.nonet = cells[0].nonet;
                }
            }
            if (cells.length === 1) {
                clue.singleCellForNum = cells[0];
                const singleCellForNumCombos = [];
                for (const combo of this._comboSet.values) {
                    if (combo.has(num)) {
                        singleCellForNumCombos.push(combo);
                    }
                }
                clue.singleCellForNumCombos = singleCellForNumCombos;
            }
            if (positioningFlags.isWithinHouse || cells.length === 1) {
                clue.presentInAllCombos = Array.from(this._comboSet.values).every(combo => {
                    return combo.has(num);
                });
                clues.push(clue);
            }
        }

        return clues;
    }

    reduceToCombinationsContaining(withNum: number): ReadonlySet<CellModel> {
        if (this.hasSingleCombination() || !this._comboSet.size) return new Set();

        const newCombosMap = this.newSumAddendsCombosSet();
        const deleteCombos = [];
        const newNumOptions = SudokuNumsSet.newEmpty();

        for (const combo of this._comboSet.values) {
            if (combo.numsSet.has(withNum)) {
                newCombosMap.addCombo(combo);
                newNumOptions.addAll(combo.numsSet);
            } else {
                deleteCombos.push(combo);
            }
        }

        if (deleteCombos.length > 0) {
            this._comboSet = newCombosMap;
            const reducedCellMs = new Set<CellModel>();
            this.cellMs.forEach(cellM => {
                if (cellM.reduceNumOptsWithImpact(newNumOptions)) {
                    reducedCellMs.add(cellM);
                }
            });
            return reducedCellMs;
        }
        else {
            return new Set();
        }
    }

    hasSingleCombination() {
        return this._comboSet.size === 1;
    }

    get cellCount() {
        return this._cellsSet.size;
    }

    get combos() {
        return Array.from(this._comboSet.values);
    }

    get comboCount() {
        return this._comboSet.size;
    }

}
