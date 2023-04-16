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
import { CageModelReducer } from '../../strategies/reduction/cageModelReducer';
import { CageModel2Reducer } from '../../strategies/reduction/cageModel2Reducer';
import { CageModel3Reducer } from '../../strategies/reduction/cageModel3Reducer';
import { CageModel4Reducer } from '../../strategies/reduction/cageModel4Reducer';

type Clue = {
    num: number;
    row?: number;
    col?: number;
    nonet?: number;
    singleCellForNum?: Cell;
    singleCellForNumCombos?: ReadonlyCombos;
    presentInAllCombos?: boolean;
}

export class CageModel {

    readonly cage;
    readonly cellMs;

    private _firstCell;
    private _cellCount;
    sumAddendsCombinatorics: SumAddendsCombinatorics;
    readonly comboSet: CombosSet;
    private _reducer?: CageModelReducer;

    isFirstReduction = true;

    constructor(cage: Cage, cellMs: Array<CellModel>, comboSet?: CombosSet) {
        this.cage = cage;
        this._firstCell = cage.firstCell;
        this.cellMs = cellMs;
        this._cellCount = cage.cellCount;
        this.sumAddendsCombinatorics = SumAddendsCombinatorics.enumerate(this.cage.sum, this.cage.cellCount);
        if (comboSet) {
            this.comboSet = comboSet.clone();
        } else {
            this.comboSet = this.newSumAddendsCombosSet();
        }
        this.updateReducers();
    }

    updateReducers() {
        if (this._cellCount === 2) {
            this._reducer = new CageModel2Reducer(this);
        } else if (this._cellCount === 3) {
            this._reducer = new CageModel3Reducer(this);
        } else if (this._cellCount === 4) {
            this._reducer = new CageModel4Reducer(this);
        }
    }

    newSumAddendsCombosSet(): CombosSet {
        return CombosSet.newEmpty(this.sumAddendsCombinatorics);
    }

    deepCopy() {
        const copy = this.deepCopyWithSameCellModels();

        const cellMsCpy = this.cellMs.map(cellM => cellM.deepCopyWithoutCageModels());

        for (const cellM of cellMsCpy) {
            cellM.addWithinCageModel(copy);
        }

        cellMsCpy.forEach((cellM, index) => {
            copy.cellMs[index] = cellM;
        });

        return copy;
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
        if (this._cellCount >= 2 && this._cellCount <= 4) {
            this._reducer?.reduce(reduction);
        } else {
            this.reduceLargeCage(reduction);
        }
        this.isFirstReduction = false;
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
        if (this.hasSingleCombination() || !this.comboSet.size) return;

        const deleteCombos = [];
        const newNumOptions = SudokuNumsSet.newEmpty();

        for (const combo of this.comboSet.combos) {
            if (combo.numsSet.has(withNum)) {
                newNumOptions.addAll(combo.numsSet);
            } else {
                this.comboSet.deleteCombo(combo);
                deleteCombos.push(combo);
            }
        }

        if (deleteCombos.length > 0) {
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
