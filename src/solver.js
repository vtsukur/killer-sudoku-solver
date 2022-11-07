import _ from 'lodash';
import { newGridMatrix } from './matrix';
import { UNIQUE_SEGMENT_LENGTH, SUBGRID_SIDE_LENGTH, UNIQUE_SEGMENT_SUM, Sum } from './problem';

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

        this.numberOptions = new Set(_.range(UNIQUE_SEGMENT_LENGTH).map(i => i + 1));
        this.placedNumber = undefined;
    }

    addWithinSum(withinSum) {
        this.withinSumsSet.add(withinSum);
    }

    removeWithinSum(withinSum) {
        this.withinSumsSet.delete(withinSum);
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
    constructor(sum) {
        this.sum = sum;
    }

    getUniqueRowIdx() {
        if (this.sum.isWithinRow) {
            return this.sum.cells[0].rowIdx;
        }
    }

    getUniqueColumnIdx() {
        if (this.sum.isWithinColumn) {
            return this.sum.cells[0].colIdx;
        }
    }

    getUniqueSubgridIdx() {
        if (this.sum.isWithinSubgrid) {
            return this.sum.cells[0].subgridIdx;
        }
    }
}

class Segment {
    #sumsArea;

    constructor(idx, cells, inputSums = []) {
        this.idx = idx;
        this.cells = cells;
        this.sums = inputSums;
        this.#sumsArea = new SumsArea(this.sums);
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
    constructor(problem) {
        this.problem = problem;
        this.inputSums = [];
        this.inputSumsMatrix = newGridMatrix();
        this.sumsDeterminatorsMap = new Map();
        this.cellsMatrix = newGridMatrix();

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
    };

    determineAndSliceResidualSumsInSegments() {
        this.segments.forEach(segment => {
            const residualSum = segment.determineResidualSum();
            if (residualSum) {
                const inputSumsForResidualSum = this.#getInputSumsForResidualSum(residualSum);
                if (inputSumsForResidualSum.size === 1) {
                    const inputSum = inputSumsForResidualSum.values().next().value;
                    const secondChunkSum = this.#sliceSum(inputSum, residualSum);
                    this.#unregisterSum(inputSum);
                    this.#registerSum(residualSum);
                    this.#registerSum(secondChunkSum);
                } else {
                    this.#registerSum(residualSum);    
                }
            }
        }, this);
    }

    #getInputSumsForResidualSum(sum) {
        return new Set(sum.cells.map(cell => this.inputSumOf(cell), this));
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

    #registerSum(sum) {
        const sumDeterminator = new SumDeterminator(sum);
        if (sum.isWithinRow) {
            this.rows[sumDeterminator.getUniqueRowIdx()].addSum(sum);
        }
        if (sum.isWithinColumn) {
            this.columns[sumDeterminator.getUniqueColumnIdx()].addSum(sum);
        }
        if (sum.isWithinSubgrid) {
            this.subgrids[sumDeterminator.getUniqueSubgridIdx()].addSum(sum);
        }
        sum.cells.forEach(cell => {
            this.cellDeterminatorOf(cell).addWithinSum(sum);
        }, this);
        this.sumsDeterminatorsMap.set(sum.key(), sumDeterminator);
    }

    #unregisterSum(sum) {
        const sumDeterminator = this.sumsDeterminatorsMap.get(sum.key());
        if (sum.isWithinRow) {
            this.rows[sumDeterminator.getUniqueRowIdx()].removeSum(sum);
        }
        if (sum.isWithinColumn) {
            this.columns[sumDeterminator.getUniqueColumnIdx()].removeSum(sum);
        }
        if (sum.isWithinSubgrid) {
            this.subgrids[sumDeterminator.getUniqueSubgridIdx()].removeSum(sum);
        }
        sum.cells.forEach(cell => {
            this.cellDeterminatorOf(cell).removeWithinSum(sum);
        }, this);
        this.sumsDeterminatorsMap.delete(sum.key());
    }

    inputSumOf(cell) {
        return this.inputSumAt(cell.rowIdx, cell.colIdx);
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
