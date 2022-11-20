import { House } from '../problem/house';

export class CageSolver {
    #firstCell;
    #cellsSet;
    #cellCount;
    #combosMap;

    constructor(cage, cellSolvers) {
        this.cage = cage;
        this.#cellsSet = new Set(cage.cells.map(cell => cell.key()));
        this.isSingleCellCage = this.cellCount === 1;
        this.isWithinRow = this.isSingleCellCage || this.#isSameForAll(cell => cell.row);
        this.isWithinColumn = this.isSingleCellCage || this.#isSameForAll(cell => cell.col);
        this.isWithinSubgrid = this.isSingleCellCage || this.#isSameForAll(cell => cell.nonet);
        this.isWithinHouse = this.isWithinRow || this.isWithinColumn || this.isWithinSubgrid;
        this.#firstCell = cage.cells[0];
        this.cellSolvers = cellSolvers;
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

        this.cellSolvers.forEach(cellSolver => cellSolver.reduceNumberOptions(numOpts));
    }

    reduce() {
        if (this.#cellCount > 1 && this.#cellCount < 6) {
            if (this.cage.isWithinHouse) {
                return this.#reduceByCellPermutations(false);
            } else {
                return this.#reduceByCellPermutations(true);
            }
        } else {
            return [];
        }
    }

    #reduceByCellPermutations(canHaveNumberDuplicates) {
        const context = {
            i: 0,
            cellsSolvers: this.cellSolvers,
            processedCellDets: new Set(),
            remainingCellDets: new Set(this.cellSolvers),
            processedNumbers: new Set(),
            numbersStack: new Array(this.#cellCount),
            cellsSolversStack: new Array(this.#cellCount),
            processCell: function(cellSolver, step, fn) {
                if (this.processedCellDets.has(cellSolver)) return;
                this.processedCellDets.add(cellSolver); this.remainingCellDets.delete(cellSolver);
                this.cellsSolversStack[step] = cellSolver;
                const retVal = fn();
                this.cellsSolversStack[step] = undefined;
                this.processedCellDets.delete(cellSolver); this.remainingCellDets.add(cellSolver);    
                return retVal;
            },
            mayNotProceedWithNumber: function(num) {
                return canHaveNumberDuplicates ? false : this.processedNumbers.has(num);
            },
            processNumber: function(num, step, fn) {
                this.i++;
                if (this.mayNotProceedWithNumber(num)) return;
                this.processedNumbers.add(num);
                this.numbersStack[step] = num;
                const retVal = fn();
                this.numbersStack[step] = undefined;
                this.processedNumbers.delete(num);
                return retVal;
            },
            remainingCellDet: function() {
                return context.remainingCellDets.values().next().value;
            }
        };

        this.#combosMap = new Map();

        const modifiedCellDets = [];
        this.cellSolvers.forEach(cellSolver => {
            context.processCell(cellSolver, 0, () => {
                Array.from(cellSolver.numOpts()).forEach(num => {
                    context.processNumber(num, 0, () => {
                        if (!this.#hasSumMatchingPermutationsRecursive(num, 1, context)) {
                            // move to modification after looping
                            cellSolver.deleteNumOpt(num);
                            modifiedCellDets.push(cellSolver);
                        }    
                    });
                });
            });
        });

        return modifiedCellDets;
    } 

    #hasSumMatchingPermutationsRecursive(currentSumVal, step, context) {
        let has = false;

        if (step === (this.#cellCount - 1)) {
            context.i++;
            const lastNum = this.cage.sum - currentSumVal;
            if (context.mayNotProceedWithNumber(lastNum)) return false;
            const lastCellDet = context.remainingCellDet();
            has = lastCellDet.hasNumOpt(lastNum);
            if (has) {
                const sortedNumbers = [...context.numbersStack];
                sortedNumbers[this.#cellCount - 1] = lastNum;
                sortedNumbers.sort();
                const comboKey = sortedNumbers.join();
                this.#combosMap.set(comboKey, sortedNumbers);
            }
        } else {
            this.cellSolvers.forEach(cellSolver => {
                context.processCell(cellSolver, step, () => {
                    Array.from(cellSolver.numOpts()).forEach(num => {
                        context.processNumber(num, step, () => {
                            has = this.#hasSumMatchingPermutationsRecursive(currentSumVal + num, step + 1, context) || has;
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
            const reducedCellDets = [];
            this.cellSolvers.forEach(cellSolver => {
                if (cellSolver.reduceNumberOptions(newNumOptions).size > 0) {
                    reducedCellDets.push(cellSolver);
                }
            });
            return reducedCellDets;
        }
        else {
            return [];            
        }
    }

    #hasSingleCombination() {
        return this.#combosMap.size === 1;
    }

    has(cellSolver) {
        return this.#cellsSet.has(cellSolver.key());
    }

    get cellCount() {
        return this.#cellsSet.size;
    }

    key() {
        return this.cage.key();
    }

    toString() {
        return this.key();
    }
}
