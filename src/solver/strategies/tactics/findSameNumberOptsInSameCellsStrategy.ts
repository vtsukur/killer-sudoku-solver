import * as _ from 'lodash';
import { Cell } from '../../../puzzle/cell';
import { House } from '../../../puzzle/house';
import { CageModel } from '../../models/elements/cageModel';
import { CellModel } from '../../models/elements/cellModel';
import { ColumnModel } from '../../models/elements/columnModel';
import { HouseModel } from '../../models/elements/houseModel';
import { RowModel } from '../../models/elements/rowModel';
import { Strategy } from '../strategy';

export class FindSameNumberOptsInSameCellsStrategy extends Strategy {
    execute() {
        if (this._context.hasModelsTouchedByReduction) return;

        let cageMsToReduceSet = new Set<CageModel>();
    
        const colNumMapForRows: Map<HouseModel, Array<Array<number>>> = new Map();
        const rowNumMapForCols: Map<HouseModel, Array<Array<number>>> = new Map();
    
        this._model.houseModels.forEach(houseM => {
            const cellKeysByNum: Array<Array<string>> = new Array(House.SIZE).fill([]).map(() => []);
            const cellRowsByNum: Array<Array<number>> = new Array(House.SIZE).fill([]).map(() => []);
            const cellColsByNum: Array<Array<number>> = new Array(House.SIZE).fill([]).map(() => []);
            const cellMMap = new Map();
            for (const { row, col } of houseM.cellsIterator()) {
                const key = Cell.keyOf(row, col);
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
                        nums: new Set()
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
                                    cageMsToReduceSet = new Set([...cageMsToReduceSet, ...cellM.withinCageModels]);
                                }
                            }
                        }
                    }
                }
            }
        });
    
        const rowBasedCageMsToReduce = findSameNumberOptsInSameCellsAcrossRowsOrColumns(
            this._model.rowModels,
            colNumMapForRows,
            (directHouseIndex: number, perpendicularHouseIndex: number) => this._model.cellModelAt(directHouseIndex, perpendicularHouseIndex)
        );
        cageMsToReduceSet = new Set([...cageMsToReduceSet, ...rowBasedCageMsToReduce]);
    
        const colBasedCageMsToReduce = findSameNumberOptsInSameCellsAcrossRowsOrColumns(
            this._model.columnModels,
            rowNumMapForCols,
            (directHouseIndex: number, perpendicularHouseIndex: number) => this._model.cellModelAt(perpendicularHouseIndex, directHouseIndex)
        );
    
        cageMsToReduceSet = new Set([...cageMsToReduceSet, ...colBasedCageMsToReduce]);
    
        if (cageMsToReduceSet.size > 0) {
            this._context.cageModelsToReevaluatePerms = Array.from(cageMsToReduceSet);
        }            
    }
}

function findSameNumberOptsInSameCellsAcrossRowsOrColumns(houseMs: Array<HouseModel>, numMap: Map<HouseModel, Array<Array<number>>>, getCellMFn: (directHouseIndex: number, perpendicularHouseIndex: number) => CellModel) {
    let cageMsToReduceSet = new Set<CageModel>();

    _.range(0, House.SIZE).forEach(numIndex => {
        const num = numIndex + 1;

        const numOccurencesKeyToHouseMap = new Map();
        houseMs.forEach(houseM => {
            const numToHouseIndicesMap = numMap.get(houseM) as Array<Array<number>>;
            const houseIndicesArr = numToHouseIndicesMap[numIndex];
            const key = houseIndicesArr.join('');
            if (!numOccurencesKeyToHouseMap.has(key)) {
                const entry = {
                    perpendicularHouseIndices: houseIndicesArr,
                    houses: new Set()
                };
                numOccurencesKeyToHouseMap.set(key, entry);
            }
            numOccurencesKeyToHouseMap.get(key).houses.add(houseM);
        });
        
        for (const entry of numOccurencesKeyToHouseMap.values()) {
            if (entry.perpendicularHouseIndices.length === 2 && entry.perpendicularHouseIndices.length === entry.houses.size) {
                const directHouseIndicesSet = new Set<number>(Array.from<HouseModel>(entry.houses).map(houseM => houseM.index));
                _.range(0, House.SIZE).forEach(directHouseIndex => {
                    if (directHouseIndicesSet.has(directHouseIndex)) return;

                    for (const perpendicularHouseIndex of entry.perpendicularHouseIndices) {
                        const cellM = getCellMFn(directHouseIndex, perpendicularHouseIndex);
                        if (cellM.hasNumOpt(num)) {
                            cellM.deleteNumOpt(num);
                            cageMsToReduceSet = new Set([...cageMsToReduceSet, ...cellM.withinCageModels]);
                        }
                    }
                });
            }
        }
    });

    return cageMsToReduceSet;
}
