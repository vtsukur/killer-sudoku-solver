import _ from 'lodash';
import { House } from '../../../problem/house';
import { findNumCombinationsForSum } from '../../combinatorial/combinatorial';

export class CageModel {
    #firstCell;
    #cellsSet;
    #cellCount;
    #combosMap;
    #enableExperimentalOptimization;
    #canHaveDuplicateNums;

    constructor(cage, cellModels, canHaveDuplicateNums) {
        this.cage = cage;
        this.#cellsSet = new Set(cage.cells.map(cell => cell.key));
        this.positioningFlags = CageModel.positioningFlagsFor(cage.cells);
        this.#firstCell = cage.cells[0];
        this.cellModels = cellModels;
        this.#canHaveDuplicateNums = _.isUndefined(canHaveDuplicateNums) ? !this.positioningFlags.isWithinHouse : canHaveDuplicateNums;
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
        this.#enableExperimentalOptimization = true;
    }

    static positioningFlagsFor(cells) {
        return new CageModel.#PositioningFlags(cells);
    }

    static #PositioningFlags = class {
        constructor(cells) {
            this.cells = cells;
            this.isSingleCellCage = cells.length === 1;
            this.isWithinRow = this.isSingleCellCage || this.#isSameForAll(cell => cell.row);
            this.isWithinColumn = this.isSingleCellCage || this.#isSameForAll(cell => cell.col);
            this.isWithinNonet = this.isSingleCellCage || this.#isSameForAll(cell => cell.nonet);
            this.isWithinHouse = this.isWithinRow || this.isWithinColumn || this.isWithinNonet;
        }

