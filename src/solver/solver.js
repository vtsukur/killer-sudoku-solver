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

        this.cellSolvers.forEach(cellDeterminator => cellDeterminator.reduceNumberOptions(numOpts));
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
            cellDets: this.cellSolvers,
            processedCellDets: new Set(),
            remainingCellDets: new Set(this.cellSolvers),
            processedNumbers: new Set(),
            numbersStack: new Array(this.#cellCount),
            cellsDetsStack: new Array(this.#cellCount),
            processCell: function(cellDet, step, fn) {
                if (this.processedCellDets.has(cellDet)) return;
                this.processedCellDets.add(cellDet); this.remainingCellDets.delete(cellDet);
                this.cellsDetsStack[step] = cellDet;
                const retVal = fn();
                this.cellsDetsStack[step] = undefined;
                this.processedCellDets.delete(cellDet); this.remainingCellDets.add(cellDet);    
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
        this.cellSolvers.forEach(cellDet => {
            context.processCell(cellDet, 0, () => {
                Array.from(cellDet.numOpts()).forEach(num => {
                    context.processNumber(num, 0, () => {
                        if (!this.#hasSumMatchingPermutationsRecursive(num, 1, context)) {
                            // move to modification after looping
                            cellDet.deleteNumOpt(num);
                            modifiedCellDets.push(cellDet);
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
            this.cellSolvers.forEach(cellDet => {
                context.processCell(cellDet, step, () => {
                    Array.from(cellDet.numOpts()).forEach(num => {
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
            this.cellSolvers.forEach(cellDet => {
                if (cellDet.reduceNumberOptions(newNumOptions).size > 0) {
                    reducedCellDets.push(cellDet);
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

    has(cellDet) {
        return this.cage.cells.findIndex(cell => cell.key() === cellDet.cell.key()) !== -1;
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
        this.cagesDeterminatorsMap = new Map();
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
                this.#doDetermineAndSliceResidualSumsInAdjacentNSegmentAreas(n, leftIdx, (cageDet, rightIdxExclusive) => {
                    return cageDet.minColIdx >= leftIdx && cageDet.maxColIdx < rightIdxExclusive;
                }, (colIdx) => {
                    return this.columns[colIdx].cellIterator()
                });
                this.#doDetermineAndSliceResidualSumsInAdjacentNSegmentAreas(n, leftIdx, (cageDet, rightIdxExclusive) => {
                    return cageDet.minRowIdx >= leftIdx && cageDet.maxRowIdx < rightIdxExclusive;
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
        for (const cageDet of this.cagesDeterminatorsMap.values()) {
            if (withinSegmentFn(cageDet, rightIdxExclusive)) {
                cagesArea = new SumsArea(cagesArea.cages.concat(cageDet.cage), nSegmentCellCount);
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
                if (!this.cagesDeterminatorsMap.has(residualSum.key())) {
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
                if (this.cagesDeterminatorsMap.has(residualSum.key())) return;

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
            allAssociatedSumsSet = new Set([...allAssociatedSumsSet, ...this.cellDeterminatorOf(cell).withinSumsSet]);
        }, this);
        allAssociatedSumsSet.delete(residualSum);

        const result = [];
        for (const associatedSum of allAssociatedSumsSet.values()) {
            const associatedSumFullyContainsResidualSum = residualSum.cells.every(cell => {
                return this.cellDeterminatorOf(cell).withinSumsSet.has(associatedSum);
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
                const cageDeterminator = this.cagesDeterminatorsMap.get(cage.key());
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
                cageDeterminator.updateCombinations(combos);
            }, this);
        }, this);
    }

    #mainReduce() {
        let cageDetsIterable = this.cagesDeterminatorsMap.values();
        let iterate = true;
        let newlySolvedCellDets = [];

        while (iterate) {
            if (this.#placedNumbersCount >= 81) {
                return;
            }
    
            this.#reduceSums(cageDetsIterable);
    
            const solvedCellDets = this.#determineCellsWithSingleOption();
            let nextSumsSet = this.#reduceSegmentsBySolvedCells(solvedCellDets);

            newlySolvedCellDets = newlySolvedCellDets.concat(Array.from(solvedCellDets));

            if (nextSumsSet.size > 0) {
                cageDetsIterable = nextSumsSet.values();
            } else if (newlySolvedCellDets.length > 0) {
                newlySolvedCellDets.forEach(cellDet => {
                    const withinSumsSet = cellDet.withinSumsSet;
                    if (!(withinSumsSet.size === 1 && withinSumsSet.values().next().value.isSingleCellSum)) {
                        const firstChunkSum = Cage.of(cellDet.placedNumber).cell(cellDet.cell.rowIdx, cellDet.cell.colIdx).mk();
                        this.#addAndSliceResidualSumRecursively(firstChunkSum);
                    }
                });
                newlySolvedCellDets = [];
                nextSumsSet = new Set(this.cagesDeterminatorsMap.values());
                cageDetsIterable = nextSumsSet.values();
            }
            else {
                nextSumsSet = this.#determineUniqueSumsInSegments();
                cageDetsIterable = nextSumsSet.values();
            }

            iterate = nextSumsSet.size > 0;
        }
    }

    #reduceSums(cageDetsIterable) {
        let iterate = true;

        while (iterate) {
            let modifiedCellDets = new Set();

            for (const cageDeterminator of cageDetsIterable) {
                const currentlyModifiedCellDets = cageDeterminator.reduce();
                modifiedCellDets = new Set([...modifiedCellDets, ...currentlyModifiedCellDets]);
            }

            let moreSumsToReduce = new Set();
            for (const modifiedCellDet of modifiedCellDets.values()) {
                moreSumsToReduce = new Set([...moreSumsToReduce, ...modifiedCellDet.withinSumsSet]);
            }

            const nextSumDetsToReduce = new Set(Array.from(moreSumsToReduce).map(cage => this.cagesDeterminatorsMap.get(cage.key())));
            cageDetsIterable = nextSumDetsToReduce.values();
            iterate = nextSumDetsToReduce.size > 0;
        }
    }

    #reduceSegmentsBySolvedCells(cellDets) {
        let cagesToReduceSet = new Set();
        cellDets.forEach(cellDet => {
            const number = cellDet.placedNumber;
            [
                this.rows[cellDet.cell.rowIdx],
                this.columns[cellDet.cell.colIdx],
                this.subgrids[cellDet.cell.subgridIdx]
            ].forEach(segment => {
                for (const { rowIdx, colIdx } of segment.cellIterator()) {
                    if (rowIdx === cellDet.cell.rowIdx && colIdx === cellDet.cell.colIdx) continue;
        
                    const aCellDet = this.cellDeterminatorAt(rowIdx, colIdx);
                    if (aCellDet.hasNumOpt(number)) {
                        aCellDet.deleteNumOpt(number);
                        cagesToReduceSet = new Set([...cagesToReduceSet, ...aCellDet.withinSumsSet]);
                    }
                }    
            });
        });
        return new Set(Array.from(cagesToReduceSet).map(cage => this.cagesDeterminatorsMap.get(cage.key())));
    }

    #determineUniqueSumsInSegments() {
        let cagesToReduce = new Set();

        this.segments.forEach(segment => {
            _.range(1, UNIQUE_SEGMENT_LENGTH + 1).forEach(num => {
                const cageDetsWithNum = [];
                // consider overlapping vs non-overlapping cages
                segment.cages.forEach(cage => {
                    if (cage.isSingleCellSum) return;
                    const cageDet = this.cagesDeterminatorsMap.get(cage.key());
                    const hasNumInCells = cageDet.cellSolvers.some(cellDet => cellDet.hasNumOpt(num));
                    if (hasNumInCells) {
                        cageDetsWithNum.push(cageDet);
                    }
                });
                if (cageDetsWithNum.length !== 1) return;

                const cageDetToReDefine = cageDetsWithNum[0];
                const reducedCellDets = cageDetToReDefine.reduceToCombinationsContaining(num);
                
                if (!reducedCellDets.length) return;
                reducedCellDets.forEach(cellDet => {
                    cagesToReduce = new Set([...cagesToReduce, ...cellDet.withinSumsSet]);
                });

                // remove number from other cells
                const furtherReducedCellDets = new Set();
                for (const { rowIdx, colIdx } of segment.cellIterator()) {
                    const cellDet = this.cellDeterminatorAt(rowIdx, colIdx);
                    if (cageDetToReDefine.has(cellDet)) return;

                    if (cellDet.hasNumOpt(num)) {
                        cellDet.deleteNumOpt(num);
                        furtherReducedCellDets.add(cellDet);
                    }
                }
                furtherReducedCellDets.forEach(cellDet => {
                    cagesToReduce = new Set([...cagesToReduce, ...cellDet.withinSumsSet]);
                });
            });
        });

        return new Set(Array.from(cagesToReduce).map(cage => this.cagesDeterminatorsMap.get(cage.key())));
    }

    #determineCellsWithSingleOption() {
        const cellDets = [];

        _.range(UNIQUE_SEGMENT_LENGTH).forEach(rowIdx => {
            _.range(UNIQUE_SEGMENT_LENGTH).forEach(colIdx => {
                const cellDet = this.cellDeterminatorAt(rowIdx, colIdx);
                if (cellDet.numOpts().size === 1 && !cellDet.solved) {
                    this.#placeNumber(cellDet.cell, cellDet.numOpts().values().next().value);
                    cellDets.push(cellDet);
                }
            });
        });

        return cellDets;
    }

    #placeNumber(cell, number) {
        const cellDeterminator = this.cellDeterminatorOf(cell);
        cellDeterminator.placeNumber(number);

        this.#solution[cell.rowIdx][cell.colIdx] = number;
        this.#placedNumbersCount++;
    }

    #registerSum(cage) {
        const cageDeterminator = new CageSolver(cage, cage.cells.map(cell => this.cellDeterminatorOf(cell), this));
        if (cage.isWithinRow) {
            this.rows[cageDeterminator.anyRowIdx()].addSum(cage);
        }
        if (cage.isWithinColumn) {
            this.columns[cageDeterminator.anyColumnIdx()].addSum(cage);
        }
        if (cage.isWithinSubgrid) {
            this.subgrids[cageDeterminator.anySubgridIdx()].addSum(cage);
        }
        cage.cells.forEach(cell => {
            this.cellDeterminatorOf(cell).addWithinSum(cage);
        }, this);
        this.cagesDeterminatorsMap.set(cage.key(), cageDeterminator);
    }

    #unregisterSum(cage) {
        const cageDeterminator = this.cagesDeterminatorsMap.get(cage.key());
        if (cage.isWithinRow) {
            this.rows[cageDeterminator.anyRowIdx()].removeSum(cage);
        }
        if (cage.isWithinColumn) {
            this.columns[cageDeterminator.anyColumnIdx()].removeSum(cage);
        }
        if (cage.isWithinSubgrid) {
            this.subgrids[cageDeterminator.anySubgridIdx()].removeSum(cage);
        }
        cage.cells.forEach(cell => {
            this.cellDeterminatorOf(cell).removeWithinSum(cage);
        }, this);
        this.cagesDeterminatorsMap.delete(cage.key());
    }

    inputSumAt(rowIdx, colIdx) {
        return this.inputSumsMatrix[rowIdx][colIdx];
    }

    cellAt(rowIds, colIdx) {
        return this.cellsMatrix[rowIds][colIdx];
    }

    cellDeterminatorOf(cell) {
        return this.cellDeterminatorAt(cell.rowIdx, cell.colIdx);
    }

    cellDeterminatorAt(rowIdx, colIdx) {
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
