import { Cage } from '../../../../../src/puzzle/cage';
import { Cell } from '../../../../../src/puzzle/cell';
import { MasterModelReduction } from '../../../../../src/solver/strategies/reduction/masterModelReduction';
import { CachedNumRanges } from '../../../../../src/util/cachedNumRanges';
import { LockableCageModel } from '../../strategies/reduction/lockableCageModel';
import { LockableCellModel } from '../../strategies/reduction/lockableCellModel';

export const createAndInitPerfCageM = (cellCount: number, sum: number, reduction?: MasterModelReduction) => {
    const cells = CachedNumRanges.ZERO_TO_N_LTE_81[cellCount].map(index => Cell.at(0, index));
    const cellMs = cells.map(cell => new LockableCellModel(cell));

    const cage = Cage.ofSum(sum).withCells(cells).new();
    const cageM = new LockableCageModel(cage, cellMs);

    for (const cellM of cellMs) {
        cellM.addWithinCageModel(cageM);
    }

    cageM.initialReduce(reduction);

    return cageM;
};
