import _ from "lodash";
import { UNIQUE_SEGMENT_LENGTH, UNIQUE_SEGMENT_SUM, SUBGRID_SIDE_LENGTH } from "./problem";

const newMatrix = () => new Array(UNIQUE_SEGMENT_LENGTH).fill().map(() => new Array(UNIQUE_SEGMENT_LENGTH));

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
        this.isRowOnlySum = (new Set(cells.map(cell => cell.rowIdx)).size === 1);
        this.isColumnOnlySum = (new Set(cells.map(cell => cell.colIdx)).size === 1);
        this.isSubgridOnlySum = (new Set(cells.map(cell => cell.subgridIdx)).size === 1);
    }

    static fromInput(inputSum) {
        return new Sum(inputSum.value, inputSum.cells.map(inputCell => Cell.fromInput(inputCell)));
    }
}

const collectSegmentSumsWithLeftover = (iterator, model, isContained) => {
    const sums = [];
    let leftoverSumValue = UNIQUE_SEGMENT_SUM;
    const leftoverSumCells = [];
    const processedSums = new Set();
    for (const i of iterator) {
        const sum = model.sumAt(i.rowIdx, i.colIdx);
        if (!processedSums.has(sum)) {
            if (isContained(sum)) {
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

const newUniqueSegmentIterator = (valueOf) => {
    let i = 0;
    return {
        [Symbol.iterator]() { return this; },
        next() {
            if (i < UNIQUE_SEGMENT_LENGTH) {
                return { value: valueOf(i++), done: false };
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
            }), model, sum => sum.isRowOnlySum));
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
            }), model, sum => sum.isColumnOnlySum));
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
        ), model, sum => sum.isSubgridOnlySum));
    }
}

export class MutableSolverModel {
    constructor(problem) {
        this.problem = problem;
        this.sums = [];
        this.sumMatrix = newMatrix();
        this.cellMatrix = newMatrix();
        problem.sums.forEach(inputSum => {
            const sum = Sum.fromInput(inputSum);
            sum.cells.forEach(cell => {
                this.sumMatrix[cell.rowIdx][cell.colIdx] = sum;
                this.cellMatrix[cell.rowIdx][cell.colIdx] = cell;
            }, this);
            this.sums.push(sum);
        }, this);        
    }

    sumAt(rowIdx, colIdx) {
        return this.sumMatrix[rowIdx][colIdx];
    }

    cellAt(rowIds, colIdx) {
        return this.cellMatrix[rowIds][colIdx];
    }
}
