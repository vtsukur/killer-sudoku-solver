import _ from 'lodash';
import { Cell } from '../../../puzzle/cell';
import { House } from '../../../puzzle/house';
import { ColumnModel } from '../../models/elements/columnModel';
import { RowModel } from '../../models/elements/rowModel';

export function findSameNumberOptsInSameCellsStrategy() {
    if (this.hasCageModelsToReevaluatePerms) return;

    let cageModelsToReduceSet = new Set();

    const colNumMapForRows = new Map();
    const rowNumMapForCols = new Map();

    this.model.houseModels.forEach(houseM => {
        const cellKeysByNum = Array(House.SIZE).fill().map(() => []);
        const cellRowsByNum = Array(House.SIZE).fill().map(() => []);
        const cellColsByNum = Array(House.SIZE).fill().map(() => []);
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
        (directHouseIdx, perpendicularHouseIdx) => this.model.cellModelAt(directHouseIdx, perpendicularHouseIdx)
    );
    cageModelsToReduceSet = new Set([...cageModelsToReduceSet, ...rowBasedCageMsToReduce]);

    const colBasedCageMsToReduce = findSameNumberOptsInSameCellsAcrossRowsOrColumns(
        this.model.columnModels,
        rowNumMapForCols,
        (directHouseIdx, perpendicularHouseIdx) => this.model.cellModelAt(perpendicularHouseIdx, directHouseIdx)
    );

    cageModelsToReduceSet = new Set([...cageModelsToReduceSet, ...colBasedCageMsToReduce]);

    if (cageModelsToReduceSet.size > 0) {
        this.cageModelsToReevaluatePerms = cageModelsToReduceSet;
    }
}

function findSameNumberOptsInSameCellsAcrossRowsOrColumns(houseMs, numMap, getCellMFn) {
    let cageModelsToReduceSet = new Set();

    _.range(0, House.SIZE).forEach(numIdx => {
        const num = numIdx + 1;

        const numOccurencesKeyToHouseMap = new Map();
        houseMs.forEach(houseM => {
            const numToHouseIndicesMap = numMap.get(houseM);
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
                const directHouseIndicesSet = new Set(Array.from(entry.houses).map(houseM => houseM.idx));
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
