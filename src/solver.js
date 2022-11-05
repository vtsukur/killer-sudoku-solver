import _ from "lodash";
import { UNIQUE_SEGMENT_LENGTH, UNIQUE_SEGMENT_SUM, SUBGRID_SIDE_LENGTH } from "./problem";

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

export class CellDeterminator {
    constructor({ cell, row, column, subgrid, withinSums }) {
        this.cell = cell;
        this.row = row;
        this.column = column;
        this.subgrid = subgrid;
        this.withinSums = new Set(withinSums);

        this.numberOptions = this.constructor.#newAllNumbers();
        this.placedNumber = undefined;
    }

    static #newAllNumbers() {
        return new Set(_.range(UNIQUE_SEGMENT_LENGTH).map(i => i + 1));
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

// const collectSegmentSumsWithLeftover = (iterator, model, isContainedFn) => {
//     const sums = [];
//     let leftoverSumValue = UNIQUE_SEGMENT_SUM;
//     const leftoverSumCells = [];
//     const processedSums = new Set();
//     for (const i of iterator) {
//         const sum = model.inputSumAt(i.rowIdx, i.colIdx);
//         if (!processedSums.has(sum)) {
//             if (isContainedFn(sum)) {
//                 sums.push(sum);
//                 processedSums.add(sum);
//                 leftoverSumValue -= sum.value;
//             } else {
//                 const cell = model.cellAt(i.rowIdx, i.colIdx);
//                 leftoverSumCells.push(cell);
//             }    
//         }
//     }
//     let leftoverSum;
//     if (leftoverSumCells.length !== 0) {
//         sums.push(leftoverSum = new Sum(leftoverSumValue, leftoverSumCells));
//     }
//     return { sums, leftoverSum };
// };

export class Row {
    constructor(idx, sums) {
        this.idx = idx;
        this.sums = sums;
    }
}

export class Column {
    constructor(idx, sums) {
        this.idx = idx;
        this.sums = sums;
    }
}

export class Subgrid {
    constructor(idx, sums) {
        this.idx = idx;
        this.sums = sums;
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
        problem.sums.forEach(inputSum => {
            const sum = Sum.fromInput(inputSum);
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
        return new Row(idx, this.#collectSegmentOnlySums(
            this.constructor.#newUniqueSegmentIterator(colIdx => {
                return { rowIdx: idx, colIdx };
            }), sum => sum.isWithinRow));
    }

    initColumn(idx) {
        return new Column(idx, this.#collectSegmentOnlySums(
            this.constructor.#newUniqueSegmentIterator(rowIdx => {
                return { rowIdx, colIdx: idx };
            }), sum => sum.isWithinColumn));
    }

    initSubgrid(idx) {
        return new Subgrid(idx, this.#collectSegmentOnlySums(
            this.constructor.#newUniqueSegmentIterator(i => {
                const subgridStartingRowIdx = Math.floor(idx / SUBGRID_SIDE_LENGTH) * SUBGRID_SIDE_LENGTH;
                const subgridStartingColIdx = (idx % SUBGRID_SIDE_LENGTH) * SUBGRID_SIDE_LENGTH;
                const rowIdx = subgridStartingRowIdx + Math.floor(i / SUBGRID_SIDE_LENGTH);
                const colIdx = subgridStartingColIdx + i % SUBGRID_SIDE_LENGTH;
                return { rowIdx, colIdx };
            }
        ), sum => sum.isWithinSubgrid));
    }

    #collectSegmentOnlySums(iterator, isWithinSegmentFn) {
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

    static #newUniqueSegmentIterator(valueOfFn) {
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
    
    inputSumAt(rowIdx, colIdx) {
        return this.inputSumsMatrix[rowIdx][colIdx];
    }

    cellAt(rowIds, colIdx) {
        return this.cellsMatrix[rowIds][colIdx];
    }
}
