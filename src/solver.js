import _ from "lodash";
import { GRID_SIDE_LENGTH, UNIQUE_SEGMENT_SUM } from "./problem";

const newMatrix = () => new Array(GRID_SIDE_LENGTH).fill().map(() => new Array(GRID_SIDE_LENGTH));

export class Cell {
    constructor(rowIdx, colIdx) {
        this.rowIdx = rowIdx;
        this.colIdx = colIdx;
        this.subgridIdx = Math.floor(rowIdx / 3) * 3 + Math.floor(colIdx / 3);
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
            if (i < GRID_SIDE_LENGTH) {
                return { value: valueOf(i++), done: false };
            } else {
                return { value: GRID_SIDE_LENGTH, done: true };
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
                const subgridStartingrowIdx = Math.floor(subgridIdx / 3) * 3;
                const subgridStartingcolIdx = (subgridIdx % 3) * 3;
                const rowIdx = subgridStartingrowIdx + Math.floor(i / 3);
                const colIdx = subgridStartingcolIdx + i % 3;
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