        #isSameForAll(whatFn) {
            return new Set(this.cells.map(whatFn)).size === 1;
        }
    }

    get canHaveDuplicateNums() {
        return this.#canHaveDuplicateNums;
    }

    initialReduce() {
        if (this.#canHaveDuplicateNums) return;

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

    anyColumn() {
        return this.#firstCell.col;
    }

    anyNonet() {
        return this.#firstCell.nonet;
    }

    hasCellAt(row, col) {
        return this.cellModels.some(cellM => cellM.cell.row === row && cellM.cell.col === col);
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
        if (this.#isEligibleForReductionOfSmallSize()) {
            if (!this.#canHaveDuplicateNums && this.#enableExperimentalOptimization && _.inRange(this.#cellCount, 2, 4)) {
                if (this.#cellCount === 2) {
                    return this.#reduceOptimalForSize2();
                } else if (this.#cellCount === 3) {
                    return this.#reduceOptimalForSize3();
                } else {
                    // remove for refactoring
                    throw 'Should not reach here';
                }
            } else {
                return this.#reduceSmallCage();
            }
        } else if (!this.#canHaveDuplicateNums) {
            return this.#reduceLargeCage();
        } else {
            return new Set();
        }
    }

    #isEligibleForReductionOfSmallSize() {
        return _.inRange(this.#cellCount, 2, 5);
    }

    #reduceOptimalForSize2() {
        const modifiedCellMs = new Set();
        const combosToPotentiallyRemoveMap = new Map();

        for (const oneCellM of this.cellModels) {
            const anotherCellM = this.cellModels[0] === oneCellM ? this.cellModels[1] : this.cellModels[0];
            for (const oneNum of oneCellM.numOpts()) {
                for (const combo of this.#combosForNumArr(oneNum)) {
                    const anotherNum = combo[0] === oneNum ? combo[1] : combo[0];
                    if (!anotherCellM.hasNumOpt(anotherNum)) {
                        oneCellM.deleteNumOpt(oneNum);
                        modifiedCellMs.add(oneCellM);
                        combosToPotentiallyRemoveMap.set(combo.join(), combo);
                    }
                }
            }
        }

        for (const comboToPotentiallyRemove of combosToPotentiallyRemoveMap.values()) {
            if (!this.cellModels[0].hasNumOpt(comboToPotentiallyRemove[0]) &&
                    !this.cellModels[0].hasNumOpt(comboToPotentiallyRemove[1]) &&
                    !this.cellModels[1].hasNumOpt(comboToPotentiallyRemove[0]) &&
                    !this.cellModels[1].hasNumOpt(comboToPotentiallyRemove[1])) {
                this.#deleteComboArr(comboToPotentiallyRemove);
            }
        }

        return modifiedCellMs;
    }

    #reduceOptimalForSize3() {
        const modifiedCellMs = new Set();

        const PERMS_OF_3 = [
            [0, 1, 2],
            [0, 2, 1],
            [1, 0, 2],
            [1, 2, 0],
            [2, 0, 1],
            [2, 1, 0]
        ];

        const cellMs = this.cellModels;

        for (const cellM0 of cellMs) {
            const cellM0Index = cellMs.findIndex(c => c === cellM0);
            const remainingCellMs = [...cellMs];
            remainingCellMs.splice(cellM0Index, 1);
            const cellM1 = remainingCellMs[0];
            const cellM2 = remainingCellMs[1];

            for (const num0 of cellM0.numOpts()) {
                let numStands = false;
                for (const combo of this.#combosForNumArr(num0)) {
                    const num0Index = combo.findIndex(n => n === num0);
                    const remainingNums = [...combo];
                    remainingNums.splice(num0Index, 1);
                    const num1 = remainingNums[0];
                    const num2 = remainingNums[1];

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

        for (const combo of this.#combosMap.values()) {
            let comboStands = false;
            for (const perm of PERMS_OF_3) {
                const cellM0HasIt = cellMs[0].hasNumOpt(combo[perm[0]]);
                const cellM1HasIt = cellMs[1].hasNumOpt(combo[perm[1]]);
                const cellM2HasIt = cellMs[2].hasNumOpt(combo[perm[2]]);
                const someCellHasIt = cellM0HasIt && cellM1HasIt && cellM2HasIt;
                comboStands = comboStands || someCellHasIt;
            }
            if (!comboStands) {
                this.#deleteComboArr(combo);
            }
        }
        
        return modifiedCellMs;
    }

    #combosForNumArr(num) {
        const combosArr = [];
        for (const combo of this.#combosMap.values()) {
            if (combo.some(n => n === num)) {
                combosArr.push(combo);
            }
        }
        return combosArr;
    }

    #deleteComboArr(combo) {
        this.#combosMap.delete(combo.join());
    }

    #reduceSmallCage() {
        const context = {
            canHaveDuplicateNums: this.canHaveDuplicateNums,
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
                return this.canHaveDuplicateNums ? false : this.processedNums.has(num);
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

    #reduceLargeCage() {
        let presentNums = new Set();
        this.cellModels.forEach(cellM => {
            presentNums = new Set([...presentNums, ...cellM.numOpts()]);
        });

        const commonComboNums = new Set();
        _.range(1, House.SIZE + 1).forEach(num => {
            let hasNumInAllCombos = true;
            for (const combo of this.#combosMap.values()) {
                const comboSet = new Set(combo); // avoid creating set and use cache instead
                hasNumInAllCombos = hasNumInAllCombos && comboSet.has(num);
            }
            if (hasNumInAllCombos) {
                commonComboNums.add(num);
            }
        });

        for (const commonNum of commonComboNums) {
            if (!presentNums.has(commonNum)) {
                throw `Common combo num ${commonNum} not found in CellModels for Cage ${this.cage.key}`;
            }
        }

        const validCombos = [];
        let validComboNums = new Set();
        const noLongerValidCombos = [];
        let noLongerValidComboNums = new Set();
        for (const combo of this.#combosMap.values()) {
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
                validComboNums = new Set([...validComboNums, ...combo]);
            } else {
                noLongerValidCombos.push(combo);
                noLongerValidComboNums = new Set([...noLongerValidComboNums, ...combo]);
            }
        }

        const modifiedCellMs = new Set();
        if (noLongerValidCombos.length > 0) {
            const numOptsToDelete = new Set();
            for (const num of noLongerValidComboNums) {
                if (!validComboNums.has(num) && presentNums.has(num)) {
                    numOptsToDelete.add(num);
                }
            }

            for (const cellM of this.cellModels) {
                for (const num of numOptsToDelete) {
                    if (cellM.hasNumOpt(num)) {
                        cellM.deleteNumOpt(num);
                        modifiedCellMs.add(cellM);
                    }
                }
            }

            for (const noLongerValidCombo of noLongerValidCombos) {
                this.#combosMap.delete(noLongerValidCombo.join());
            }
        }

        return modifiedCellMs;
    }

    findNumPlacementClues(forNum) {
        const numToCells = new Map();
        const numOptsFn = (cellM) => {
            if (_.isUndefined(forNum)) {
                return cellM.numOpts();
            } else if (cellM.numOpts().has(forNum)) {
                return new Set([ forNum ]);
            } else {
                return new Set();
            }
        };
        for (const cellM of this.cellModels) {
            for (const num of numOptsFn(cellM)) {
                if (!numToCells.has(num)) {
                    numToCells.set(num, []);
                }
                numToCells.get(num).push(cellM.cell);
            }
        }

        const clues = [];
        for (const numToCellsEntry of numToCells.entries()) {
            const num = numToCellsEntry[0];
            const cells = numToCellsEntry[1];
            const positioningFlags = CageModel.positioningFlagsFor(cells);
            const clue = { num };
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
                for (const combo of this.#combosMap.values()) {
                    if (new Set(combo).has(num)) {
                        singleCellForNumCombos.push(combo);
                    }
                }
                clue.singleCellForNumCombos = singleCellForNumCombos;
            }
            if (positioningFlags.isWithinHouse || cells.length === 1) {
                clues.push(clue);
            }
        }

        return clues;
    }

    reduceToCombinationsContaining(withNum) {
        if (this.hasSingleCombination() || !this.#combosMap.size) return [];

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

    hasSingleCombination() {
        return this.#combosMap.size === 1;
    }

    get cellCount() {
        return this.#cellsSet.size;
    }

    get combos() {
        return this.#combosMap.values();
    }

    get comboCount() {
        return this.#combosMap.size;
    }
}
