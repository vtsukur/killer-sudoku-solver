import * as _ from 'lodash';
import { Cage } from '../../../puzzle/cage';
import { Cell } from '../../../puzzle/cell';
import { CellsPlacement } from '../../../puzzle/cellsPlacement';
import { HouseIndex } from '../../../puzzle/house';
import { Sets } from '../../../util/sets';
import { ReadonlyCombos, SumCombinatorics } from '../../math';
import { CombosSet, ReadonlyCombosSet, SudokuNumsSet } from '../../sets';
import { CageModel2Reducer } from '../../strategies/reduction/cageModel2Reducer';
import { CageModel3Reducer } from '../../strategies/reduction/cageModel3Reducer';
import { CageModel4Reducer } from '../../strategies/reduction/cageModel4Reducer';
import { CageModel5Reducer } from '../../strategies/reduction/cageModel5Reducer';
import { CageModelReducer } from '../../strategies/reduction/cageModelReducer';
import { MasterModelReduction } from '../../strategies/reduction/masterModelReduction';
import { CellModel } from './cellModel';
import { CageModel6PlusReducer } from '../../strategies/reduction/cageModel6PlusReducer';

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
    sumCombinatorics: SumCombinatorics;
    readonly combosSet: CombosSet;
    private _reducer?: CageModelReducer;

    isFirstReduction = true;

    constructor(cage: Cage, cellMs: Array<CellModel>, comboSet?: CombosSet) {
        this.cage = cage;
        this._firstCell = cage.firstCell;
        this.cellMs = cellMs;
        this._cellCount = cage.cellCount;
        this.sumCombinatorics = SumCombinatorics.BY_COUNT_BY_SUM[this.cage.cellCount][this.cage.sum];
        if (comboSet) {
            this.combosSet = comboSet.clone();
        } else {
            this.combosSet = this.newCombosSet();
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
        } else if (this._cellCount === 5) {
            this._reducer = new CageModel5Reducer(this);
        } else {
            this._reducer = new CageModel6PlusReducer(this);
        }
    }

    newCombosSet(): CombosSet {
        return CombosSet.newEmpty(this.sumCombinatorics);
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
        return new CageModel(this.cage, [...this.cellMs], this.combosSet);
    }

    initialReduce(reduction?: MasterModelReduction) {
        const nums = this.combosSet.fill();
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
        const nums = this.combosSet.reduce(combos);
        for (const cellM of this.cellMs) {
            reduction.tryReduceNumOpts(cellM, nums, this);
        }
    }

    reduce(reduction: MasterModelReduction) {
        this._reducer?.reduce(reduction);
        this.isFirstReduction = false;
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
                for (const combo of this.combosSet.combos) {
                    if (combo.has(num)) {
                        singleCellForNumCombos.push(combo);
                    }
                }
                clue.singleCellForNumCombos = singleCellForNumCombos;
            }
            if (placement.isWithinHouse || cells.length === 1) {
                clue.presentInAllCombos = Array.from(this.combosSet.combos).every(combo => {
                    return combo.has(num);
                });
                clues.push(clue);
            }
        }

        return clues;
    }

    reduceToCombinationsContaining(withNum: number, reduction: MasterModelReduction) {
        if (this.hasSingleCombination() || !this.combosSet.size) return;

        const deleteCombos = [];
        const newNumOptions = SudokuNumsSet.newEmpty();

        for (const combo of this.combosSet.combos) {
            if (combo.numsSet.has(withNum)) {
                newNumOptions.addAll(combo.numsSet);
            } else {
                this.combosSet.deleteCombo(combo);
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
        return this.combosSet.size === 1;
    }

    get cellCount() {
        return this._cellCount;
    }

    get combos() {
        return Array.from(this.combosSet.combos);
    }

    get comboCount() {
        return this.combosSet.size;
    }

}
