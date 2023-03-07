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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GenericEventHandler = (...args: any[]) => void;

// eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-unused-vars
export interface MasterModelEvent<EventHandler extends GenericEventHandler> {
    readonly key: string;
}

export type CageRegisteredEventHandler = (cageModel: CageModel, MasterModel: MasterModel) => void;
export type CageUnregisteredEventHandler = (cageModel: CageModel, MasterModel: MasterModel) => void;

class CageRegisteredEvent implements MasterModelEvent<CageRegisteredEventHandler> {
    readonly key = 'CAGE_REGISTERED';
}
class CageUnregisteredEvent implements MasterModelEvent<CageRegisteredEventHandler> {
    readonly key = 'CAGE_UNREGISTERED';
}

export class MasterModelEvents {
    static readonly CAGE_REGISTERED = new CageRegisteredEvent();
    static readonly CAGE_UNREGISTERED = new CageUnregisteredEvent();
    static newEventHandlersMap(): Map<string, Set<GenericEventHandler>> {
        const map = new Map<string, Set<GenericEventHandler>>();
        map.set(this.CAGE_REGISTERED.key, new Set());
        map.set(this.CAGE_UNREGISTERED.key, new Set());
        return map;
    }
}

export class MasterModel {

    readonly puzzle: Puzzle;
    readonly rowModels: Array<RowModel> = new Array(House.COUNT);
    readonly columnModels: Array<ColumnModel> = new Array(House.COUNT);
    readonly nonetModels: Array<NonetModel> = new Array(House.COUNT);
    readonly houseModels: Array<HouseModel>;
    readonly cageModelsMap: Map<string, CageModel> = new Map();
    readonly cellModelsMatrix: Array<Array<CellModel>> = Grid.newMatrix();

    private readonly _solution: Array<Array<number>> = Grid.newMatrix();
    private _placedNumCount = 0;
    private readonly _cellsToInputCagesMatrix: Array<Array<Cage>>;
    private readonly _eventHandlers: Map<string, Set<GenericEventHandler>> = MasterModelEvents.newEventHandlersMap();

    constructor(puzzleOrMasterModel: Puzzle | MasterModel) {
        if (puzzleOrMasterModel instanceof Puzzle) {
            this.puzzle = puzzleOrMasterModel;
            this._cellsToInputCagesMatrix = Grid.newMatrix();
            this.initWithPuzzle(puzzleOrMasterModel);
        } else {
            this.puzzle = puzzleOrMasterModel.puzzle;
            this._cellsToInputCagesMatrix = puzzleOrMasterModel._cellsToInputCagesMatrix;
            this.initWithMasterModel(puzzleOrMasterModel);
        }
        this.houseModels = [[...this.rowModels], [...this.columnModels], [...this.nonetModels]].flat();
    }

    private initWithPuzzle(puzzle: Puzzle) {
        this._placedNumCount = 0;

        puzzle.cages.forEach(cage => {
            cage.cells.forEach(cell => {
                this._cellsToInputCagesMatrix[cell.row][cell.col] = cage;
            });
        });

        _.range(House.CELL_COUNT).forEach(i => {
            this.rowModels[i] = new RowModel(i, Row.CELLS[i]);
            this.columnModels[i] = new ColumnModel(i, Column.CELLS[i]);
            this.nonetModels[i] = new NonetModel(i, this.collectHouseCells(Nonet.newCellsIterator(i)));
        });

        const cells = puzzle.cages.map(cage => cage.cells).flat();
        cells.forEach(cell => {
            this.cellModelsMatrix[cell.row][cell.col] = new CellModel(cell);
        });

        puzzle.cages.forEach(cage => {
            this.registerCage(cage, false);
        });
    }

    private initWithMasterModel(model: MasterModel) {
        // copy cage models
        for (const entry of model.cageModelsMap.entries()) {
            this.cageModelsMap.set(entry[0], entry[1].deepCopyWithSameCellModels());
        }

        // copy house models
        _.range(House.CELL_COUNT).forEach(index => {
            this.rowModels[index] = model.rowModels[index].deepCopyWithoutCageModels();
            this.copyHouseCageMs(model.rowModels[index], this.rowModels[index]);
            this.columnModels[index] = model.columnModels[index].deepCopyWithoutCageModels();
            this.copyHouseCageMs(model.columnModels[index], this.columnModels[index]);
            this.nonetModels[index] = model.nonetModels[index].deepCopyWithoutCageModels();
            this.copyHouseCageMs(model.nonetModels[index], this.nonetModels[index]);
        });

        // copy cell models
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
        const cageM = new CageModel(cage, cage.cells.map(cell => this.cellModelOf(cell)), canHaveDuplicateNums);
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
        this.onCageRegisteredEvent(cageM);
        return cageM;
    }

    isDerivedFromInputCage(cells: ReadonlyCells) {
        const inputCage = this.inputCageOf(cells[0]);
        return cells.every(cell => this.inputCageOf(cell) === inputCage);
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
        this.onCageUnregisteredEvent(cageM);
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

    hasCage(cage: Cage) {
        return this.cageModelsMap.has(cage.key);
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

    addEventHandler<EventHandler extends GenericEventHandler>(
            event: MasterModelEvent<EventHandler>,
            eventHandler: EventHandler) {
        (this._eventHandlers.get(event.key) as Set<EventHandler>).add(eventHandler);
    }

    removeEventHandler<EventHandler extends GenericEventHandler>(
            event: MasterModelEvent<EventHandler>,
            eventHandler: EventHandler) {
        (this._eventHandlers.get(event.key) as Set<EventHandler>).delete(eventHandler);
    }

    private onCageRegisteredEvent(cageM: CageModel) {
        const eventHandlers = this._eventHandlers.get(MasterModelEvents.CAGE_REGISTERED.key) as Set<CageRegisteredEventHandler>;
        for (const eventHandler of eventHandlers) {
            eventHandler(cageM, this);
        }
    }

    private onCageUnregisteredEvent(cageM: CageModel) {
        const eventHandlers = this._eventHandlers.get(MasterModelEvents.CAGE_UNREGISTERED.key) as Set<CageUnregisteredEventHandler>;
        for (const eventHandler of eventHandlers) {
            eventHandler(cageM, this);
        }
    }

}
