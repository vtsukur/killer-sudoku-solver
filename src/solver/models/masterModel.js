import _ from 'lodash';
import { Grid } from '../../problem/grid';
import { House } from '../../problem/house';
import { CageModel } from './elements/cageModel';
import { CellModel } from './elements/cellModel';
import { ColumnModel } from './elements/columnModel';
import { NonetModel } from './elements/nonetModel';
import { RowModel } from './elements/rowModel';

export class MasterModel {
    #solution;
    #placedNumCount;

    constructor(problem) {
        this.problem = problem;
        this.cageModelsMap = new Map();
        this.cellsMatrix = Grid.newMatrix();
        this.#solution = Grid.newMatrix();
        this.#placedNumCount = 0;

        problem.cages.forEach(cage => {
            cage.cells.forEach(cell => {
                this.cellsMatrix[cell.row][cell.col] = cell;
            });
        });

        this.rowModels = [];
        this.columnModels = [];
        this.nonetModels = [];
        _.range(House.SIZE).forEach(i => {
            this.rowModels.push(new RowModel(i, this.#collectHouseCells(RowModel.iteratorFor(i))));
            this.columnModels.push(new ColumnModel(i, this.#collectHouseCells(ColumnModel.iteratorFor(i))));
            this.nonetModels.push(new NonetModel(i, this.#collectHouseCells(NonetModel.iteratorFor(i))));
        });

        this.cellModelsMatrix = Grid.newMatrix();
        const cells = problem.cages.map(cage => cage.cells).flat();
        cells.forEach(cell => {
            this.cellModelsMatrix[cell.row][cell.col] = new CellModel(cell);
        });

        problem.cages.forEach(cage => {
            this.registerCage(cage, false);
        });

        this.houseModels = [[...this.rowModels], [...this.columnModels], [...this.nonetModels]].flat();
    }

    #collectHouseCells(iterator) {
        return Array.from(iterator).map(coords => this.cellAt(coords.row, coords.col));
    }

    registerCage(cage, canHaveDuplicateNums) {
        const cageModel = new CageModel(cage, cage.cells.map(cell => this.cellModelOf(cell)), canHaveDuplicateNums);
        cageModel.initialReduce();
        if (cageModel.isWithinRow) {
            this.rowModels[cageModel.anyRow()].addCageModel(cageModel);
        }
        if (cageModel.isWithinColumn) {
            this.columnModels[cageModel.anyColumnIdx()].addCageModel(cageModel);
        }
        if (cageModel.isWithinNonet) {
            this.nonetModels[cageModel.anySubgridIdx()].addCageModel(cageModel);
        }
        cage.cells.forEach(cell => {
            this.cellModelOf(cell).addWithinCageModel(cageModel);
        });
        this.cageModelsMap.set(cage.key, cageModel);
    }

    unregisterCage(cage) {
        const cageModel = this.cageModelsMap.get(cage.key);
        if (cageModel.isWithinRow) {
            this.rowModels[cageModel.anyRow()].removeCageModel(cageModel);
        }
        if (cageModel.isWithinColumn) {
            this.columnModels[cageModel.anyColumnIdx()].removeCageModel(cageModel);
        }
        if (cageModel.isWithinNonet) {
            this.nonetModels[cageModel.anySubgridIdx()].removeCageModel(cageModel);
        }
        cage.cells.forEach(cell => {
            this.cellModelOf(cell).removeWithinCageModel(cageModel);
        });
        this.cageModelsMap.delete(cage.key);
    }

    placeNum(cell, num) {
        const cellModel = this.cellModelOf(cell);
        cellModel.placeNum(num);

        this.#solution[cell.row][cell.col] = num;
        this.#placedNumCount++;
    }

    get isSolved() {
        return this.#placedNumCount === Grid.CELL_COUNT;
    }

    get solution() {
        return this.#solution;
    }

    cellAt(rowIds, col) {
        return this.cellsMatrix[rowIds][col];
    }

    cellModelOf(cell) {
        return this.cellModelAt(cell.row, cell.col);
    }

    cellModelAt(row, col) {
        return this.cellModelsMatrix[row][col];
    }

    rowModel(idx) {
        return this.rowModels[idx];
    }

    columnModel(idx) {
        return this.columnModels[idx];
    }

    nonetModel(idx) {
        return this.nonetModels[idx];
    }
}
