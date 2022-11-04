import _ from "lodash";
import { GRID_SIDE_LENGTH, ROW_OR_COLUMN_OR_SUBGRID_SUM } from "./problem";

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
    }

    static fromInput(inputSum) {
        return new Sum(inputSum.value, inputSum.cells.map(inputCell => Cell.fromInput(inputCell)));
    }

    get cellCount() {
        return this.cells.length;
    }
}

export class Row {
    constructor(row, sums) {
        this.index = row;
        this.sums = sums;
    }

    static createWithLeftoverSum(row, solver) {
        const sums = [];
        let leftoverSumValue = ROW_OR_COLUMN_OR_SUBGRID_SUM;
        const leftoverSumCells = [];
        let col = 1;
        while (col <= GRID_SIDE_LENGTH) {
            const sum = solver.sumAt(row, col);
            if (sum.isRowOnlySum) {
                sums.push(sum);
                leftoverSumValue -= sum.value;
                col += sum.cellCount;
            } else {
                const cell = solver.cellAt(row, col);
                leftoverSumCells.push(cell);
                col++;
            }
        }
        sums.push(new Sum(leftoverSumValue, leftoverSumCells));
        return new Row(row, sums);
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
        this.rows = _.range(GRID_SIDE_LENGTH).map(row => Row.createWithLeftoverSum(row + 1, this));
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
