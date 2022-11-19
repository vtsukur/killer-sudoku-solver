import _ from 'lodash';
import { newGridMatrix } from '../util/matrix';
import { UNIQUE_SEGMENT_LENGTH, SUBGRID_SIDE_LENGTH, HOUSE_SUM, UNIQUE_SEGMENT_COUNT } from '../problem/constants';
import { Cage } from '../problem/cage';
import { clusterCagesByOverlap, findSumCombinationsForSegment } from './combinatorial';

const newAreaIterator = (valueOfFn, max) => {
    let i = 0;
    return {
        [Symbol.iterator]() { return this; },
        next() {
            if (i < max) {
                return { value: valueOfFn(i++), done: false };
            } else {
                return { value: max, done: true };
            }
        }
    }
};

const newSegmentIterator = (valueOfFn) => {
    return newAreaIterator(valueOfFn, UNIQUE_SEGMENT_LENGTH);
};

export class CellSolver {
    #numOpts

    constructor({ cell, row, column, subgrid }) {
        this.cell = cell;
        this.row = row;
        this.column = column;
        this.subgrid = subgrid;
        this.withinCagesSet = new Set();
        this.solved = false;

        this.#numOpts = new Set(_.range(UNIQUE_SEGMENT_LENGTH).map(i => i + 1));
        this.placedNumber = undefined;
    }

    addWithinCage(withinCage) {
        this.withinCagesSet.add(withinCage);
    }

    removeWithinCage(withinCage) {
        this.withinCagesSet.delete(withinCage);
    }

    numOpts() {
        return this.#numOpts;
    }

    hasNumOpt(num) {
        return this.#numOpts.has(num);
    }

    deleteNumOpt(num) {
        return this.#numOpts.delete(num);
    }

    reduceNumberOptions(numOpts) {
        const removedNumOptions = new Set();
        for (const existingNumberOption of this.#numOpts) {
            if (!numOpts.has(existingNumberOption)) {
                removedNumOptions.add(existingNumberOption);
            }
        }
        for (const numToRemove of removedNumOptions) {
            this.deleteNumOpt(numToRemove);
        }
        return removedNumOptions;
    }

    placeNumber(number) {
        this.#numOpts = new Set([number]);
        this.placedNumber = number;
        this.solved = true;
    }
}

class CagesArea {
    constructor(cages = [], absMaxAreaCellCount = UNIQUE_SEGMENT_COUNT) {
        this.cages = cages;
        this.cellsSet = new Set();
        this.nonOverlappingCellsSet = new Set();
        this.totalValue = 0;
        cages.forEach(cage => {
            cage.cells.forEach(cell => {
                this.cellsSet.add(cell);
            }, this);
        }, this);

        const { nonOverlappingCages } = clusterCagesByOverlap(cages, new Set(this.cellsSet), absMaxAreaCellCount);
        nonOverlappingCages.forEach(cage => {
            this.totalValue += cage.value;
            cage.cells.forEach(cell => this.nonOverlappingCellsSet.add(cell));
        });
    }

    hasNonOverlapping(cell) {
        return this.nonOverlappingCellsSet.has(cell);
    }
}

class CageSolver {
    #firstCell;
    #cellCount;
    #combosMap;

    constructor(cage, cellSolvers) {
        this.cage = cage;
        this.#firstCell = cage.cells[0];
        this.cellSolvers = cellSolvers;
        this.minRowIdx = UNIQUE_SEGMENT_LENGTH + 1;
        this.minColIdx = this.minRowIdx;
        this.maxRowIdx = 0;
        this.maxColIdx = this.maxRowIdx;
        cage.cells.forEach(cell => {
            this.minRowIdx = Math.min(this.minRowIdx, cell.rowIdx);
            this.maxRowIdx = Math.max(this.maxRowIdx, cell.rowIdx);
            this.minColIdx = Math.min(this.minColIdx, cell.colIdx);
            this.maxColIdx = Math.max(this.maxColIdx, cell.colIdx);
        });
        this.#cellCount = cage.cellCount;
        this.#combosMap = new Map();
    }

    anyRowIdx() {
        return this.#firstCell.rowIdx;
    }

    anyColumnIdx() {
        return this.#firstCell.colIdx;
    }

    anySubgridIdx() {
        return this.#firstCell.subgridIdx;
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
            if (this.cage.isWithinSegment) {
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
            const lastNum = this.cage.value - currentSumVal;
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
        return this.cage.cells.findIndex(cell => cell.key() === cellSolver.cell.key()) !== -1;
    }
}

class Segment {
    #cagesArea;

