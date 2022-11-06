import _ from 'lodash';
import { UNIQUE_SEGMENT_LENGTH, SUBGRID_SIDE_LENGTH } from './problem';

const newUniqueSegmentIterator = (valueOfFn) => {
    let i = 0;
    return {
        [Symbol.iterator]() { return this; },
        next() {
            if (i < UNIQUE_SEGMENT_LENGTH) {
                return { value: valueOfFn(i++), done: false };
            } else {
                return { value: UNIQUE_SEGMENT_LENGTH, done: true };
            }
        }
    }
}

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
}

export class Row {
    constructor(idx, cells, inputSums) {
        this.idx = idx;
        this.cells = cells;
        this.sums = inputSums;
    }

    static iteratorFor(idx) {
        return newUniqueSegmentIterator(colIdx => {
            return { rowIdx: idx, colIdx };
        });
    }

    static isWithinSegment(sum) {
        return sum.isWithinRow;
    }
}

export class Column {
    constructor(idx, cells, inputSums) {
        this.idx = idx;
        this.cells = cells;
        this.sums = inputSums;
    }

    static iteratorFor(idx) {
        return newUniqueSegmentIterator(rowIdx => {
            return { rowIdx, colIdx: idx };
        });
    }

    static isWithinSegment(sum) {
        return sum.isWithinColumn;
    }
}

export class Subgrid {
    constructor(idx, cells, inputSums) {
        this.idx = idx;
        this.cells = cells;
        this.sums = inputSums;
    }

    static iteratorFor(idx) {
        return newUniqueSegmentIterator(i => {
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
        this.allSumsMatrix = this.constructor.#newMatrix();
        this.cells = [];
        this.cellsMatrix = this.constructor.#newMatrix();
        problem.sums.forEach(sum => {
            sum.cells.forEach(cell => {
                this.inputSumsMatrix[cell.rowIdx][cell.colIdx] = sum;
                this.allSumsMatrix[cell.rowIdx][cell.colIdx] = new Set([sum]);
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

    inputSumAt(rowIdx, colIdx) {
        return this.inputSumsMatrix[rowIdx][colIdx];
    }

    cellAt(rowIds, colIdx) {
        return this.cellsMatrix[rowIds][colIdx];
    }
}
