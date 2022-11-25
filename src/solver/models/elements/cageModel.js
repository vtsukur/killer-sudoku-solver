import _ from 'lodash';
import { House } from '../../../problem/house';
import { findNumCombinationsForSum } from '../../combinatorial/combinatorial';

export class CageModel {
    #firstCell;
    #cellsSet;
    #cellCount;
    #combosMap;

    constructor(cage, cellModels) {
        this.cage = cage;
        this.#cellsSet = new Set(cage.cells.map(cell => cell.key));
        this.isSingleCellCage = this.cellCount === 1;
        this.isWithinRow = this.isSingleCellCage || this.#isSameForAll(cell => cell.row);
        this.isWithinColumn = this.isSingleCellCage || this.#isSameForAll(cell => cell.col);
        this.isWithinNonet = this.isSingleCellCage || this.#isSameForAll(cell => cell.nonet);
        this.isWithinHouse = this.isWithinRow || this.isWithinColumn || this.isWithinNonet;
        this.#firstCell = cage.cells[0];
        this.cellModels = cellModels;
        this.minRow = House.SIZE + 1;
        this.minCol = this.minRow;
        this.maxRow = 0;
        this.maxCol = this.maxRow;
        cage.cells.forEach(cell => {
            this.minRow = Math.min(this.minRow, cell.row);
            this.maxRow = Math.max(this.maxRow, cell.row);
            this.minCol = Math.min(this.minCol, cell.col);
            this.maxCol = Math.max(this.maxCol, cell.col);
        });
        this.#cellCount = cage.cellCount;
        this.#combosMap = new Map();
    }

    #isSameForAll(whatFn) {
        return new Set(this.cage.cells.map(whatFn)).size === 1;
    }

    initialReduce() {
        if (!this.isWithinHouse) return;

        const combos = findNumCombinationsForSum(this.cage.sum, this.cage.cellCount);
        let nums = new Set();
        combos.forEach(combo => {
            nums = new Set([...nums, ...combo]);
            const comboValue = Array.from(combo);
            const comboKey = comboValue.join();
            this.#combosMap.set(comboKey, comboValue);
        })
        this.cellModels.forEach(cellM => cellM.reduceNumOptions(nums));
    }

    anyRow() {
        return this.#firstCell.row;
    }

    anyColumnIdx() {
        return this.#firstCell.col;
    }

    anySubgridIdx() {
        return this.#firstCell.nonet;
    }

    updateCombinations(combos) {
        const numOpts = new Set();
        [...combos].forEach(comboSet => {
            [...comboSet].forEach(num => {
                numOpts.add(num);
            });
        });

        this.cellModels.forEach(cellModel => cellModel.reduceNumOptions(numOpts));
    }

    reduce() {
        if (_.inRange(this.#cellCount, 2, 4)) {
            if (this.isWithinHouse) {
                return this.#reduceByCellPermutations(false);
            } else {
                return this.#reduceByCellPermutations(true);
            }
        } else {
            return new Set();
        }
    }

    #reduceByCellPermutations(canHaveNumDuplicates) {
        const context = {
            processedCellModels: new Set(),
            remainingCellModels: new Set(this.cellModels),
            processedNums: new Set(),
            numbersStack: new Array(this.#cellCount),
            cellModelsStack: new Array(this.#cellCount),
            processCell: function(cellModel, step, fn) {
                if (this.processedCellModels.has(cellModel)) return;
                this.processedCellModels.add(cellModel); this.remainingCellModels.delete(cellModel);
                this.cellModelsStack[step] = cellModel;
                const retVal = fn();
                this.cellModelsStack[step] = undefined;
                this.processedCellModels.delete(cellModel); this.remainingCellModels.add(cellModel);    
                return retVal;
            },
            mayNotProceedWithNum: function(num) {
                return canHaveNumDuplicates ? false : this.processedNums.has(num);
            },
            processNum: function(num, step, fn) {
                if (this.mayNotProceedWithNum(num)) return;
                this.processedNums.add(num);
                this.numbersStack[step] = num;
                const retVal = fn();
                this.numbersStack[step] = undefined;
                this.processedNums.delete(num);
                return retVal;
            },
            remainingCellModel: function() {
                return context.remainingCellModels.values().next().value;
            }
        };

        this.#combosMap = new Map();

        const modifiedCellModels = new Set();
        this.cellModels.forEach(cellModel => {
            context.processCell(cellModel, 0, () => {
                Array.from(cellModel.numOpts()).forEach(num => {
                    context.processNum(num, 0, () => {
                        if (!this.#hasSumMatchingPermutationsRecursive(num, 1, context)) {
                            cellModel.deleteNumOpt(num);
                            modifiedCellModels.add(cellModel);
                        }    
                    });
                });
            });
        });

        return modifiedCellModels;
    } 

    #hasSumMatchingPermutationsRecursive(currentSum, step, context) {
        if (currentSum > this.cage.sum) { return false; }

        let has = false;

        if (step === (this.#cellCount - 1)) {
            const lastNum = this.cage.sum - currentSum;
            if (context.mayNotProceedWithNum(lastNum)) return false;
            const lastCellModel = context.remainingCellModel();
            has = lastCellModel.hasNumOpt(lastNum);
            if (has) {
                const sortedNums = [...context.numbersStack];
                sortedNums[this.#cellCount - 1] = lastNum;
                sortedNums.sort();
                const comboKey = sortedNums.join();
                this.#combosMap.set(comboKey, sortedNums);
            }
        } else {
            this.cellModels.forEach(cellModel => {
                context.processCell(cellModel, step, () => {
                    Array.from(cellModel.numOpts()).forEach(num => {
                        context.processNum(num, step, () => {
                            has = this.#hasSumMatchingPermutationsRecursive(currentSum + num, step + 1, context) || has;
                        });
                    });
                });
            });    
        }

        return has;
    }

    reduceToCombinationsContaining(withNum) {
        if (this.#hasSingleCombination() || !this.#combosMap.size) return [];

        const newCombosMap = new Map();
        const removedCombos = [];
        let newNumOptions = new Set();

        for (const comboEntry of this.#combosMap.entries()) {
            const key = comboEntry[0];
            const value = comboEntry[1];
            const numSet = new Set(value);
            if (numSet.has(withNum)) {
                newCombosMap.set(key, value);
                newNumOptions = new Set([...newNumOptions, ...numSet]);
            } else {
                removedCombos.push(value);
            }
        }

        if (removedCombos.length > 0) {
            this.#combosMap = newCombosMap;
            const reducedCellModels = [];
            this.cellModels.forEach(cellModel => {
                if (cellModel.reduceNumOptions(newNumOptions).size > 0) {
                    reducedCellModels.push(cellModel);
                }
            });
            return reducedCellModels;
        }
        else {
            return [];            
        }
    }

    #hasSingleCombination() {
        return this.#combosMap.size === 1;
    }

    get cellCount() {
        return this.#cellsSet.size;
    }

    get combos() {
        return this.#combosMap.values();
    }
}
