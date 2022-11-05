import _ from "lodash";
import { UNIQUE_SEGMENT_LENGTH, UNIQUE_SEGMENT_SUM, SUBGRID_SIDE_LENGTH, GRID_CELL_COUNT } from "./problem";

export class Cell {
    constructor(rowIdx, colIdx) {
        this.rowIdx = rowIdx;
        this.colIdx = colIdx;
        this.subgridIdx = Math.floor(rowIdx / SUBGRID_SIDE_LENGTH) * SUBGRID_SIDE_LENGTH + Math.floor(colIdx / SUBGRID_SIDE_LENGTH);
    }

    static fromInput(inputCell) {
        return new Cell(inputCell.row, inputCell.col);
    }
}

export class Sum {
    constructor(value, cells) {
        this.value = value;
        this.cells = cells;
        this.isWithinRow = this.constructor.#isSameForAll(cells, cell => cell.rowIdx);
        this.isWithinColumn = this.constructor.#isSameForAll(cells, cell => cell.colIdx);
        this.isWithinSubgrid = this.constructor.#isSameForAll(cells, cell => cell.subgridIdx);
    }

    static #isSameForAll(cells, whatFn) {
        return new Set(cells.map(whatFn)).size === 1;
    }

    static fromInput(inputSum) {
        return new Sum(inputSum.value, inputSum.cells.map(inputCell => Cell.fromInput(inputCell)));
    }
}

const collectSegmentSumsWithLeftover = (iterator, model, isContainedFn) => {
    const sums = [];
    let leftoverSumValue = UNIQUE_SEGMENT_SUM;
    const leftoverSumCells = [];
    const processedSums = new Set();
    for (const i of iterator) {
        const sum = model.sumAt(i.rowIdx, i.colIdx);
        if (!processedSums.has(sum)) {
            if (isContainedFn(sum)) {
                sums.push(sum);
                processedSums.add(sum);
                leftoverSumValue -= sum.value;
            } else {
                const cell = model.cellAt(i.rowIdx, i.colIdx);
                leftoverSumCells.push(cell);
            }    
        }
    }
    if (leftoverSumCells.length !== 0) {
        sums.push(new Sum(leftoverSumValue, leftoverSumCells));
    }
    return sums;
};

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

export class Row {
    constructor(rowIdx, sums) {
        this.rowIdx = rowIdx;
        this.sums = sums;
    }

    static createWithLeftoverSum(rowIdx, model) {
        return new Row(rowIdx, collectSegmentSumsWithLeftover(
            newUniqueSegmentIterator(colIdx => {
                return { rowIdx, colIdx };
            }), model, sum => sum.isWithinRow));
    }
}

export class Column {
    constructor(colIdx, sums) {
        this.colIdx = colIdx;
        this.sums = sums;
    }

    static createWithLeftoverSum(colIdx, model) {
        return new Column(colIdx, collectSegmentSumsWithLeftover(
            newUniqueSegmentIterator(rowIdx => {
                return { rowIdx, colIdx };
            }), model, sum => sum.isWithinColumn));
    }
}

export class Subgrid {
    constructor(subgridIdx, sums) {
        this.subgridIdx = subgridIdx;
        this.sums = sums;
    }

    static createWithLeftoverSum(subgridIdx, model) {
        return new Subgrid(subgridIdx, collectSegmentSumsWithLeftover(
            newUniqueSegmentIterator(i => {
                const subgridStartingRowIdx = Math.floor(subgridIdx / SUBGRID_SIDE_LENGTH) * SUBGRID_SIDE_LENGTH;
                const subgridStartingColIdx = (subgridIdx % SUBGRID_SIDE_LENGTH) * SUBGRID_SIDE_LENGTH;
                const rowIdx = subgridStartingRowIdx + Math.floor(i / SUBGRID_SIDE_LENGTH);
                const colIdx = subgridStartingColIdx + i % SUBGRID_SIDE_LENGTH;
                return { rowIdx, colIdx };
            }
        ), model, sum => sum.isWithinSubgrid));
    }
}

export class MutableSolverModel {
    constructor(problem) {
        this.problem = problem;
        this.sums = [];
        this.sumsMatrix = this.constructor.#newMatrix();
        this.cells = [];
        this.cellsMatrix = this.constructor.#newMatrix();
        problem.sums.forEach(inputSum => {
            const sum = Sum.fromInput(inputSum);
            sum.cells.forEach(cell => {
                this.sumsMatrix[cell.rowIdx][cell.colIdx] = sum;
                this.cells.push(cell);
                this.cellsMatrix[cell.rowIdx][cell.colIdx] = cell;
            }, this);
            this.sums.push(sum);
        }, this);    
        this.rows = [];
        this.columns = [];
        this.subgrids = [];
    }

    static #newMatrix() {
        return new Array(UNIQUE_SEGMENT_LENGTH).fill().map(() => new Array(UNIQUE_SEGMENT_LENGTH));
    }

    init() {
        _.range(UNIQUE_SEGMENT_LENGTH).forEach(i => {
            this.rows.push(Row.createWithLeftoverSum(i, this));
            this.columns.push(Column.createWithLeftoverSum(i, this));
            this.subgrids.push(Subgrid.createWithLeftoverSum(i, this));
        }, this);

        _.range(GRID_CELL_COUNT).forEach(cell => {

        }, this);
    }

    sumAt(rowIdx, colIdx) {
        return this.sumsMatrix[rowIdx][colIdx];
    }

    cellAt(rowIds, colIdx) {
        return this.cellsMatrix[rowIds][colIdx];
    }
}
