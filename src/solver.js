import _ from 'lodash';
import { findCombinationsForSum } from './combinatorial';
import { UNIQUE_SEGMENT_LENGTH, SUBGRID_SIDE_LENGTH, UNIQUE_SEGMENT_SUM, Sum, GRID_CELL_COUNT } from './problem';

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
    constructor({ cell, row, column, subgrid, withinSums }) {
        this.cell = cell;
        this.row = row;
        this.column = column;
        this.subgrid = subgrid;
        this.withinSums = new Set(withinSums);

        this.numberOptions = new Set(_.range(UNIQUE_SEGMENT_LENGTH).map(i => i + 1));
        this.placedNumber = undefined;
    }

    addWithinSum(withinSum) {
        this.withinSums.add(withinSum);
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
}

class Segment {
    #sumsArea;

    constructor(idx, cells, inputSums) {
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

        const residualSum = new Sum(UNIQUE_SEGMENT_SUM - this.#sumsArea.totalValue, residualSumCells);
        this.sums.push(residualSum);
        return residualSum;
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

    static isWithinSegment(sum) {
        return sum.isWithinRow;
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

    static isWithinSegment(sum) {
        return sum.isWithinColumn;
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

    static isWithinSegment(sum) {
        return sum.isWithinSubgrid;
    }
}

export class Solver {
    constructor(problem) {
        this.problem = problem;
        this.inputSums = [];
        this.inputSumsMatrix = this.constructor.#newMatrix();
        this.sumsDeterminatorsMap = new Map();
        this.cells = [];
        this.cellsMatrix = this.constructor.#newMatrix();
        problem.sums.forEach(sum => {
            this.sumsDeterminatorsMap.set(sum, new SumDeterminator(sum));
            sum.cells.forEach(cell => {
                this.inputSumsMatrix[cell.rowIdx][cell.colIdx] = sum;
                this.cells.push(cell);
                this.cellsMatrix[cell.rowIdx][cell.colIdx] = cell;
            }, this);
            this.inputSums.push(sum);
        }, this);

        this.rows = [];
        this.columns = [];
        this.subgrids = [];
        _.range(UNIQUE_SEGMENT_LENGTH).forEach(i => {
            this.rows.push(this.initRow(i));
            this.columns.push(this.initColumn(i));
            this.subgrids.push(this.initSubgrid(i));
        }, this);
        this.segments = [[...this.rows], [...this.columns], [...this.subgrids]].flat();

        this.cellsDeterminatorsMatrix = this.constructor.#newMatrix();
        this.cells.forEach(cell => {
            this.cellsDeterminatorsMatrix[cell.rowIdx][cell.colIdx] = new CellDeterminator({
                cell,
                row: this.rows[cell.rowIdx],
                column: this.columns[cell.colIdx],
                subgrid: this.subgrids[cell.subgridIdx],
                withinSums: [ this.inputSumAt(cell.rowIdx, cell.colIdx) ]
            });
        }, this);
    }

    static #newMatrix() {
        return new Array(UNIQUE_SEGMENT_LENGTH).fill().map(() => new Array(UNIQUE_SEGMENT_LENGTH));
    }

    initRow(idx) {
        return new Row(idx,
            this.#collectSegmentCells(Row.iteratorFor(idx)),
            this.#collectSegmentSums(Row.iteratorFor(idx), Row.isWithinSegment));
    }

    initColumn(idx) {
        return new Column(idx,
            this.#collectSegmentCells(Column.iteratorFor(idx)),
            this.#collectSegmentSums(Column.iteratorFor(idx), Column.isWithinSegment));
    }

    initSubgrid(idx) {
        return new Subgrid(idx,
            this.#collectSegmentCells(Subgrid.iteratorFor(idx)),
            this.#collectSegmentSums(Subgrid.iteratorFor(idx), Subgrid.isWithinSegment));
    }

    #collectSegmentCells(iterator) {
        return Array.from(iterator).map(coords => this.cellAt(coords.rowIdx, coords.colIdx), this);
    };

    #collectSegmentSums(iterator, isWithinSegmentFn) {
        const sums = [];
        const processedSums = new Set();
        for (const i of iterator) {
            const sum = this.inputSumAt(i.rowIdx, i.colIdx);
            if (!processedSums.has(sum)) {
                if (isWithinSegmentFn(sum)) {
                    sums.push(sum);
                }    
                processedSums.add(sum);
            }
        }
        return sums;
    };

    determineResidualSumsInSegments() {
        this.segments.forEach(segment => {
            const residualSum = segment.determineResidualSum();
            if (residualSum) {
                this.sumsDeterminatorsMap.set(residualSum, new SumDeterminator(residualSum));
                residualSum.cells.forEach(cell => {
                    const cellDeterminator = this.cellDeterminatorOf(cell);
                    cellDeterminator.addWithinSum(residualSum);
                }, this);    
            }
        }, this);
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
}
