import _ from "lodash";
import { GRID_SIDE_LENGTH, UNIQUE_SEGMENT_SUM } from "./problem";

const newMatrix = () => new Array(GRID_SIDE_LENGTH + 1).fill(undefined).map(() => new Array(GRID_SIDE_LENGTH + 1));

export class Cell {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.subgridNum = Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3) + 1;
    }

    static fromInput(inputCell) {
        return new Cell(inputCell.row, inputCell.col);
    }
}

export class Sum {
    constructor(value, cells) {
        this.value = value;
        this.cells = cells;
        this.isRowOnlySum = (new Set(cells.map(cell => cell.row)).size === 1);
        this.isColumnOnlySum = (new Set(cells.map(cell => cell.col)).size === 1);
        this.isSubgridOnlySum = (new Set(cells.map(cell => cell.subgridNum)).size === 1);
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
        const sum = model.sumAt(i.rowNum, i.colNum);
        if (!processedSums.has(sum)) {
            if (isContained(sum)) {
                sums.push(sum);
                processedSums.add(sum);
                leftoverSumValue -= sum.value;
            } else {
                const cell = model.cellAt(i.rowNum, i.colNum);
                leftoverSumCells.push(cell);
            }    
        }
    }
    if (leftoverSumCells.length !== 0) {
        sums.push(new Sum(leftoverSumValue, leftoverSumCells));
    }
    return sums;
};

const newRowOrColumnIterator = (valueOf) => {
    let i = 0;
    return {
        [Symbol.iterator]() { return this; },
        next() {
            if (i < GRID_SIDE_LENGTH) {
                ++i;
                return { value: valueOf(i), done: false };
            } else {
                return { value: GRID_SIDE_LENGTH, done: true };
            }
        }
    }
}

export class Row {
    constructor(rowNum, sums) {
        this.rowNum = rowNum;
        this.sums = sums;
    }

    static createWithLeftoverSum(rowNum, model) {
        return new Row(rowNum, collectSegmentSumsWithLeftover(
            newRowOrColumnIterator(colNum => {
                return { rowNum, colNum };
            }), model, sum => sum.isRowOnlySum));
    }
}

export class Column {
    constructor(colNum, sums) {
        this.colNum = colNum;
        this.sums = sums;
    }

    static createWithLeftoverSum(colNum, model) {
        return new Column(colNum, collectSegmentSumsWithLeftover(
            newRowOrColumnIterator(rowNum => {
                return { rowNum, colNum };
            }), model, sum => sum.isColumnOnlySum));
    }
}

export class Subgrid {
    constructor(subgridNum, sums) {
        this.subgridNum = subgridNum;
        this.sums = sums;
    }

    static createWithLeftoverSum(subgridNum, model) {
        return new Subgrid(subgridNum, collectSegmentSumsWithLeftover(
            this.#newIterator(subgridNum), model, sum => sum.isSubgridOnlySum));
    }

    static #newIterator(subgridNum) {
        let i = 0;
        return {
            [Symbol.iterator]() { return this; },
            next() {
                if (i < GRID_SIDE_LENGTH) {
                    const subgridStartingRowNum = Math.floor((subgridNum - 1) / 3) * 3 + 1;
                    const subgridStartingColNum = ((subgridNum - 1) % 3) * 3 + 1;
                    const rowNum = subgridStartingRowNum + Math.floor(i / 3);
                    const colNum = subgridStartingColNum + i % 3;
                    ++i;
                    return { value: { rowNum, colNum }, done: false };
                } else {
                    return { value: GRID_SIDE_LENGTH, done: true };
                }
            }
        }    
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
                this.sumMatrix[cell.row][cell.col] = sum;
                this.cellMatrix[cell.row][cell.col] = cell;
            }, this);
            this.sums.push(sum);
        }, this);        
    }

    sumAt(row, col) {
        return this.sumMatrix[row][col];
    }

    cellAt(row, col) {
        return this.cellMatrix[row][col];
    }
}
