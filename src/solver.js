import _ from 'lodash';
import { newGridMatrix } from './matrix';
import { UNIQUE_SEGMENT_LENGTH, SUBGRID_SIDE_LENGTH, UNIQUE_SEGMENT_SUM, Sum } from './problem';
import { findSumCombinationsForSegment } from './combinatorial';

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
    constructor({ cell, row, column, subgrid }) {
        this.cell = cell;
        this.row = row;
        this.column = column;
        this.subgrid = subgrid;
        this.withinSumsSet = new Set();
        this.solved = false;

        this.numberOptions = new Set(_.range(UNIQUE_SEGMENT_LENGTH).map(i => i + 1));
        this.placedNumber = undefined;
    }

    addWithinSum(withinSum) {
        this.withinSumsSet.add(withinSum);
    }

    removeWithinSum(withinSum) {
        this.withinSumsSet.delete(withinSum);
    }

    reduceNumberOptions(numberOptions) {
        const newSet = new Set();
        for (const existingNumberOption of this.numberOptions) {
            if (numberOptions.has(existingNumberOption)) {
                newSet.add(existingNumberOption);
            }
        }
        this.numberOptions = newSet;
    }

    placeNumber(number) {
        this.numberOptions = new Set([number]);
        this.placedNumber = number;
        this.solved = true;
    }
}

class SumsArea {
    constructor(sums) {
        this.sums = sums;
        this.cellsSet = new Set();
        this.totalValue = 0;
        sums.forEach(sum => {
            this.totalValue += sum.value;
            sum.cells.forEach(cell => {
                this.cellsSet.add(cell);
            }, this);
        }, this);
    }

    has(cell) {
        return this.cellsSet.has(cell);
    }
}

class SumDeterminator {
    #firstCell;
    #combos;
    #cellCount;

    constructor(sum, cellsDeterminators) {
        this.sum = sum;
        this.#firstCell = sum.cells[0];
        this.cellsDeterminators = cellsDeterminators;
        this.#cellCount = sum.cellCount;
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
        this.#combos = combos;

        const numberOptions = new Set();
        [...combos].forEach(comboSet => {
            [...comboSet].forEach(number => {
                numberOptions.add(number);
            });
        });

        this.cellsDeterminators.forEach(cellDeterminator => cellDeterminator.reduceNumberOptions(numberOptions));
    }

    reduce() {
        if (this.#cellCount > 1 && this.#cellCount < 5 && this.sum.isWithinSegment) {
            return this.#reduceByCellPermutations();
        } else {
            return [];
        }
    }

    #reduceByCellPermutations() {
        const context = {
            cellDets: this.cellsDeterminators,
            processedCellDets: new Set(),
            remainingCellDets: new Set(this.cellsDeterminators),
            processedNumbers: new Set(),
            numbersStack: new Array(this.#cellCount),
            cellsDetsStack: new Array(this.#cellCount),
            someCell: function(step, fn) {
                return this.cellDets.some(cellDet => {
                    if (this.processedCellDets.has(cellDet)) return;
                    this.processedCellDets.add(cellDet); this.remainingCellDets.delete(cellDet);
                    this.cellsDetsStack[step] = cellDet;
                    const retVal = fn(cellDet);
                    this.cellsDetsStack[step] = undefined;
                    this.processedCellDets.delete(cellDet); this.remainingCellDets.add(cellDet);    
                    return retVal === undefined ? false : retVal;
                });
            },
            someNumber: function(cellDet, step, fn) {
                return Array.from(cellDet.numberOptions).some(num => {
                    if (this.processedNumbers.has(num)) return;
                    this.processedNumbers.add(num);
                    this.numbersStack[step] = num;
                    const retVal = fn(num);
                    this.numbersStack[step] = undefined;
                    this.processedNumbers.delete(num);
                    return retVal;
                });
            },
            remainingCellDet: function() {
                return context.remainingCellDets.values().next().value;
            }
        };

        const modifiedCellDets = [];
        context.someCell(0, cellDet => {
            context.someNumber(cellDet, 0, (num) => {
                if (!this.#hasSumMatchingPermutationsRecursive(num, 1, context)) {
                    cellDet.numberOptions.delete(num);
                    modifiedCellDets.push(cellDet);
                }
            });
        });
        return modifiedCellDets;
    } 

    #hasSumMatchingPermutationsRecursive(currentSumVal, step, context) {
        if (step === (this.#cellCount - 1)) {
            const lastNum = this.sum.value - currentSumVal;
            const lastCellDet = context.remainingCellDet();
            return lastCellDet.numberOptions.has(lastNum);
        }

        return context.someCell(step, cellDet => {
            return context.someNumber(cellDet, step, (num) => {
                return this.#hasSumMatchingPermutationsRecursive(currentSumVal + num, step + 1, context);
            });
        });
    }
}

class Segment {
    #sumsArea;

    constructor(idx, cells, inputSums = []) {
        this.idx = idx;
        this.cells = cells;
        this.sums = inputSums;
        this.#sumsArea = new SumsArea(this.sums);
        this.placedNumbers = new Set();
    }

