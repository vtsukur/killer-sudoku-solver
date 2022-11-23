import _ from 'lodash';
import { Grid } from '../../problem/grid';
import { House } from '../../problem/house';
import { CageSolver } from './elements/cageSolver';
import { CellModel } from './elements/cellModel';
import { ColumnSolver } from './elements/columnSolver';
import { NonetSolver } from './elements/nonetSolver';
import { RowSolver } from './elements/rowSolver';

export class MasterModel {
    #solution;
    #placedNumCount;

    constructor(problem) {
        this.problem = problem;
        this.cagesSolversMap = new Map();
        this.cellsMatrix = Grid.newMatrix();
        this.#solution = Grid.newMatrix();
        this.#placedNumCount = 0;

        problem.cages.forEach(cage => {
            cage.cells.forEach(cell => {
                this.cellsMatrix[cell.row][cell.col] = cell;
            });
        });

        this.rowSolvers = [];
        this.columnSolvers = [];
        this.nonetSolvers = [];
        _.range(House.SIZE).forEach(i => {
            this.rowSolvers.push(new RowSolver(i, this.#collectHouseCells(RowSolver.iteratorFor(i))));
            this.columnSolvers.push(new ColumnSolver(i, this.#collectHouseCells(ColumnSolver.iteratorFor(i))));
            this.nonetSolvers.push(new NonetSolver(i, this.#collectHouseCells(NonetSolver.iteratorFor(i))));
        });

        this.cellSolversMatrix = Grid.newMatrix();
        const cells = problem.cages.map(cage => cage.cells).flat();
        cells.forEach(cell => {
            this.cellSolversMatrix[cell.row][cell.col] = new CellModel({
                cell,
                rowSolver: this.rowSolvers[cell.row],
                columnSolver: this.columnSolvers[cell.col],
                nonetSolver: this.nonetSolvers[cell.nonet]
            });
        });

        problem.cages.forEach(cage => {
            this.registerCage(cage);
        });

        this.houseSolvers = [[...this.rowSolvers], [...this.columnSolvers], [...this.nonetSolvers]].flat();
    }

    #collectHouseCells(iterator) {
        return Array.from(iterator).map(coords => this.cellAt(coords.row, coords.col));
    }

    registerCage(cage) {
        const cageSolver = new CageSolver(cage, cage.cells.map(cell => this.cellSolverOf(cell)));
        if (cageSolver.isWithinRow) {
            this.rowSolvers[cageSolver.anyRow()].addCage(cage);
        }
        if (cageSolver.isWithinColumn) {
            this.columnSolvers[cageSolver.anyColumnIdx()].addCage(cage);
        }
        if (cageSolver.isWithinNonet) {
            this.nonetSolvers[cageSolver.anySubgridIdx()].addCage(cage);
        }
        cage.cells.forEach(cell => {
            this.cellSolverOf(cell).addWithinCageSolver(cageSolver);
        });
        this.cagesSolversMap.set(cage.key, cageSolver);
    }

    unregisterCage(cage) {
        const cageSolver = this.cagesSolversMap.get(cage.key);
        if (cageSolver.isWithinRow) {
            this.rowSolvers[cageSolver.anyRow()].removeCage(cage);
        }
        if (cageSolver.isWithinColumn) {
            this.columnSolvers[cageSolver.anyColumnIdx()].removeCage(cage);
        }
        if (cageSolver.isWithinNonet) {
            this.nonetSolvers[cageSolver.anySubgridIdx()].removeCage(cage);
        }
        cage.cells.forEach(cell => {
            this.cellSolverOf(cell).removeWithinCageSolver(cageSolver);
        });
        this.cagesSolversMap.delete(cage.key);
    }

    placeNum(cell, num) {
        const cellModel = this.cellSolverOf(cell);
        cellModel.placeNum(num);

        this.#solution[cell.row][cell.col] = num;
        this.#placedNumCount++;
    }

    get placedNumCount() {
        return this.#placedNumCount;
    }

    get solution() {
        return this.#solution;
    }

    cellAt(rowIds, col) {
        return this.cellsMatrix[rowIds][col];
    }

    cellSolverOf(cell) {
        return this.cellSolverAt(cell.row, cell.col);
    }

    cellSolverAt(row, col) {
        return this.cellSolversMatrix[row][col];
    }

    rowSolver(idx) {
        return this.rowSolvers[idx];
    }

    columnSolver(idx) {
        return this.columnSolvers[idx];
    }

    nonetSolver(idx) {
        return this.nonetSolvers[idx];
    }
}
