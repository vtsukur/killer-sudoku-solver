import { House } from '../problem/house';
import { HouseSolver } from './houseSolver';

export class NonetSolver extends HouseSolver {
    constructor(idx, cells, inputCages) {
        super(idx, cells, inputCages, NonetSolver.iteratorFor);
    }

    static iteratorFor(idx) {
        return HouseSolver.newHouseIterator(i => {
            const nonetStartingRowIdx = Math.floor(idx / House.NONET_SIDE_LENGTH) * House.NONET_SIDE_LENGTH;
            const nonetStartingColIdx = (idx % House.NONET_SIDE_LENGTH) * House.NONET_SIDE_LENGTH;
            const rowIdx = nonetStartingRowIdx + Math.floor(i / House.NONET_SIDE_LENGTH);
            const colIdx = nonetStartingColIdx + i % House.NONET_SIDE_LENGTH;
            return { rowIdx, colIdx };
        });
    }
}
