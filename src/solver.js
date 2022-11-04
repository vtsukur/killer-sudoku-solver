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

    get cellCount() {
        return this.cells.length;
    }
}

const collectSumsWithLeftover = (sumAt, cellAt, isContained) => {
    const sums = [];
    let leftoverSumValue = UNIQUE_SEGMENT_SUM;
    const leftoverSumCells = [];
    let i = 1;
    while (i <= GRID_SIDE_LENGTH) {
        const sum = sumAt(i);
        if (isContained(sum)) {
            sums.push(sum);
            leftoverSumValue -= sum.value;
            i += sum.cellCount;
        } else {
            const cell = cellAt(i);
            leftoverSumCells.push(cell);
            i++;
        }
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
        return new Row(rowNum, collectSumsWithLeftover(
            colNum => model.sumAt(rowNum, colNum),
            colNum => model.cellAt(rowNum, colNum),
            sum => sum.isRowOnlySum));
    }
}

export class Column {
    constructor(colNum, sums) {
        this.colNum = colNum;
        this.sums = sums;
    }

    static createWithLeftoverSum(colNum, model) {
        return new Column(colNum, collectSumsWithLeftover(
            rowNum => model.sumAt(rowNum, colNum),
            rowNum => model.cellAt(rowNum, colNum),
            sum => sum.isColumnOnlySum));
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
        this.rows = _.range(GRID_SIDE_LENGTH).map(rowNum => Row.createWithLeftoverSum(rowNum + 1, this));
        this.columns = _.range(GRID_SIDE_LENGTH).map(colNum => Column.createWithLeftoverSum(colNum + 1, this));
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