    constructor(idx, cells, inputCages = [], cellIteratorFn) {
        this.idx = idx;
        this.cells = cells;
        this.cages = inputCages;
        this.#cagesArea = new CagesArea(this.cages);
        this.cellIteratorFn = cellIteratorFn;
    }

    determineResidualCage() {
        if (this.#cagesArea.totalValue === HOUSE_SUM && this.#cagesArea.cellsSet.size === UNIQUE_SEGMENT_LENGTH) {
            return;
        }

        const residualCageCells = [];
        this.cells.forEach(cell => {
            if (!this.#cagesArea.hasNonOverlapping(cell)) {
                residualCageCells.push(cell);
            }
        }, this);

        return new Cage(HOUSE_SUM - this.#cagesArea.totalValue, residualCageCells);
    }

    addCage(newCage) {
        this.cages.push(newCage);
        this.#cagesArea = new CagesArea(this.cages);
    }

    removeCage(cageToRemove) {
        this.cages = this.cages.filter(cage => cage !== cageToRemove);
        this.#cagesArea = new CagesArea(this.cages);
    }

    cellIterator() {
        return this.cellIteratorFn(this.idx);
    }
}

export class Row extends Segment {
    constructor(idx, cells, inputCages) {
        super(idx, cells, inputCages, Row.iteratorFor);
    }

    static iteratorFor(idx) {
        return newSegmentIterator(colIdx => {
            return { rowIdx: idx, colIdx };
        });
    }
}

export class Column extends Segment {
    constructor(idx, cells, inputCages) {
        super(idx, cells, inputCages, Column.iteratorFor);
    }

    static iteratorFor(idx) {
        return newSegmentIterator(rowIdx => {
            return { rowIdx, colIdx: idx };
        });
    }
}

export class Subgrid extends Segment {
    constructor(idx, cells, inputCages) {
        super(idx, cells, inputCages, Subgrid.iteratorFor);
    }

    static iteratorFor(idx) {
        return newSegmentIterator(i => {
            const subgridStartingRowIdx = Math.floor(idx / SUBGRID_SIDE_LENGTH) * SUBGRID_SIDE_LENGTH;
            const subgridStartingColIdx = (idx % SUBGRID_SIDE_LENGTH) * SUBGRID_SIDE_LENGTH;
            const rowIdx = subgridStartingRowIdx + Math.floor(i / SUBGRID_SIDE_LENGTH);
            const colIdx = subgridStartingColIdx + i % SUBGRID_SIDE_LENGTH;
            return { rowIdx, colIdx };
        });
    }
}

export class Solver {
    #solution;
    #placedNumbersCount;

    constructor(problem) {
        this.problem = problem;
        this.inputCages = [];
        this.inputCagesMatrix = newGridMatrix();
        this.cagesSolversMap = new Map();
        this.cellsMatrix = newGridMatrix();
        this.#solution = newGridMatrix();
        this.#placedNumbersCount = 0;

        problem.cages.forEach(cage => {
            cage.cells.forEach(cell => {
                this.inputCagesMatrix[cell.rowIdx][cell.colIdx] = cage;
                this.cellsMatrix[cell.rowIdx][cell.colIdx] = cell;
            }, this);
            this.inputCages.push(cage);
        }, this);

        this.rows = [];
        this.columns = [];
        this.subgrids = [];
        _.range(UNIQUE_SEGMENT_LENGTH).forEach(i => {
            this.rows.push(new Row(i, this.#collectSegmentCells(Row.iteratorFor(i))));
            this.columns.push(new Column(i, this.#collectSegmentCells(Column.iteratorFor(i))));
            this.subgrids.push(new Subgrid(i, this.#collectSegmentCells(Subgrid.iteratorFor(i))));
        }, this);

        this.cellSolversMatrix = newGridMatrix();
        this.problem.cells.forEach(cell => {
            this.cellSolversMatrix[cell.rowIdx][cell.colIdx] = new CellSolver({
                cell,
                row: this.rows[cell.rowIdx],
                column: this.columns[cell.colIdx],
                subgrid: this.subgrids[cell.subgridIdx]
            });
        }, this);

        problem.cages.forEach(cage => {
            this.#registerCage(cage);
        }, this);

        this.segments = [[...this.rows], [...this.columns], [...this.subgrids]].flat();
    }

    #collectSegmentCells(iterator) {
        return Array.from(iterator).map(coords => this.cellAt(coords.rowIdx, coords.colIdx), this);
    }

    solve() {
        this.#determineAndSliceResidualCagesInAdjacentNSegmentAreas();
        this.#determineAndSliceResidualCagesInSegments();
        this.#fillUpCombinationsForCagesAndMakeInitialReduce();
        this.#mainReduce();

        return this.#solution;
    }

    #determineAndSliceResidualCagesInAdjacentNSegmentAreas() {
        _.range(2, 9).reverse().forEach(n => {
            _.range(UNIQUE_SEGMENT_LENGTH - n + 1).forEach(leftIdx => {
                this.#doDetermineAndSliceResidualCagesInAdjacentNSegmentAreas(n, leftIdx, (cageSolver, rightIdxExclusive) => {
                    return cageSolver.minColIdx >= leftIdx && cageSolver.maxColIdx < rightIdxExclusive;
                }, (colIdx) => {
                    return this.columns[colIdx].cellIterator()
                });
                this.#doDetermineAndSliceResidualCagesInAdjacentNSegmentAreas(n, leftIdx, (cageSolver, rightIdxExclusive) => {
                    return cageSolver.minRowIdx >= leftIdx && cageSolver.maxRowIdx < rightIdxExclusive;
                }, (rowIdx) => {
                    return this.rows[rowIdx].cellIterator()
                });
            });
        });
    }