    determineResidualSum() {
        if (this.#sumsArea.totalValue === UNIQUE_SEGMENT_SUM) {
            return;
        }

        const residualSumCells = [];
        this.cells.forEach(cell => {
            if (!this.#sumsArea.has(cell)) {
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
}

export class Row extends Segment {
    constructor(idx, cells, inputSums) {
        super(idx, cells, inputSums);
    }

    static iteratorFor(idx) {
        return newSegmentIterator(colIdx => {
            return { rowIdx: idx, colIdx };
        });
    }
}

export class Column extends Segment {
    constructor(idx, cells, inputSums) {
        super(idx, cells, inputSums);
    }

    static iteratorFor(idx) {
        return newSegmentIterator(rowIdx => {
            return { rowIdx, colIdx: idx };
        });
    }
}

export class Subgrid extends Segment {
    constructor(idx, cells, inputSums) {
        super(idx, cells, inputSums);
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

    constructor(problem, callbacks = {}) {
        this.problem = problem;
        this.callbacks = callbacks;
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

    #runCallback(eventName) {
        if (this.callbacks.hasOwnProperty(eventName)) {
            this.callbacks[eventName]();
        }
    }

    solve() {
        this.#determineAndSliceResidualSumsInSegments();
        this.#fillUpCombinationsForSumsAndMakeInitialReduce();
        this.#determineSingleCellSums();
        this.#determineCellWithSingleOption();

        return this.#solution;
    }

    #determineAndSliceResidualSumsInSegments() {
        this.segments.forEach(segment => {
            const residualSum = segment.determineResidualSum();
            if (residualSum) {
                this.#addAndSliceResidualSumRecursively(residualSum);
            }
        }, this);
        this.#runCallback('onAfterResidualSumsDeterminedAndSliced');
    }

    #addAndSliceResidualSumRecursively(residualSum) {
        this.#registerSum(residualSum);

        const sumsForResidualSum = this.#getSumsFullyContainingResidualSum(residualSum);
        sumsForResidualSum.forEach(sum => {
            const secondChunkSum = this.#sliceSum(sum, residualSum);
            this.#unregisterSum(sum);
            this.#addAndSliceResidualSumRecursively(secondChunkSum);
        }, this);
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

    #determineSingleCellSums() {
        for (const sumDeterminator of this.sumsDeterminatorsMap.values()) {
            const sum = sumDeterminator.sum;
            if (sum.isSingleCellSum) {
                this.#placeNumber(sum.cells[0], sum.value);
            }
        }
    }

    #determineCellWithSingleOption() {
        _.range(UNIQUE_SEGMENT_LENGTH).forEach(rowIdx => {
            _.range(UNIQUE_SEGMENT_LENGTH).forEach(colIdx => {
                const cellDet = this.cellDeterminatorAt(rowIdx, colIdx);
                if (cellDet.numberOptions.size === 1 && !cellDet.solved) {
                    this.#placeNumber(cellDet.cell, cellDet.numberOptions.values().next().value);
                }
            });
        });
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

        this.#reduceSumsRecursively(this.sumsDeterminatorsMap.values());

        this.#runCallback('onAfterInitialReduce');
    }

    #reduceSumsRecursively(sumDets) {
        let sumDetsIterable = sumDets;
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

            const sumDetsToReduce = new Set(Array.from(moreSumsToReduce).map(sum => this.sumsDeterminatorsMap.get(sum.key())));
            sumDetsIterable = sumDetsToReduce.values();
            iterate = sumDetsToReduce.size > 0;
        }
    }

    #placeNumber(cell, number) {
        const rowIdx = cell.rowIdx;
        const colIdx = cell.colIdx;
        const subgridIdx = cell.subgridIdx;
        const cellDeterminator = this.cellDeterminatorOf(cell);

        cellDeterminator.placeNumber(number);

        this.#placeNumberInRow(cell, number);
        this.columns[colIdx].placedNumbers.add(number);
        this.subgrids[subgridIdx].placedNumbers.add(number);

        this.#solution[rowIdx][colIdx] = number;
        this.#placedNumbersCount++;
    }

    #placeNumberInRow(cell, number) {
        const row = this.rows[cell.rowIdx];
        row.placedNumbers.add(number);

        let sumsToReduce = new Set();

        _.range(UNIQUE_SEGMENT_LENGTH).forEach(colIdx => {
            if (colIdx === cell.colIdx) return;

            const cellDet = this.cellDeterminatorAt(cell.rowIdx, colIdx);
            if (cellDet.numberOptions.has(number)) {
                cellDet.numberOptions.delete(number);
                sumsToReduce = new Set([...sumsToReduce, ...cellDet.withinSumsSet]);
            }
        });

        const sumDetsToReduce = new Set(Array.from(sumsToReduce).map(sum => this.sumsDeterminatorsMap.get(sum.key())));
        this.#reduceSumsRecursively(sumDetsToReduce.values());
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
