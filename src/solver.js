import _ from "lodash";
import { GRID_SIDE_LENGTH, UNIQUE_SEGMENT_SUM } from "./problem";

const newMatrix = () => new Array(GRID_SIDE_LENGTH + 1).fill(undefined).map(() => new Array(GRID_SIDE_LENGTH + 1));

export class Cell {
    constructor(row, col) {
        this.row = row;
        this.col = col;
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
    let next = iterator.next();
    while (!next.done) {
        const i = next.value;
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
        next = iterator.next();
    }
    sums.push(new Sum(leftoverSumValue, leftoverSumCells));
    return sums;
};

export class Row {
    constructor(rowNum, sums) {
        this.rowNum = rowNum;
        this.sums = sums;
    }

    static createWithLeftoverSum(rowNum, model) {
        return new Row(rowNum, collectSegmentSumsWithLeftover(
            this.#newColIterator(rowNum), model, sum => sum.isRowOnlySum));
    }

    static #newColIterator(rowNum) {
        let colNum = 0;
        return {
            next() {
                if (colNum < GRID_SIDE_LENGTH) {
                    ++colNum;
                    return { value: { rowNum, colNum }, done: false };
                } else {
                    return { value: GRID_SIDE_LENGTH, done: true };
                }
            }
        }
    }
}

export class Column {
    constructor(colNum, sums) {
        this.colNum = colNum;
        this.sums = sums;
    }

    static createWithLeftoverSum(colNum, model) {
        return new Column(colNum, collectSegmentSumsWithLeftover(
            this.#newRowIterator(colNum), model, sum => sum.isColumnOnlySum));
    }

    static #newRowIterator(colNum) {
        let rowNum = 0;
        return {
            next() {
                if (rowNum < GRID_SIDE_LENGTH) {
                    ++rowNum;
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

    #prepare() {
        this.rows = _.range(GRID_SIDE_LENGTH).map(rowIndex => Row.createWithLeftoverSum(rowIndex + 1, this));
        this.columns = _.range(GRID_SIDE_LENGTH).map(colIndex => Column.createWithLeftoverSum(colIndex + 1, this));
    }

    solve() {
        this.#prepare();
    }

    sumAt(row, col) {
        return this.sumMatrix[row][col];
    }

    cellAt(row, col) {
        return this.cellMatrix[row][col];
    }
}