    #doDetermineAndSliceResidualCagesInAdjacentNSegmentAreas(n, leftIdx, withinSegmentFn, cellIteratorFn) {
        const nSegmentCellCount = n * UNIQUE_SEGMENT_COUNT;
        const nSegmentSumVal = n * HOUSE_SUM;

        const rightIdxExclusive = leftIdx + n;
        let cagesArea = new CagesArea();
        for (const cageSolver of this.cagesSolversMap.values()) {
            if (withinSegmentFn(cageSolver, rightIdxExclusive)) {
                cagesArea = new CagesArea(cagesArea.cages.concat(cageSolver.cage), nSegmentCellCount);
            }
        }
        if (cagesArea.nonOverlappingCellsSet.size > nSegmentCellCount - 6) {
            const residualCells = [];
            _.range(leftIdx, rightIdxExclusive).forEach(idx => {
                for (const { rowIdx, colIdx } of cellIteratorFn(idx)) {
                    if (!cagesArea.hasNonOverlapping(this.cellAt(rowIdx, colIdx))) {
                        residualCells.push(this.cellAt(rowIdx, colIdx));
                    }
                }
            });
            if (residualCells.length) {
                const residualCage = new Cage(nSegmentSumVal - cagesArea.totalValue, residualCells);
                if (!this.cagesSolversMap.has(residualCage.key())) {
                    this.#addAndSliceResidualCageRecursively(residualCage);                        
                }
            }
        }
    }

    #determineAndSliceResidualCagesInSegments() {
        this.segments.forEach(segment => {
            const residualCage = segment.determineResidualCage();
            if (residualCage) {
                this.#addAndSliceResidualCageRecursively(residualCage);
            }
        }, this);
    }

    #addAndSliceResidualCageRecursively(initialResidualCage) {
        let residualCages = [ initialResidualCage ];

        while (residualCages.length > 0) {
            const nextResidualCages = [];

            residualCages.forEach(residualCage => {
                if (this.cagesSolversMap.has(residualCage.key())) return;

                this.#registerCage(residualCage);

                const cagesForResidualCage = this.#getCagesFullyContainingResidualCage(residualCage);
                const cagesToUnregister = [];
                cagesForResidualCage.forEach(firstChunkCage => {
                    const secondChunkCage = this.#sliceCage(firstChunkCage, residualCage);
                    cagesToUnregister.push(firstChunkCage);
                    nextResidualCages.push(secondChunkCage);
                }, this);

                cagesToUnregister.forEach(cage => this.#unregisterCage(cage));
            });

            residualCages = nextResidualCages;
        }
    }

    #getCagesFullyContainingResidualCage(residualCage) {
        let allAssociatedCagesSet = new Set();
        residualCage.cells.forEach(cell => {
            allAssociatedCagesSet = new Set([...allAssociatedCagesSet, ...this.cellSolverOf(cell).withinCagesSet]);
        }, this);
        allAssociatedCagesSet.delete(residualCage);

        const result = [];
        for (const associatedCage of allAssociatedCagesSet.values()) {
            const associatedCageFullyContainsResidualCage = residualCage.cells.every(cell => {
                return this.cellSolverOf(cell).withinCagesSet.has(associatedCage);
            }, this);
            if (associatedCageFullyContainsResidualCage) {
                result.push(associatedCage);
            }
        }

