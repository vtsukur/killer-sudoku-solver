import * as _ from 'lodash';
import { Cell, CellKey } from '../../../puzzle/cell';
import { House } from '../../../puzzle/house';
import { MutableSet } from '../../../util/mutableSet';
import { CellModel } from '../../models/elements/cellModel';
import { ColumnModel } from '../../models/elements/columnModel';
import { HouseModel } from '../../models/elements/houseModel';
import { RowModel } from '../../models/elements/rowModel';
import { ReducedCellModels } from '../reducedCellModels';
import { Strategy } from '../strategy';

export class FindSameNumberOptsInSameCellsStrategy extends Strategy {
    execute() {
        if (this._context.hasCageModelsToReduce) return;

        const reducedCellMs = new ReducedCellModels();

        const colNumMapForRows: Map<HouseModel, Array<Array<number>>> = new Map();
        const rowNumMapForCols: Map<HouseModel, Array<Array<number>>> = new Map();

        this._model.houseModels.forEach(houseM => {
            const cellKeysByNum: Array<Array<CellKey>> = new Array(House.CELL_COUNT).fill([]).map(() => []);
            const cellRowsByNum: Array<Array<number>> = new Array(House.CELL_COUNT).fill([]).map(() => []);
            const cellColsByNum: Array<Array<number>> = new Array(House.CELL_COUNT).fill([]).map(() => []);
            const cellMMap = new Map();
            for (const { row, col } of houseM.cellsIterator()) {
                const key = Cell.at(row, col).key;
                const cellM = this._model.cellModelAt(row, col);
                cellMMap.set(key, cellM);
                for (const num of cellM.numOpts()) {
                    const index = num - 1;
                    cellKeysByNum[index].push(key);
                    cellRowsByNum[index].push(row);
                    cellColsByNum[index].push(col);
                }
            }
            cellKeysByNum.forEach(keys => keys.sort());
            cellRowsByNum.forEach(rows => rows.sort());
            cellColsByNum.forEach(cols => cols.sort());
            if (houseM instanceof RowModel) {
                colNumMapForRows.set(houseM, cellColsByNum);
            }
            if (houseM instanceof ColumnModel) {
                rowNumMapForCols.set(houseM, cellRowsByNum);
            }

            const cellKeysByNumMap = new Map();
            cellKeysByNum.forEach((keys, index) => {
                const keysKey = keys.join('');
                const num = index + 1;
                if (!cellKeysByNumMap.has(keysKey)) {
                    const entry = {
                        keys: keys,
                        nums: new MutableSet<number>()
                    };
                    cellKeysByNumMap.set(keysKey, entry);
                }
                cellKeysByNumMap.get(keysKey).nums.add(num);
            });

            for (const entry of cellKeysByNumMap.values()) {
                if (entry.keys.length > 1 && entry.keys.length === entry.nums.size) {
                    for (const key of entry.keys) {
                        const cellM = cellMMap.get(key);
                        if (cellM.numOpts().size > entry.keys.length) {
                            for (const num of cellM.numOpts()) {
                                if (!entry.nums.has(num)) {
                                    cellM.deleteNumOpt(num);
                                    reducedCellMs.addOne(cellM);
                                }
                            }
                        }
                    }
                }
            }
        });

        findSameNumberOptsInSameCellsAcrossRowsOrColumns(
            this._model.rowModels,
            colNumMapForRows,
            (directHouseIndex: number, perpendicularHouseIndex: number) => this._model.cellModelAt(directHouseIndex, perpendicularHouseIndex),
            reducedCellMs
        );

        findSameNumberOptsInSameCellsAcrossRowsOrColumns(
            this._model.columnModels,
            rowNumMapForCols,
            (directHouseIndex: number, perpendicularHouseIndex: number) => this._model.cellModelAt(perpendicularHouseIndex, directHouseIndex),
            reducedCellMs
        );

        this._context.setCageModelsToReduceFrom(reducedCellMs);
    }
}

function findSameNumberOptsInSameCellsAcrossRowsOrColumns(houseMs: Array<HouseModel>, numMap: Map<HouseModel, Array<Array<number>>>, getCellMFn: (directHouseIndex: number, perpendicularHouseIndex: number) => CellModel, reducedCellMs: ReducedCellModels) {
    _.range(0, House.CELL_COUNT).forEach(numIndex => {
        const num = numIndex + 1;

        const numOccurencesKeyToHouseMap = new Map();
        houseMs.forEach(houseM => {
            const numToHouseIndicesMap = numMap.get(houseM) as Array<Array<number>>;
            const houseIndicesArr = numToHouseIndicesMap[numIndex];
            const key = houseIndicesArr.join('');
            if (!numOccurencesKeyToHouseMap.has(key)) {
                const entry = {
                    perpendicularHouseIndices: houseIndicesArr,
                    houses: new MutableSet()
                };
                numOccurencesKeyToHouseMap.set(key, entry);
            }
            numOccurencesKeyToHouseMap.get(key).houses.add(houseM);
        });

        for (const entry of numOccurencesKeyToHouseMap.values()) {
            if (entry.perpendicularHouseIndices.length === 2 && entry.perpendicularHouseIndices.length === entry.houses.size) {
                const directHouseIndicesSet = new MutableSet<number>(Array.from<HouseModel>(entry.houses).map(houseM => houseM.index));
                _.range(0, House.CELL_COUNT).forEach(directHouseIndex => {
                    if (directHouseIndicesSet.has(directHouseIndex)) return;

                    for (const perpendicularHouseIndex of entry.perpendicularHouseIndices) {
                        const cellM = getCellMFn(directHouseIndex, perpendicularHouseIndex);
                        if (cellM.hasNumOpt(num)) {
                            cellM.deleteNumOpt(num);
                            reducedCellMs.addOne(cellM);
                        }
                    }
                });
            }
        }
    });
}
