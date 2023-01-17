import * as _ from 'lodash';
import { Cage } from '../../puzzle/cage';
import { Cell } from '../../puzzle/cell';
import { Column } from '../../puzzle/column';
import { Grid } from '../../puzzle/grid';
import { House } from '../../puzzle/house';
import { Nonet } from '../../puzzle/nonet';
import { Puzzle } from '../../puzzle/puzzle';
import { Row } from '../../puzzle/row';
import { CageModel } from './elements/cageModel';
import { CellModel } from './elements/cellModel';
import { ColumnModel } from './elements/columnModel';
import { HouseModel } from './elements/houseModel';
import { NonetModel } from './elements/nonetModel';
import { RowModel } from './elements/rowModel';

export class MasterModel {
    puzzle: Puzzle;
    rowModels: Array<RowModel> = [];
    columnModels: Array<ColumnModel> = [];
    nonetModels: Array<NonetModel> = [];
    houseModels: Array<HouseModel> = [];
    cellsMatrix: Array<Array<Cell>> = [];
    cageModelsMap: Map<string, CageModel> = new Map();
    cellModelsMatrix: Array<Array<CellModel>> = [];
    private _solution: Array<Array<number>> = [];
    private _placedNumCount = 0;
    private _cellsToInputCagesMatrix: Array<Array<Cage>> = [];

    constructor(puzzleOrMasterModel: Puzzle | MasterModel) {
        if (puzzleOrMasterModel instanceof Puzzle) {
            this.puzzle = puzzleOrMasterModel;
            this.initWithPuzzle(puzzleOrMasterModel);
        } else {
            this.puzzle = puzzleOrMasterModel.puzzle;
            this.initWithMasterModel(puzzleOrMasterModel);
        }
    }

