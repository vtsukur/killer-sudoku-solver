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

    reReduce() {
        if (this.#cellCount > 1 && this.#cellCount < 4 && this.sum.isWithinSegment) {
            this.#recursiveReReduce(0, 0, {
                processedCellDeterminators: new Set(),
                processedNumbers: new Set(),
                numbersStack: new Array(this.#cellCount),
                cellsDeterminatorsStack: new Array(this.#cellCount)
            });
        }
    }

    #recursiveReReduce(sumValue, step, { cellsDeterminatorsStack, numbersStack, processedCellDeterminators, processedNumbers }) {
        if (step === (this.#cellCount - 1)) {
            const lastNumber = this.sum.value - sumValue;
            const lastCellDeterminator = this.cellsDeterminators.find(cellDeterminator => !processedCellDeterminators.has(cellDeterminator));
            if (!lastCellDeterminator.numberOptions.has(lastNumber)) {
                cellsDeterminatorsStack[0].numberOptions.delete(numbersStack[0]);
            }
            return;
        }

        this.cellsDeterminators.forEach(cellDeterminator => {
            if (processedCellDeterminators.has(cellDeterminator)) {
                return;
            }

            cellsDeterminatorsStack[step] = cellDeterminator;
            processedCellDeterminators.add(cellDeterminator);

            const numberOptionsArr = Array.from(cellDeterminator.numberOptions.values());
            for (const number of numberOptionsArr) {
                if (!processedNumbers.has(number)) {
                    processedNumbers.add(number);
                    numbersStack[step] = number;
                    this.#recursiveReReduce(sumValue + number, step + 1, {
                        cellsDeterminatorsStack,
                        numbersStack,
                        processedCellDeterminators,
                        processedNumbers
                    });
                    numbersStack[step] = undefined;
                    processedNumbers.delete(number);
                }
            }

            cellsDeterminatorsStack[step] = undefined;
            processedCellDeterminators.delete(cellDeterminator);
        }, this);
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

        for (const sumDeterminator of this.sumsDeterminatorsMap.values()) {
            sumDeterminator.reReduce();
        }

        this.#runCallback('onAfterInitialReduce');
    }

    #placeNumber(cell, number) {
        const rowIdx = cell.rowIdx;
        const colIdx = cell.colIdx;
        const subgridIdx = cell.subgridIdx;
        const cellDeterminator = this.cellDeterminatorOf(cell);

        cellDeterminator.placeNumber(number);

        this.rows[rowIdx].placedNumbers.add(number);
        this.columns[colIdx].placedNumbers.add(number);
        this.subgrids[subgridIdx].placedNumbers.add(number);

        this.#solution[rowIdx][colIdx] = number;
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
