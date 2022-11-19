import _ from 'lodash';
import { newGridMatrix } from '../util/matrix';
import { UNIQUE_SEGMENT_LENGTH, SUBGRID_SIDE_LENGTH, UNIQUE_SEGMENT_SUM, UNIQUE_SEGMENT_COUNT } from '../problem/constants';
import { Cage } from '../problem/cage';
import { clusterSumsByOverlap, findSumCombinationsForSegment } from './combinatorial';

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
        this.withinSumsSet = new Set();
        this.solved = false;

        this.#numOpts = new Set(_.range(UNIQUE_SEGMENT_LENGTH).map(i => i + 1));
        this.placedNumber = undefined;
    }

    addWithinSum(withinSum) {
        this.withinSumsSet.add(withinSum);
    }

    removeWithinSum(withinSum) {
        this.withinSumsSet.delete(withinSum);
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

class SumsArea {
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

        const { nonOverlappingSums } = clusterSumsByOverlap(cages, new Set(this.cellsSet), absMaxAreaCellCount);
        nonOverlappingSums.forEach(cage => {
            this.totalValue += cage.value;
            cage.cells.forEach(cell => this.nonOverlappingCellsSet.add(cell));
        });
    }

    has(cell) {
        return this.cellsSet.has(cell);
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

    constructor(idx, cells, inputSums = [], cellIteratorFn) {
        this.idx = idx;
        this.cells = cells;
        this.cages = inputSums;
        this.#cagesArea = new SumsArea(this.cages);
        this.cellIteratorFn = cellIteratorFn;
    }

    determineResidualSum() {
        if (this.#cagesArea.totalValue === UNIQUE_SEGMENT_SUM && this.#cagesArea.cellsSet.size === UNIQUE_SEGMENT_LENGTH) {
            return;
        }

        const residualSumCells = [];
        this.cells.forEach(cell => {
            if (!this.#cagesArea.hasNonOverlapping(cell)) {
                residualSumCells.push(cell);
            }
        }, this);

        return new Cage(UNIQUE_SEGMENT_SUM - this.#cagesArea.totalValue, residualSumCells);
    }

    addSum(newSum) {
        this.cages.push(newSum);
        this.#cagesArea = new SumsArea(this.cages);
    }

    removeSum(cageToRemove) {
        this.cages = this.cages.filter(cage => cage !== cageToRemove);
        this.#cagesArea = new SumsArea(this.cages);
    }

    cellIterator() {
        return this.cellIteratorFn(this.idx);
    }
}

export class Row extends Segment {
    constructor(idx, cells, inputSums) {
        super(idx, cells, inputSums, Row.iteratorFor);
    }

    static iteratorFor(idx) {
        return newSegmentIterator(colIdx => {
            return { rowIdx: idx, colIdx };
        });
    }
}

export class Column extends Segment {
    constructor(idx, cells, inputSums) {
        super(idx, cells, inputSums, Column.iteratorFor);
    }

    static iteratorFor(idx) {
        return newSegmentIterator(rowIdx => {
            return { rowIdx, colIdx: idx };
        });
    }
}

export class Subgrid extends Segment {
    constructor(idx, cells, inputSums) {
        super(idx, cells, inputSums, Subgrid.iteratorFor);
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
        this.inputSums = [];
        this.inputSumsMatrix = newGridMatrix();
        this.cagesSolversMap = new Map();
        this.cellsMatrix = newGridMatrix();
        this.#solution = newGridMatrix();
        this.#placedNumbersCount = 0;

        problem.cages.forEach(cage => {
            cage.cells.forEach(cell => {
                this.inputSumsMatrix[cell.rowIdx][cell.colIdx] = cage;
                this.cellsMatrix[cell.rowIdx][cell.colIdx] = cell;
            }, this);
            this.inputSums.push(cage);
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
            this.#registerSum(cage);
        }, this);

        this.segments = [[...this.rows], [...this.columns], [...this.subgrids]].flat();
    }

    #collectSegmentCells(iterator) {
        return Array.from(iterator).map(coords => this.cellAt(coords.rowIdx, coords.colIdx), this);
    }

    solve() {
        this.#determineAndSliceResidualSumsInAdjacentNSegmentAreas();
        this.#determineAndSliceResidualSumsInSegments();
        this.#fillUpCombinationsForSumsAndMakeInitialReduce();
        this.#mainReduce();

        return this.#solution;
    }

    #determineAndSliceResidualSumsInAdjacentNSegmentAreas() {
        _.range(2, 9).reverse().forEach(n => {
            _.range(UNIQUE_SEGMENT_LENGTH - n + 1).forEach(leftIdx => {
                this.#doDetermineAndSliceResidualSumsInAdjacentNSegmentAreas(n, leftIdx, (cageSolver, rightIdxExclusive) => {
                    return cageSolver.minColIdx >= leftIdx && cageSolver.maxColIdx < rightIdxExclusive;
                }, (colIdx) => {
                    return this.columns[colIdx].cellIterator()
                });
                this.#doDetermineAndSliceResidualSumsInAdjacentNSegmentAreas(n, leftIdx, (cageSolver, rightIdxExclusive) => {
                    return cageSolver.minRowIdx >= leftIdx && cageSolver.maxRowIdx < rightIdxExclusive;
                }, (rowIdx) => {
                    return this.rows[rowIdx].cellIterator()
                });
            });
        });
    }

    #doDetermineAndSliceResidualSumsInAdjacentNSegmentAreas(n, leftIdx, withinSegmentFn, cellIteratorFn) {
        const nSegmentCellCount = n * UNIQUE_SEGMENT_COUNT;
        const nSegmentSumVal = n * UNIQUE_SEGMENT_SUM;

        const rightIdxExclusive = leftIdx + n;
        let cagesArea = new SumsArea();
        for (const cageSolver of this.cagesSolversMap.values()) {
            if (withinSegmentFn(cageSolver, rightIdxExclusive)) {
                cagesArea = new SumsArea(cagesArea.cages.concat(cageSolver.cage), nSegmentCellCount);
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
                const residualSum = new Cage(nSegmentSumVal - cagesArea.totalValue, residualCells);
                if (!this.cagesSolversMap.has(residualSum.key())) {
                    this.#addAndSliceResidualSumRecursively(residualSum);                        
                }
            }
        }
    }

    #determineAndSliceResidualSumsInSegments() {
        this.segments.forEach(segment => {
            const residualSum = segment.determineResidualSum();
            if (residualSum) {
                this.#addAndSliceResidualSumRecursively(residualSum);
            }
        }, this);
    }

    #addAndSliceResidualSumRecursively(initialResidualSum) {
        let residualSums = [ initialResidualSum ];

        while (residualSums.length > 0) {
            const nextResidualSums = [];

            residualSums.forEach(residualSum => {
                if (this.cagesSolversMap.has(residualSum.key())) return;

                this.#registerSum(residualSum);

                const cagesForResidualSum = this.#getSumsFullyContainingResidualSum(residualSum);
                const cagesToUnregister = [];
                cagesForResidualSum.forEach(firstChunkSum => {
                    const secondChunkSum = this.#sliceSum(firstChunkSum, residualSum);
                    cagesToUnregister.push(firstChunkSum);
                    nextResidualSums.push(secondChunkSum);
                }, this);

                cagesToUnregister.forEach(cage => this.#unregisterSum(cage));
            });

            residualSums = nextResidualSums;
        }
    }

    #getSumsFullyContainingResidualSum(residualSum) {
        let allAssociatedSumsSet = new Set();
        residualSum.cells.forEach(cell => {
            allAssociatedSumsSet = new Set([...allAssociatedSumsSet, ...this.cellSolverOf(cell).withinSumsSet]);
        }, this);
        allAssociatedSumsSet.delete(residualSum);

        const result = [];
        for (const associatedSum of allAssociatedSumsSet.values()) {
            const associatedSumFullyContainsResidualSum = residualSum.cells.every(cell => {
                return this.cellSolverOf(cell).withinSumsSet.has(associatedSum);
            }, this);
            if (associatedSumFullyContainsResidualSum) {
                result.push(associatedSum);
            }
        }

        return result;
    }

    #sliceSum(cageToSlice, firstChunkSum) {
        const secondChunkSumCells = [];
        cageToSlice.cells.forEach(cell => {
            if (!firstChunkSum.has(cell)) {
                secondChunkSumCells.push(cell);
            }
        });
        return new Cage(cageToSlice.value - firstChunkSum.value, secondChunkSumCells);
    }

    #fillUpCombinationsForSumsAndMakeInitialReduce() {
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
    
            this.#reduceSums(cageSolversIterable);
    
            const solvedCellDets = this.#determineCellsWithSingleOption();
            let nextSumsSet = this.#reduceSegmentsBySolvedCells(solvedCellDets);

            newlySolvedCellDets = newlySolvedCellDets.concat(Array.from(solvedCellDets));

            if (nextSumsSet.size > 0) {
                cageSolversIterable = nextSumsSet.values();
            } else if (newlySolvedCellDets.length > 0) {
                newlySolvedCellDets.forEach(cellSolver => {
                    const withinSumsSet = cellSolver.withinSumsSet;
                    if (!(withinSumsSet.size === 1 && withinSumsSet.values().next().value.isSingleCellSum)) {
                        const firstChunkSum = Cage.of(cellSolver.placedNumber).cell(cellSolver.cell.rowIdx, cellSolver.cell.colIdx).mk();
                        this.#addAndSliceResidualSumRecursively(firstChunkSum);
                    }
                });
                newlySolvedCellDets = [];
                nextSumsSet = new Set(this.cagesSolversMap.values());
                cageSolversIterable = nextSumsSet.values();
            }
            else {
                nextSumsSet = this.#determineUniqueSumsInSegments();
                cageSolversIterable = nextSumsSet.values();
            }

            iterate = nextSumsSet.size > 0;
        }
    }

    #reduceSums(cageSolversIterable) {
        let iterate = true;

        while (iterate) {
            let modifiedCellDets = new Set();

            for (const cageSolver of cageSolversIterable) {
                const currentlyModifiedCellDets = cageSolver.reduce();
                modifiedCellDets = new Set([...modifiedCellDets, ...currentlyModifiedCellDets]);
            }

            let moreSumsToReduce = new Set();
            for (const modifiedCellDet of modifiedCellDets.values()) {
                moreSumsToReduce = new Set([...moreSumsToReduce, ...modifiedCellDet.withinSumsSet]);
            }

            const nextSumDetsToReduce = new Set(Array.from(moreSumsToReduce).map(cage => this.cagesSolversMap.get(cage.key())));
            cageSolversIterable = nextSumDetsToReduce.values();
            iterate = nextSumDetsToReduce.size > 0;
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
                        cagesToReduceSet = new Set([...cagesToReduceSet, ...aCellDet.withinSumsSet]);
                    }
                }    
            });
        });
        return new Set(Array.from(cagesToReduceSet).map(cage => this.cagesSolversMap.get(cage.key())));
    }

    #determineUniqueSumsInSegments() {
        let cagesToReduce = new Set();

        this.segments.forEach(segment => {
            _.range(1, UNIQUE_SEGMENT_LENGTH + 1).forEach(num => {
                const cageSolversWithNum = [];
                // consider overlapping vs non-overlapping cages
                segment.cages.forEach(cage => {
                    if (cage.isSingleCellSum) return;
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
                    cagesToReduce = new Set([...cagesToReduce, ...cellSolver.withinSumsSet]);
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
                    cagesToReduce = new Set([...cagesToReduce, ...cellSolver.withinSumsSet]);
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

    #registerSum(cage) {
        const cageSolver = new CageSolver(cage, cage.cells.map(cell => this.cellSolverOf(cell), this));
        if (cage.isWithinRow) {
            this.rows[cageSolver.anyRowIdx()].addSum(cage);
        }
        if (cage.isWithinColumn) {
            this.columns[cageSolver.anyColumnIdx()].addSum(cage);
        }
        if (cage.isWithinSubgrid) {
            this.subgrids[cageSolver.anySubgridIdx()].addSum(cage);
        }
        cage.cells.forEach(cell => {
            this.cellSolverOf(cell).addWithinSum(cage);
        }, this);
        this.cagesSolversMap.set(cage.key(), cageSolver);
    }

    #unregisterSum(cage) {
        const cageSolver = this.cagesSolversMap.get(cage.key());
        if (cage.isWithinRow) {
            this.rows[cageSolver.anyRowIdx()].removeSum(cage);
        }
        if (cage.isWithinColumn) {
            this.columns[cageSolver.anyColumnIdx()].removeSum(cage);
        }
        if (cage.isWithinSubgrid) {
            this.subgrids[cageSolver.anySubgridIdx()].removeSum(cage);
        }
        cage.cells.forEach(cell => {
            this.cellSolverOf(cell).removeWithinSum(cage);
        }, this);
        this.cagesSolversMap.delete(cage.key());
    }

    inputSumAt(rowIdx, colIdx) {
        return this.inputSumsMatrix[rowIdx][colIdx];
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
