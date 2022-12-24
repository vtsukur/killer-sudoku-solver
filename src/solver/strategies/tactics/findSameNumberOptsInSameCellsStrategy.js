import { Cell } from '../../../problem/cell';
import { House } from '../../../problem/house';

export function findSameNumberOptsInSameCellsStrategy() {
    if (this.hasCageModelsToReevaluatePerms) return;

    let cageModelsToReduceSet = new Set();

    this.model.houseModels.forEach(houseM => {
        const cellKeysByNum = Array(House.SIZE).fill().map(() => []);
        const cellMMap = new Map();
        for (const { row, col } of houseM.cellIterator()) {
            const key = Cell.keyOf(row, col);
            const cellM = this.model.cellModelAt(row, col);
            cellMMap.set(key, cellM);
            for (const num of cellM.numOpts()) {
                cellKeysByNum[num - 1].push(key);
            }
        }
        cellKeysByNum.forEach(keys => keys.sort());

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

    if (cageModelsToReduceSet.size > 0) {
        this.cageModelsToReduceSet = cageModelsToReduceSet;
    }
}
