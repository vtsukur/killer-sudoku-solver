import _ from 'lodash';
import { newGridMatrix } from './matrix';
import { UNIQUE_SEGMENT_LENGTH, SUBGRID_SIDE_LENGTH, UNIQUE_SEGMENT_SUM, Sum, UNIQUE_SEGMENT_COUNT, Cell } from './problem';
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

export class CellDeterminator {
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
    constructor(sums = [], absMaxAreaCellCount = UNIQUE_SEGMENT_COUNT) {
        this.sums = sums;
        this.cellsSet = new Set();
        this.nonOverlappingCellsSet = new Set();
        this.totalValue = 0;
        sums.forEach(sum => {
            sum.cells.forEach(cell => {
                this.cellsSet.add(cell);
            }, this);
        }, this);

        const { nonOverlappingSums } = clusterSumsByOverlap(sums, new Set(this.cellsSet), absMaxAreaCellCount);
        nonOverlappingSums.forEach(sum => {
            this.totalValue += sum.value;
            sum.cells.forEach(cell => this.nonOverlappingCellsSet.add(cell));
        });
    }

    has(cell) {
        return this.cellsSet.has(cell);
    }

    hasNonOverlapping(cell) {
        return this.nonOverlappingCellsSet.has(cell);
    }
}

class SumDeterminator {
    #firstCell;
    #cellCount;
    #combosMap;

    constructor(sum, cellsDeterminators) {
        this.sum = sum;
        this.#firstCell = sum.cells[0];
        this.cellsDeterminators = cellsDeterminators;
        this.minRowIdx = UNIQUE_SEGMENT_LENGTH + 1;
        this.minColIdx = this.minRowIdx;
        this.maxRowIdx = 0;
        this.maxColIdx = this.maxRowIdx;
        sum.cells.forEach(cell => {
            this.minRowIdx = Math.min(this.minRowIdx, cell.rowIdx);
            this.maxRowIdx = Math.max(this.maxRowIdx, cell.rowIdx);
            this.minColIdx = Math.min(this.minColIdx, cell.colIdx);
            this.maxColIdx = Math.max(this.maxColIdx, cell.colIdx);
        });
        this.#cellCount = sum.cellCount;
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

        this.cellsDeterminators.forEach(cellDeterminator => cellDeterminator.reduceNumberOptions(numOpts));
    }