        return result;
    }

    #sliceCage(cageToSlice, firstChunkCage) {
        const secondChunkCageCells = [];
        cageToSlice.cells.forEach(cell => {
            if (!firstChunkCage.has(cell)) {
                secondChunkCageCells.push(cell);
            }
        });
        return new Cage(cageToSlice.value - firstChunkCage.value, secondChunkCageCells);
    }

    #fillUpCombinationsForCagesAndMakeInitialReduce() {
        this.segments.forEach(segment => {
            const combosForSegment = findSumCombinationsForSegment(segment);
            segment.debugCombosForSegment = combosForSegment;
            segment.cages.forEach((cage, idx) => {
                const cageSolver = this.cagesSolversMap.get(cage.key());
                const combosKeySet = new Set();
                const combos = [];
                combosForSegment.forEach(combo => {
                    const comboSet = combo[idx];
                    const key = Array.from(combo[idx]).join();
                    if (!combosKeySet.has(key)) {
                        combos.push(comboSet);
                        combosKeySet.add(key);
                    }
                });
                cageSolver.updateCombinations(combos);
            }, this);
        }, this);
    }

    #mainReduce() {
        let cageSolversIterable = this.cagesSolversMap.values();
        let iterate = true;
        let newlySolvedCellDets = [];

        while (iterate) {
            if (this.#placedNumbersCount >= 81) {
                return;
            }
    
            this.#reduceCages(cageSolversIterable);
    
            const solvedCellDets = this.#determineCellsWithSingleOption();
            let nextCagesSet = this.#reduceSegmentsBySolvedCells(solvedCellDets);

            newlySolvedCellDets = newlySolvedCellDets.concat(Array.from(solvedCellDets));

            if (nextCagesSet.size > 0) {
                cageSolversIterable = nextCagesSet.values();
            } else if (newlySolvedCellDets.length > 0) {
                newlySolvedCellDets.forEach(cellSolver => {
                    const withinCagesSet = cellSolver.withinCagesSet;
                    if (!(withinCagesSet.size === 1 && withinCagesSet.values().next().value.isSingleCellCage)) {
                        const firstChunkCage = Cage.of(cellSolver.placedNumber).cell(cellSolver.cell.rowIdx, cellSolver.cell.colIdx).mk();
                        this.#addAndSliceResidualCageRecursively(firstChunkCage);
                    }
                });
                newlySolvedCellDets = [];
                nextCagesSet = new Set(this.cagesSolversMap.values());
                cageSolversIterable = nextCagesSet.values();
            }
            else {
                nextCagesSet = this.#determineUniqueCagesInSegments();
                cageSolversIterable = nextCagesSet.values();
            }

            iterate = nextCagesSet.size > 0;
        }
    }

    #reduceCages(cageSolversIterable) {
        let iterate = true;

        while (iterate) {
            let modifiedCellDets = new Set();

            for (const cageSolver of cageSolversIterable) {
                const currentlyModifiedCellDets = cageSolver.reduce();
                modifiedCellDets = new Set([...modifiedCellDets, ...currentlyModifiedCellDets]);
            }

            let moreCagesToReduce = new Set();
            for (const modifiedCellDet of modifiedCellDets.values()) {
                moreCagesToReduce = new Set([...moreCagesToReduce, ...modifiedCellDet.withinCagesSet]);
            }

            const nextCageSolversToReduce = new Set(Array.from(moreCagesToReduce).map(cage => this.cagesSolversMap.get(cage.key())));
            cageSolversIterable = nextCageSolversToReduce.values();
            iterate = nextCageSolversToReduce.size > 0;
        }
    }

    #reduceSegmentsBySolvedCells(cellsSolvers) {
        let cagesToReduceSet = new Set();
        cellsSolvers.forEach(cellSolver => {
            const number = cellSolver.placedNumber;
            [
                this.rows[cellSolver.cell.rowIdx],
                this.columns[cellSolver.cell.colIdx],
                this.subgrids[cellSolver.cell.subgridIdx]
            ].forEach(segment => {
                for (const { rowIdx, colIdx } of segment.cellIterator()) {
                    if (rowIdx === cellSolver.cell.rowIdx && colIdx === cellSolver.cell.colIdx) continue;
        
                    const aCellDet = this.cellSolverAt(rowIdx, colIdx);
                    if (aCellDet.hasNumOpt(number)) {
                        aCellDet.deleteNumOpt(number);
                        cagesToReduceSet = new Set([...cagesToReduceSet, ...aCellDet.withinCagesSet]);
                    }
                }    
            });
        });
        return new Set(Array.from(cagesToReduceSet).map(cage => this.cagesSolversMap.get(cage.key())));
    }

    #determineUniqueCagesInSegments() {
        let cagesToReduce = new Set();

        this.segments.forEach(segment => {
            _.range(1, UNIQUE_SEGMENT_LENGTH + 1).forEach(num => {
                const cageSolversWithNum = [];
                // consider overlapping vs non-overlapping cages
                segment.cages.forEach(cage => {
                    if (cage.isSingleCellCage) return;
                    const cageSolver = this.cagesSolversMap.get(cage.key());
                    const hasNumInCells = cageSolver.cellSolvers.some(cellSolver => cellSolver.hasNumOpt(num));
                    if (hasNumInCells) {
                        cageSolversWithNum.push(cageSolver);
                    }
                });
                if (cageSolversWithNum.length !== 1) return;

                const cageSolverToReDefine = cageSolversWithNum[0];
                const reducedCellDets = cageSolverToReDefine.reduceToCombinationsContaining(num);
                
                if (!reducedCellDets.length) return;
                reducedCellDets.forEach(cellSolver => {
                    cagesToReduce = new Set([...cagesToReduce, ...cellSolver.withinCagesSet]);
                });

                // remove number from other cells
                const furtherReducedCellDets = new Set();
                for (const { rowIdx, colIdx } of segment.cellIterator()) {
                    const cellSolver = this.cellSolverAt(rowIdx, colIdx);
                    if (cageSolverToReDefine.has(cellSolver)) return;

                    if (cellSolver.hasNumOpt(num)) {
                        cellSolver.deleteNumOpt(num);
                        furtherReducedCellDets.add(cellSolver);
                    }
                }
                furtherReducedCellDets.forEach(cellSolver => {
                    cagesToReduce = new Set([...cagesToReduce, ...cellSolver.withinCagesSet]);
                });
            });
        });

        return new Set(Array.from(cagesToReduce).map(cage => this.cagesSolversMap.get(cage.key())));
    }

    #determineCellsWithSingleOption() {
        const cellsSolvers = [];

        _.range(UNIQUE_SEGMENT_LENGTH).forEach(rowIdx => {
            _.range(UNIQUE_SEGMENT_LENGTH).forEach(colIdx => {
                const cellSolver = this.cellSolverAt(rowIdx, colIdx);
                if (cellSolver.numOpts().size === 1 && !cellSolver.solved) {
                    this.#placeNumber(cellSolver.cell, cellSolver.numOpts().values().next().value);
                    cellsSolvers.push(cellSolver);
                }
            });
        });

        return cellsSolvers;
    }

    #placeNumber(cell, number) {
        const cellSolver = this.cellSolverOf(cell);
        cellSolver.placeNumber(number);

        this.#solution[cell.rowIdx][cell.colIdx] = number;
        this.#placedNumbersCount++;
    }

    #registerCage(cage) {
        const cageSolver = new CageSolver(cage, cage.cells.map(cell => this.cellSolverOf(cell), this));
        if (cage.isWithinRow) {
            this.rows[cageSolver.anyRowIdx()].addCage(cage);
        }
        if (cage.isWithinColumn) {
            this.columns[cageSolver.anyColumnIdx()].addCage(cage);
        }
        if (cage.isWithinSubgrid) {
            this.subgrids[cageSolver.anySubgridIdx()].addCage(cage);
        }
        cage.cells.forEach(cell => {
            this.cellSolverOf(cell).addWithinCage(cage);
        }, this);
        this.cagesSolversMap.set(cage.key(), cageSolver);
    }

    #unregisterCage(cage) {
        const cageSolver = this.cagesSolversMap.get(cage.key());
        if (cage.isWithinRow) {
            this.rows[cageSolver.anyRowIdx()].removeCage(cage);
        }
        if (cage.isWithinColumn) {
            this.columns[cageSolver.anyColumnIdx()].removeCage(cage);
        }
        if (cage.isWithinSubgrid) {
            this.subgrids[cageSolver.anySubgridIdx()].removeCage(cage);
        }
        cage.cells.forEach(cell => {
            this.cellSolverOf(cell).removeWithinCage(cage);
        }, this);
        this.cagesSolversMap.delete(cage.key());
    }

    inputCageAt(rowIdx, colIdx) {
        return this.inputCagesMatrix[rowIdx][colIdx];
    }

    cellAt(rowIds, colIdx) {
        return this.cellsMatrix[rowIds][colIdx];
    }

    cellSolverOf(cell) {
        return this.cellSolverAt(cell.rowIdx, cell.colIdx);
    }

    cellSolverAt(rowIdx, colIdx) {
        return this.cellSolversMatrix[rowIdx][colIdx];
    }

    row(idx) {
        return this.rows[idx];
    }

    column(idx) {
        return this.columns[idx];
    }

    subgrid(idx) {
        return this.subgrids[idx];
    }
}
