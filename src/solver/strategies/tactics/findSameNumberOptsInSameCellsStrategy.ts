import * as _ from 'lodash';
import { Cell } from '../../../puzzle/cell';
import { House } from '../../../puzzle/house';
import { CageModel } from '../../models/elements/cageModel';
import { CellModel } from '../../models/elements/cellModel';
import { ColumnModel } from '../../models/elements/columnModel';
import { HouseModel } from '../../models/elements/houseModel';
import { RowModel } from '../../models/elements/rowModel';
import { Context } from '../context';

export function findSameNumberOptsInSameCellsStrategy(this: Context) {
    if (this.hasCageModelsToReevaluatePerms) return;

    let cageModelsToReduceSet = new Set<CageModel>();

    const colNumMapForRows: Map<HouseModel, Array<Array<number>>> = new Map();
    const rowNumMapForCols: Map<HouseModel, Array<Array<number>>> = new Map();

    this.model.houseModels.forEach(houseM => {
        const cellKeysByNum: Array<Array<string>> = new Array(House.SIZE).fill([]).map(() => []);
        const cellRowsByNum: Array<Array<number>> = new Array(House.SIZE).fill([]).map(() => []);
        const cellColsByNum: Array<Array<number>> = new Array(House.SIZE).fill([]).map(() => []);
        const cellMMap = new Map();
        for (const { row, col } of houseM.cellsIterator()) {
            const key = Cell.keyOf(row, col);
            const cellM = this.model.cellModelAt(row, col);
            cellMMap.set(key, cellM);
            for (const num of cellM.numOpts()) {
                const idx = num - 1;
                cellKeysByNum[idx].push(key);
                cellRowsByNum[idx].push(row);
                cellColsByNum[idx].push(col);
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
        cellKeysByNum.forEach((keys, idx) => {
            const keysKey = keys.join('');
            const num = idx + 1;
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
                                cageModelsToReduceSet = new Set([...cageModelsToReduceSet, ...cellM.withinCageModels]);
                            }
                        }
                    }
                }
            }
        }
    });

    const rowBasedCageMsToReduce = findSameNumberOptsInSameCellsAcrossRowsOrColumns(
        this.model.rowModels,
        colNumMapForRows,
        (directHouseIdx: number, perpendicularHouseIdx: number) => this.model.cellModelAt(directHouseIdx, perpendicularHouseIdx)
    );
    cageModelsToReduceSet = new Set([...cageModelsToReduceSet, ...rowBasedCageMsToReduce]);

    const colBasedCageMsToReduce = findSameNumberOptsInSameCellsAcrossRowsOrColumns(
        this.model.columnModels,
        rowNumMapForCols,
        (directHouseIdx: number, perpendicularHouseIdx: number) => this.model.cellModelAt(perpendicularHouseIdx, directHouseIdx)
    );

    cageModelsToReduceSet = new Set([...cageModelsToReduceSet, ...colBasedCageMsToReduce]);

    if (cageModelsToReduceSet.size > 0) {
        this.cageModelsToReevaluatePerms = Array.from(cageModelsToReduceSet);
    }
}

function findSameNumberOptsInSameCellsAcrossRowsOrColumns(houseMs: Array<HouseModel>, numMap: Map<HouseModel, Array<Array<number>>>, getCellMFn: (directHouseIdx: number, perpendicularHouseIdx: number) => CellModel) {
    let cageModelsToReduceSet = new Set<CageModel>();

    _.range(0, House.SIZE).forEach(numIdx => {
        const num = numIdx + 1;

        const numOccurencesKeyToHouseMap = new Map();
        houseMs.forEach(houseM => {
            const numToHouseIndicesMap = numMap.get(houseM) as Array<Array<number>>;
            const houseIndicesArr = numToHouseIndicesMap[numIdx];
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
                const directHouseIndicesSet = new Set<number>(Array.from<HouseModel>(entry.houses).map(houseM => houseM.idx));
                _.range(0, House.SIZE).forEach(directHouseIdx => {
                    if (directHouseIndicesSet.has(directHouseIdx)) return;

                    for (const perpendicularHouseIdx of entry.perpendicularHouseIndices) {
                        const cellM = getCellMFn(directHouseIdx, perpendicularHouseIdx);
                        if (cellM.hasNumOpt(num)) {
                            cellM.deleteNumOpt(num);
                            cageModelsToReduceSet = new Set([...cageModelsToReduceSet, ...cellM.withinCageModels]);
                        }
                    }
                });
            }
        }
    });

    return cageModelsToReduceSet;
}
