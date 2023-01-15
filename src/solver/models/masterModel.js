import _ from 'lodash';
import { Column } from '../../puzzle/column';
import { Grid } from '../../puzzle/grid';
import { House } from '../../puzzle/house';
import { Nonet } from '../../puzzle/nonet';
import { Puzzle } from '../../puzzle/puzzle';
import { Row } from '../../puzzle/row';
import { CageModel } from './elements/cageModel';
import { CellModel } from './elements/cellModel';
import { ColumnModel } from './elements/columnModel';
import { NonetModel } from './elements/nonetModel';
import { RowModel } from './elements/rowModel';

export class MasterModel {
    #solution;
    #placedNumCount;
    #cellsToInputCagesMatrix;

    constructor(puzzleOrMasterModel) {
        if (puzzleOrMasterModel instanceof Puzzle) {
            this.#initWithPuzzle(puzzleOrMasterModel);
        } else {
            this.#initWithMasterModel(puzzleOrMasterModel);
        }
    }

    #initWithPuzzle(puzzle) {
        this.puzzle = puzzle;
        this.cageModelsMap = new Map();
        this.cellsMatrix = Grid.newMatrix();
        this.#cellsToInputCagesMatrix = Grid.newMatrix();
        this.#solution = Grid.newMatrix();
        this.#placedNumCount = 0;

        puzzle.cages.forEach(cage => {
            cage.cells.forEach(cell => {
                this.cellsMatrix[cell.row][cell.col] = cell;
                this.#cellsToInputCagesMatrix[cell.row][cell.col] = cage;
            });
        });

        this.rowModels = [];
        this.columnModels = [];
        this.nonetModels = [];
        _.range(House.SIZE).forEach(i => {
            this.rowModels.push(new RowModel(i, this.#collectHouseCells(Row.cellsIterator(i))));
            this.columnModels.push(new ColumnModel(i, this.#collectHouseCells(Column.cellsIterator(i))));
            this.nonetModels.push(new NonetModel(i, this.#collectHouseCells(Nonet.cellsIterator(i))));
        });

        this.cellModelsMatrix = Grid.newMatrix();
        const cells = puzzle.cages.map(cage => cage.cells).flat();
        cells.forEach(cell => {
            this.cellModelsMatrix[cell.row][cell.col] = new CellModel(cell);
        });

        puzzle.cages.forEach(cage => {
            this.registerCage(cage, false);
        });

        this.houseModels = [[...this.rowModels], [...this.columnModels], [...this.nonetModels]].flat();
    }

    #initWithMasterModel(model) {
        this.puzzle = model.puzzle;

        // copy cage models
        this.cageModelsMap = new Map();
        for (const entry of model.cageModelsMap.entries()) {
            this.cageModelsMap.set(entry[0], entry[1].deepCopyWithSameCellModels());
        }

        // copy house models
        this.rowModels = Array(House.SIZE);
        this.columnModels = Array(House.SIZE);
        this.nonetModels = Array(House.SIZE);
        _.range(House.SIZE).forEach(idx => {
            this.rowModels[idx] = model.rowModels[idx].deepCopyWithoutCageModels();
            this.#copyHouseCageModels(model.rowModels[idx], this.rowModels[idx]);
            this.columnModels[idx] = model.columnModels[idx].deepCopyWithoutCageModels();
            this.#copyHouseCageModels(model.columnModels[idx], this.columnModels[idx]);
            this.nonetModels[idx] = model.nonetModels[idx].deepCopyWithoutCageModels();
            this.#copyHouseCageModels(model.nonetModels[idx], this.nonetModels[idx]);
        });
        this.houseModels = [[...this.rowModels], [...this.columnModels], [...this.nonetModels]].flat();

        // copy cell models
        this.cellModelsMatrix = Grid.newMatrix();
        model.cellModelsMatrix.forEach((cellModelsRow, row) => {
            cellModelsRow.forEach((cellM, col) => {
                this.cellModelsMatrix[row][col] = cellM.deepCopyWithoutCageModels();
                for (const cageM of cellM.withinCageModels) {
                    this.cellModelsMatrix[row][col].addWithinCageModel(this.cageModelsMap.get(cageM.cage.key));
                }
            });
        });

        // rewire cell models to cage models and cage models to cell models
        for (const cageM of this.cageModelsMap.values()) {
            cageM.cellModels.forEach((cellM, idx) => {
                cageM.cellModels[idx] = this.cellModelAt(cellM.cell.row, cellM.cell.col);
            });
        }

        // copy solution
        this.#solution = Grid.newMatrix();
        model.#solution.forEach((row, idx) => {
            this.#solution[idx] = [...row];
        });
        this.#placedNumCount = model.#placedNumCount;

        // no need to copy immutable data, just reference it
        this.cellsMatrix = model.cellsMatrix;
        this.#cellsToInputCagesMatrix = model.#cellsToInputCagesMatrix;

        const validate = function(bool) {
            if (!bool) throw 'false';
        };
        _.range(House.SIZE).forEach(row => {
            _.range(House.SIZE).forEach(col => {
                validate(this.cellModelAt(row, col) !== model.cellModelAt(row, col));

                const cellM = model.cellModelAt(row, col);
                for (const cageM of this.cellModelAt(row, col).withinCageModels) {
                    cageM.cellModels.every(aCellM => validate(aCellM !== cellM));
                }

                const reverseCellM = this.cellModelAt(row, col);
                for (const cageM of model.cellModelAt(row, col).withinCageModels) {
                    cageM.cellModels.every(aCellM => validate(aCellM !== reverseCellM));
                }

            });    
        });
    }

    #copyHouseCageModels(sourceM, targetM) {
        sourceM.cageModels.forEach(cageM => {
            targetM.addCageModel(this.cageModelsMap.get(cageM.cage.key));
        });
    }

    #collectHouseCells(iterator) {
        return Array.from(iterator).map(coords => this.cellAt(coords.row, coords.col));
    }

