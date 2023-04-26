import { Cage } from '../../../../../src/puzzle/cage';
import { Cell } from '../../../../../src/puzzle/cell';
import { CageModel } from '../../../../../src/solver/models/elements/cageModel';
import { CellModel } from '../../../../../src/solver/models/elements/cellModel';
import { CachedNumRanges } from '../../../../../src/util/cachedNumRanges';

export const createAndInitCageM = (cellCount: number, sum: number) => {
    const cells = CachedNumRanges.ZERO_TO_N_LTE_81[cellCount].map(index => Cell.at(0, index));
    const cellMs = cells.map(cell => new CellModel(cell));

    const cage = Cage.ofSum(sum).withCells(cells).new();
    const cageM = new CageModel(cage, cellMs);

    for (const cellM of cellMs) {
        cellM.addWithinCageModel(cageM);
    }

    cageM.initialReduce();

    return cageM;
};