    private initWithPuzzle(puzzle: Puzzle) {
        this.cageModelsMap = new Map();
        this.cellsMatrix = Grid.newMatrix();
        this._cellsToInputCagesMatrix = Grid.newMatrix();
        this._solution = Grid.newMatrix();
        this._placedNumCount = 0;

        puzzle.cages.forEach(cage => {
            cage.cells.forEach(cell => {
                this.cellsMatrix[cell.row][cell.col] = cell;
                this._cellsToInputCagesMatrix[cell.row][cell.col] = cage;
            });
        });

        this.rowModels = [];
        this.columnModels = [];
        this.nonetModels = [];
        _.range(House.SIZE).forEach(i => {
            this.rowModels.push(new RowModel(i, this.collectHouseCells(Row.cellsIterator(i))));
            this.columnModels.push(new ColumnModel(i, this.collectHouseCells(Column.cellsIterator(i))));
            this.nonetModels.push(new NonetModel(i, this.collectHouseCells(Nonet.cellsIterator(i))));
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

    private initWithMasterModel(model: MasterModel) {
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
            this.copyHouseCageModels(model.rowModels[idx], this.rowModels[idx]);
            this.columnModels[idx] = model.columnModels[idx].deepCopyWithoutCageModels();
            this.copyHouseCageModels(model.columnModels[idx], this.columnModels[idx]);
            this.nonetModels[idx] = model.nonetModels[idx].deepCopyWithoutCageModels();
            this.copyHouseCageModels(model.nonetModels[idx], this.nonetModels[idx]);
        });
        this.houseModels = [[...this.rowModels], [...this.columnModels], [...this.nonetModels]].flat();

        // copy cell models
        this.cellModelsMatrix = Grid.newMatrix();
        model.cellModelsMatrix.forEach((cellModelsRow, row) => {
            cellModelsRow.forEach((cellM, col) => {
                this.cellModelsMatrix[row][col] = cellM.deepCopyWithoutCageModels();
                for (const cageM of cellM.withinCageModels) {
                    this.cellModelsMatrix[row][col].addWithinCageModel(this.cageModelsMap.get(cageM.cage.key) as CageModel);
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
        this._solution = Grid.newMatrix();
        model._solution.forEach((row: Array<number>, idx: number) => {
            this._solution[idx] = [...row];
        });
        this._placedNumCount = model._placedNumCount;

        // no need to copy immutable data, just reference it
        this.cellsMatrix = model.cellsMatrix;
        this._cellsToInputCagesMatrix = model._cellsToInputCagesMatrix;

        const validate = function(bool: boolean) {
            if (!bool) throw 'false';
        };
        _.range(House.SIZE).forEach(row => {
            _.range(House.SIZE).forEach(col => {
                validate(this.cellModelAt(row, col) !== model.cellModelAt(row, col));

                const cellM = model.cellModelAt(row, col);
                for (const cageM of this.cellModelAt(row, col).withinCageModels) {
                    cageM.cellModels.every((aCellM: CellModel) => validate(aCellM !== cellM));
                }

                const reverseCellM = this.cellModelAt(row, col);
                for (const cageM of model.cellModelAt(row, col).withinCageModels) {
                    cageM.cellModels.every((aCellM: CellModel) => validate(aCellM !== reverseCellM));
                }

            });    
        });
    }

    private copyHouseCageModels(sourceM: HouseModel, targetM: HouseModel) {
        sourceM.cageModels.forEach(cageM => {
            targetM.addCageModel(this.cageModelsMap.get(cageM.cage.key) as CageModel);
        });
    }

    private collectHouseCells(iterator: Iterable<Cell>): Array<Cell> {
        return Array.from(iterator).map((coords: Cell) => this.cellAt(coords.row, coords.col));
    }

    registerCage(cage: Cage, canHaveDuplicateNums: boolean) {
        const cageModel = new CageModel(cage, cage.cells.map(cell => this.cellModelOf(cell)), canHaveDuplicateNums, this.isDerivedFromInputCage(cage));
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
        cage.cells.forEach((cell: Cell) => {
            this.cellModelOf(cell).addWithinCageModel(cageModel);
        });
        this.cageModelsMap.set(cage.key, cageModel);
        return cageModel;
    }

    private isDerivedFromInputCage(cage: Cage) {
        const inputCage = this.inputCageOf(cage.cells[0]);
        return cage.cells.every(cell => this.inputCageOf(cell) === inputCage);
    }

    unregisterCage(cage: Cage) {
        const cageModel = this.cageModelsMap.get(cage.key) as CageModel;
        if (cageModel.positioningFlags.isWithinRow) {
            this.rowModels[cageModel.anyRow()].removeCageModel(cageModel);
        }
        if (cageModel.positioningFlags.isWithinColumn) {
            this.columnModels[cageModel.anyColumn()].removeCageModel(cageModel);
        }
        if (cageModel.positioningFlags.isWithinNonet) {
            this.nonetModels[cageModel.anyNonet()].removeCageModel(cageModel);
        }
        cage.cells.forEach((cell: Cell) => {
            this.cellModelOf(cell).removeWithinCageModel(cageModel);
        });
        this.cageModelsMap.delete(cage.key);
    }

    placeNum(cell: Cell, num: number) {
        const cellModel = this.cellModelOf(cell);
        cellModel.placeNum(num);

        this._solution[cell.row][cell.col] = num;
        this._placedNumCount++;
    }

    applySolution(solution: Array<Array<number>>) {
        _.range(House.SIZE).forEach(row => {
            _.range(House.SIZE).forEach(col => {
                this.placeNum(this.cellsMatrix[row][col], solution[row][col]);
            });
        });
    }

    get isSolved() {
        return this._placedNumCount === Grid.CELL_COUNT;
    }

    get solution() {
        return this._solution;
    }

    cellAt(row: number, col: number) {
        return this.cellsMatrix[row][col];
    }

    cellModelOf(cell: Cell) {
        return this.cellModelAt(cell.row, cell.col);
    }

    cellModelAt(row: number, col: number) {
        return this.cellModelsMatrix[row][col];
    }

    private inputCageOf(cell: Cell) {
        return this._cellsToInputCagesMatrix[cell.row][cell.col];
    }

    rowModel(idx: number) {
        return this.rowModels[idx];
    }

    columnModel(idx: number) {
        return this.columnModels[idx];
    }

    nonetModel(idx: number) {
        return this.nonetModels[idx];
    }

    deepCopy() {
        return new MasterModel(this);
    }
}