    registerCage(cage, canHaveDuplicateNums) {
        const cageModel = new CageModel(cage, cage.cells.map(cell => this.cellModelOf(cell)), canHaveDuplicateNums, this.#isDerivedFromInputCage(cage));
        cageModel.initialReduce();
        if (cageModel.positioningFlags.isWithinRow) {
            this.rowModels[cageModel.anyRow()].addCageModel(cageModel);
        }
        if (cageModel.positioningFlags.isWithinColumn) {
            this.columnModels[cageModel.anyColumn()].addCageModel(cageModel);
        }
        if (cageModel.positioningFlags.isWithinNonet) {
            this.nonetModels[cageModel.anyNonet()].addCageModel(cageModel);
        }
        cage.cells.forEach(cell => {
            this.cellModelOf(cell).addWithinCageModel(cageModel);
        });
        this.cageModelsMap.set(cage.key, cageModel);
        return cageModel;
    }

    #isDerivedFromInputCage(cage) {
        const inputCage = this.#inputCageOf(cage.cells[0]);
        return cage.cells.every(cell => this.#inputCageOf(cell) === inputCage);
    }

    unregisterCage(cage) {
        const cageModel = this.cageModelsMap.get(cage.key);
        if (cageModel.positioningFlags.isWithinRow) {
            this.rowModels[cageModel.anyRow()].removeCageModel(cageModel);
        }
        if (cageModel.positioningFlags.isWithinColumn) {
            this.columnModels[cageModel.anyColumn()].removeCageModel(cageModel);
        }
        if (cageModel.positioningFlags.isWithinNonet) {
            this.nonetModels[cageModel.anyNonet()].removeCageModel(cageModel);
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

    applySolution(solution) {
        _.range(House.SIZE).forEach(row => {
            _.range(House.SIZE).forEach(col => {
                this.placeNum(this.cellsMatrix[row][col], solution[row][col]);
            });
        });
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

    #inputCageOf(cell) {
        return this.#cellsToInputCagesMatrix[cell.row][cell.col];
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

    deepCopy() {
        return new MasterModel(this);
    }
}
