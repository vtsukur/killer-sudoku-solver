import * as _ from 'lodash';
import { Cage } from '../../puzzle/cage';
import { Cell, ReadonlyCells } from '../../puzzle/cell';
import { Column } from '../../puzzle/column';
import { Grid } from '../../puzzle/grid';
import { House, HouseIndex } from '../../puzzle/house';
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
    readonly puzzle: Puzzle;
    rowModels: Array<RowModel> = [];
    columnModels: Array<ColumnModel> = [];
    nonetModels: Array<NonetModel> = [];
    houseModels: Array<HouseModel> = [];
    readonly cageModelsMap: Map<string, CageModel> = new Map();
    cellModelsMatrix: Array<Array<CellModel>> = [];
    private readonly _solution: Array<Array<number>> = Grid.newMatrix();
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
        this._cellsToInputCagesMatrix = Grid.newMatrix();
        this._placedNumCount = 0;

        puzzle.cages.forEach(cage => {
            cage.cells.forEach(cell => {
                this._cellsToInputCagesMatrix[cell.row][cell.col] = cage;
            });
        });

        this.rowModels = [];
        this.columnModels = [];
        this.nonetModels = [];
        _.range(House.CELL_COUNT).forEach(i => {
            this.rowModels.push(new RowModel(i, this.collectHouseCells(Row.newCellsIterator(i))));
            this.columnModels.push(new ColumnModel(i, this.collectHouseCells(Column.newCellsIterator(i))));
            this.nonetModels.push(new NonetModel(i, this.collectHouseCells(Nonet.newCellsIterator(i))));
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
        for (const entry of model.cageModelsMap.entries()) {
            this.cageModelsMap.set(entry[0], entry[1].deepCopyWithSameCellModels());
        }

        // copy house models
        this.rowModels = Array(House.CELL_COUNT);
        this.columnModels = Array(House.CELL_COUNT);
        this.nonetModels = Array(House.CELL_COUNT);
        _.range(House.CELL_COUNT).forEach(index => {
            this.rowModels[index] = model.rowModels[index].deepCopyWithoutCageModels();
            this.copyHouseCageMs(model.rowModels[index], this.rowModels[index]);
            this.columnModels[index] = model.columnModels[index].deepCopyWithoutCageModels();
            this.copyHouseCageMs(model.columnModels[index], this.columnModels[index]);
            this.nonetModels[index] = model.nonetModels[index].deepCopyWithoutCageModels();
            this.copyHouseCageMs(model.nonetModels[index], this.nonetModels[index]);
        });
        this.houseModels = [[...this.rowModels], [...this.columnModels], [...this.nonetModels]].flat();

        // copy cell models
        this.cellModelsMatrix = Grid.newMatrix();
        model.cellModelsMatrix.forEach((cellMsRow, row) => {
            cellMsRow.forEach((cellM, col) => {
                this.cellModelsMatrix[row][col] = cellM.deepCopyWithoutCageModels();
                for (const cageM of cellM.withinCageModels) {
                    this.cellModelsMatrix[row][col].addWithinCageModel(this.cageModelsMap.get(cageM.cage.key) as CageModel);
                }
            });
        });

        // rewire cell models to cage models and cage models to cell models
        for (const cageM of this.cageModelsMap.values()) {
            cageM.cellMs.forEach((cellM, index) => {
                cageM.cellMs[index] = this.cellModelAt(cellM.cell.row, cellM.cell.col);
            });
        }

        // copy solution
        model._solution.forEach((row: Array<number>, index: number) => {
            this._solution[index] = [...row];
        });
        this._placedNumCount = model._placedNumCount;

        // no need to copy immutable data, just reference it
        this._cellsToInputCagesMatrix = model._cellsToInputCagesMatrix;

        const validate = function(bool: boolean) {
            if (!bool) throw 'false';
        };
        _.range(House.CELL_COUNT).forEach(row => {
            _.range(House.CELL_COUNT).forEach(col => {
                validate(this.cellModelAt(row, col) !== model.cellModelAt(row, col));

                const cellM = model.cellModelAt(row, col);
                for (const cageM of this.cellModelAt(row, col).withinCageModels) {
                    cageM.cellMs.every((aCellM: CellModel) => validate(aCellM !== cellM));
                }

                const reverseCellM = this.cellModelAt(row, col);
                for (const cageM of model.cellModelAt(row, col).withinCageModels) {
                    cageM.cellMs.every((aCellM: CellModel) => validate(aCellM !== reverseCellM));
                }

            });
        });
    }

    private copyHouseCageMs(sourceM: HouseModel, targetM: HouseModel) {
        sourceM.cageModels.forEach(cageM => {
            targetM.addCageModel(this.cageModelsMap.get(cageM.cage.key) as CageModel);
        });
    }

    private collectHouseCells(iterator: Iterable<Cell>): ReadonlyCells {
        return Array.from(iterator).map((coords: Cell) => Cell.at(coords.row, coords.col));
    }

    registerCage(cage: Cage, canHaveDuplicateNums: boolean) {
        const cageM = new CageModel(cage, cage.cells.map(cell => this.cellModelOf(cell)), canHaveDuplicateNums, this.isDerivedFromInputCage(cage));
        cageM.initialReduce();
        if (cageM.positioningFlags.isWithinRow) {
            this.rowModels[cageM.anyRow()].addCageModel(cageM);
        }
        if (cageM.positioningFlags.isWithinColumn) {
            this.columnModels[cageM.anyColumn()].addCageModel(cageM);
        }
        if (cageM.positioningFlags.isWithinNonet) {
            this.nonetModels[cageM.anyNonet()].addCageModel(cageM);
        }
        cage.cells.forEach((cell: Cell) => {
            this.cellModelOf(cell).addWithinCageModel(cageM);
        });
        this.cageModelsMap.set(cage.key, cageM);
        return cageM;
    }

    private isDerivedFromInputCage(cage: Cage) {
        const inputCage = this.inputCageOf(cage.cells[0]);
        return cage.cells.every(cell => this.inputCageOf(cell) === inputCage);
    }

    unregisterCage(cage: Cage) {
        const cageM = this.cageModelsMap.get(cage.key) as CageModel;
        if (cageM.positioningFlags.isWithinRow) {
            this.rowModels[cageM.anyRow()].removeCageModel(cageM);
        }
        if (cageM.positioningFlags.isWithinColumn) {
            this.columnModels[cageM.anyColumn()].removeCageModel(cageM);
        }
        if (cageM.positioningFlags.isWithinNonet) {
            this.nonetModels[cageM.anyNonet()].removeCageModel(cageM);
        }
        cage.cells.forEach((cell: Cell) => {
            this.cellModelOf(cell).removeWithinCageModel(cageM);
        });
        this.cageModelsMap.delete(cage.key);
    }

    placeNum(cell: Cell, num: number) {
        const cellM = this.cellModelOf(cell);
        cellM.placeNum(num);

        this._solution[cell.row][cell.col] = num;
        this._placedNumCount++;
    }

    applySolution(solution: Array<Array<number>>) {
        _.range(House.CELL_COUNT).forEach(row => {
            _.range(House.CELL_COUNT).forEach(col => {
                this.placeNum(Cell.at(row, col), solution[row][col]);
            });
        });
    }

    get isSolved() {
        return this._placedNumCount === Grid.CELL_COUNT;
    }

    get solution() {
        return this._solution;
    }

    cellModelOf(cell: Cell) {
        return this.cellModelAt(cell.row, cell.col);
    }

    cellModelAt(row: HouseIndex, col: HouseIndex) {
        return this.cellModelsMatrix[row][col];
    }

    private inputCageOf(cell: Cell) {
        return this._cellsToInputCagesMatrix[cell.row][cell.col];
    }

    rowModel(index: number) {
        return this.rowModels[index];
    }

    columnModel(index: number) {
        return this.columnModels[index];
    }

    nonetModel(index: number) {
        return this.nonetModels[index];
    }

    deepCopy() {
        return new MasterModel(this);
    }
}