    reduce() {
        if (this.#cellCount > 1 && this.#cellCount < 6) {
            if (this.sum.isWithinSegment) {
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
            cellDets: this.cellsDeterminators,
            processedCellDets: new Set(),
            remainingCellDets: new Set(this.cellsDeterminators),
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
        this.cellsDeterminators.forEach(cellDet => {
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
            const lastNum = this.sum.value - currentSumVal;
            if (context.processedNumbers.has(lastNum)) return false;
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
            this.cellsDeterminators.forEach(cellDet => {
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
            this.cellsDeterminators.forEach(cellDet => {
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
        return this.sum.cells.findIndex(cell => cell.key() === cellDet.cell.key()) !== -1;
    }
}

class Segment {
    #sumsArea;

    constructor(idx, cells, inputSums = [], cellIteratorFn) {
        this.idx = idx;
        this.cells = cells;
        this.sums = inputSums;
        this.#sumsArea = new SumsArea(this.sums);
        this.cellIteratorFn = cellIteratorFn;
    }

    determineResidualSum() {
        if (this.#sumsArea.totalValue === UNIQUE_SEGMENT_SUM && this.#sumsArea.cellsSet.size === UNIQUE_SEGMENT_LENGTH) {
            return;
        }

        const residualSumCells = [];
        this.cells.forEach(cell => {
            if (!this.#sumsArea.hasNonOverlapping(cell)) {
                residualSumCells.push(cell);
            }
        }, this);

        return new Sum(UNIQUE_SEGMENT_SUM - this.#sumsArea.totalValue, residualSumCells);
    }

    addSum(newSum) {
        this.sums.push(newSum);
        this.#sumsArea = new SumsArea(this.sums);
    }

    removeSum(sumToRemove) {
        this.sums = this.sums.filter(sum => sum !== sumToRemove);
        this.#sumsArea = new SumsArea(this.sums);
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
        this.sumsDeterminatorsMap = new Map();
        this.cellsMatrix = newGridMatrix();
        this.#solution = newGridMatrix();
        this.#placedNumbersCount = 0;

        problem.sums.forEach(sum => {
            sum.cells.forEach(cell => {
                this.inputSumsMatrix[cell.rowIdx][cell.colIdx] = sum;
                this.cellsMatrix[cell.rowIdx][cell.colIdx] = cell;
            }, this);
            this.inputSums.push(sum);
        }, this);

        this.rows = [];
        this.columns = [];
        this.subgrids = [];
        _.range(UNIQUE_SEGMENT_LENGTH).forEach(i => {
            this.rows.push(new Row(i, this.#collectSegmentCells(Row.iteratorFor(i))));
            this.columns.push(new Column(i, this.#collectSegmentCells(Column.iteratorFor(i))));
            this.subgrids.push(new Subgrid(i, this.#collectSegmentCells(Subgrid.iteratorFor(i))));
        }, this);

        this.cellsDeterminatorsMatrix = newGridMatrix();
        this.problem.cells.forEach(cell => {
            this.cellsDeterminatorsMatrix[cell.rowIdx][cell.colIdx] = new CellDeterminator({
                cell,
                row: this.rows[cell.rowIdx],
                column: this.columns[cell.colIdx],
                subgrid: this.subgrids[cell.subgridIdx]
            });
        }, this);

        problem.sums.forEach(sum => {
            this.#registerSum(sum);
        }, this);

        this.segments = [[...this.rows], [...this.columns], [...this.subgrids]].flat();
    }

    #collectSegmentCells(iterator) {
        return Array.from(iterator).map(coords => this.cellAt(coords.rowIdx, coords.colIdx), this);
    }

    solve() {
        this.#determineAndSliceResidualSumsInNSegments(2);
        this.#determineAndSliceResidualSumsInSegments();
        this.#fillUpCombinationsForSumsAndMakeInitialReduce();
        this.#mainReduce();

        return this.#solution;
    }

    #determineAndSliceResidualSumsInNSegments(n) {
        const nSegmentCellCount = n * UNIQUE_SEGMENT_COUNT;
        const nSegmentSumVal = n * UNIQUE_SEGMENT_SUM;
        _.range(UNIQUE_SEGMENT_LENGTH - n + 1).forEach(leftColIdx => {
            const rightColIdxExclusive = leftColIdx + n;
            let sumsArea = new SumsArea();
            for (const sumDet of this.sumsDeterminatorsMap.values()) {
                if (sumDet.minColIdx >= leftColIdx && sumDet.maxColIdx < rightColIdxExclusive) {
                    sumsArea = new SumsArea(sumsArea.sums.concat(sumDet.sum), nSegmentCellCount);
                }
            }
            if (sumsArea.cellsSet.size > nSegmentCellCount - 6) {
                const residualCells = [];
                _.range(leftColIdx, rightColIdxExclusive).forEach(colIdx => {
                    for (const { rowIdx } of this.columns[colIdx].cellIterator()) {
                        if (!sumsArea.has(this.cellAt(rowIdx, colIdx))) {
                            residualCells.push(this.cellAt(rowIdx, colIdx));
                        }
                    }
                });
                if (residualCells.length) {
                    const residualSum = new Sum(nSegmentSumVal - sumsArea.totalValue, residualCells);
                    if (!this.sumsDeterminatorsMap.has(residualSum.key())) {
                        this.#addAndSliceResidualSumRecursively(residualSum);                        
                    }
                }
            }
        });
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
                if (this.sumsDeterminatorsMap.has(residualSum.key())) return;

                this.#registerSum(residualSum);

                const sumsForResidualSum = this.#getSumsFullyContainingResidualSum(residualSum);
                const sumsToUnregister = [];
                sumsForResidualSum.forEach(firstChunkSum => {
                    const secondChunkSum = this.#sliceSum(firstChunkSum, residualSum);
                    sumsToUnregister.push(firstChunkSum);
                    nextResidualSums.push(secondChunkSum);
                }, this);

                sumsToUnregister.forEach(sum => this.#unregisterSum(sum));
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

    #sliceSum(sumToSlice, firstChunkSum) {
        const secondChunkSumCells = [];
        sumToSlice.cells.forEach(cell => {
            if (!firstChunkSum.has(cell)) {
                secondChunkSumCells.push(cell);
            }
        });
        return new Sum(sumToSlice.value - firstChunkSum.value, secondChunkSumCells);
    }

    #fillUpCombinationsForSumsAndMakeInitialReduce() {
        this.segments.forEach(segment => {
            const combosForSegment = findSumCombinationsForSegment(segment);
            segment.debugCombosForSegment = combosForSegment;
            segment.sums.forEach((sum, idx) => {
                const sumDeterminator = this.sumsDeterminatorsMap.get(sum.key());
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
                sumDeterminator.updateCombinations(combos);
            }, this);
        }, this);
    }

    #mainReduce() {
        let sumDetsIterable = this.sumsDeterminatorsMap.values();
        let iterate = true;
        let newlySolvedCellDets = [];

        while (iterate) {
            if (this.#placedNumbersCount >= 81) {
                return;
            }
    
            this.#reduceSums(sumDetsIterable);
    
            const solvedCellDets = this.#determineCellsWithSingleOption();
            let nextSumsSet = this.#reduceSegmentsBySolvedCells(solvedCellDets);

            newlySolvedCellDets = newlySolvedCellDets.concat(Array.from(solvedCellDets));

            if (nextSumsSet.size > 0) {
                sumDetsIterable = nextSumsSet.values();
            } else if (newlySolvedCellDets.length > 0) {
                newlySolvedCellDets.forEach(cellDet => {
                    const withinSumsSet = cellDet.withinSumsSet;
                    if (!(withinSumsSet.size === 1 && withinSumsSet.values().next().value.isSingleCellSum)) {
                        const firstChunkSum = Sum.of(cellDet.placedNumber).cell(cellDet.cell.rowIdx, cellDet.cell.colIdx).mk();
                        this.#addAndSliceResidualSumRecursively(firstChunkSum);
                    }
                });
                newlySolvedCellDets = [];
                nextSumsSet = new Set(this.sumsDeterminatorsMap.values());
                sumDetsIterable = nextSumsSet.values();
            }
            else {
                nextSumsSet = this.#determineUniqueSumsInSegments();
                sumDetsIterable = nextSumsSet.values();
            }

            iterate = nextSumsSet.size > 0;
        }
    }

    #reduceSums(sumDetsIterable) {
        let iterate = true;

        while (iterate) {
            let modifiedCellDets = new Set();

            for (const sumDeterminator of sumDetsIterable) {
                const currentlyModifiedCellDets = sumDeterminator.reduce();
                modifiedCellDets = new Set([...modifiedCellDets, ...currentlyModifiedCellDets]);
            }

            let moreSumsToReduce = new Set();
            for (const modifiedCellDet of modifiedCellDets.values()) {
                moreSumsToReduce = new Set([...moreSumsToReduce, ...modifiedCellDet.withinSumsSet]);
            }

            const nextSumDetsToReduce = new Set(Array.from(moreSumsToReduce).map(sum => this.sumsDeterminatorsMap.get(sum.key())));
            sumDetsIterable = nextSumDetsToReduce.values();
            iterate = nextSumDetsToReduce.size > 0;
        }
    }

    #reduceSegmentsBySolvedCells(cellDets) {
        let sumsToReduceSet = new Set();
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
                        sumsToReduceSet = new Set([...sumsToReduceSet, ...aCellDet.withinSumsSet]);
                    }
                }    
            });
        });
        return new Set(Array.from(sumsToReduceSet).map(sum => this.sumsDeterminatorsMap.get(sum.key())));
    }

    #determineUniqueSumsInSegments() {
        let sumsToReduce = new Set();

        this.segments.forEach(segment => {
            _.range(1, UNIQUE_SEGMENT_LENGTH + 1).forEach(num => {
                const sumDetsWithNum = [];
                // consider overlapping vs non-overlapping sums
                segment.sums.forEach(sum => {
                    if (sum.isSingleCellSum) return;
                    const sumDet = this.sumsDeterminatorsMap.get(sum.key());
                    const hasNumInCells = sumDet.cellsDeterminators.some(cellDet => cellDet.hasNumOpt(num));
                    if (hasNumInCells) {
                        sumDetsWithNum.push(sumDet);
                    }
                });
                if (sumDetsWithNum.length !== 1) return;

                const sumDetToReDefine = sumDetsWithNum[0];
                const reducedCellDets = sumDetToReDefine.reduceToCombinationsContaining(num);
                
                if (!reducedCellDets.length) return;
                reducedCellDets.forEach(cellDet => {
                    sumsToReduce = new Set([...sumsToReduce, ...cellDet.withinSumsSet]);
                });

                // remove number from other cells
                const furtherReducedCellDets = new Set();
                for (const { rowIdx, colIdx } of segment.cellIterator()) {
                    const cellDet = this.cellDeterminatorAt(rowIdx, colIdx);
                    if (sumDetToReDefine.has(cellDet)) return;

                    if (cellDet.hasNumOpt(num)) {
                        cellDet.deleteNumOpt(num);
                        furtherReducedCellDets.add(cellDet);
                    }
                }
                furtherReducedCellDets.forEach(cellDet => {
                    sumsToReduce = new Set([...sumsToReduce, ...cellDet.withinSumsSet]);
                });
            });
        });

        return new Set(Array.from(sumsToReduce).map(sum => this.sumsDeterminatorsMap.get(sum.key())));
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

    #registerSum(sum) {
        const sumDeterminator = new SumDeterminator(sum, sum.cells.map(cell => this.cellDeterminatorOf(cell), this));
        if (sum.isWithinRow) {
            this.rows[sumDeterminator.anyRowIdx()].addSum(sum);
        }
        if (sum.isWithinColumn) {
            this.columns[sumDeterminator.anyColumnIdx()].addSum(sum);
        }
        if (sum.isWithinSubgrid) {
            this.subgrids[sumDeterminator.anySubgridIdx()].addSum(sum);
        }
        sum.cells.forEach(cell => {
            this.cellDeterminatorOf(cell).addWithinSum(sum);
        }, this);
        this.sumsDeterminatorsMap.set(sum.key(), sumDeterminator);
    }

    #unregisterSum(sum) {
        const sumDeterminator = this.sumsDeterminatorsMap.get(sum.key());
        if (sum.isWithinRow) {
            this.rows[sumDeterminator.anyRowIdx()].removeSum(sum);
        }
        if (sum.isWithinColumn) {
            this.columns[sumDeterminator.anyColumnIdx()].removeSum(sum);
        }
        if (sum.isWithinSubgrid) {
            this.subgrids[sumDeterminator.anySubgridIdx()].removeSum(sum);
        }
        sum.cells.forEach(cell => {
            this.cellDeterminatorOf(cell).removeWithinSum(sum);
        }, this);
        this.sumsDeterminatorsMap.delete(sum.key());
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
        return this.cellsDeterminatorsMatrix[rowIdx][colIdx];
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
