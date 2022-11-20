import { House } from '../problem/house';
import { HouseSolver } from './houseSolver';

export class NonetSolver extends HouseSolver {
    constructor(idx, cells, inputCages) {
        super(idx, cells, inputCages, NonetSolver.iteratorFor);
    }

    static iteratorFor(idx) {
        return HouseSolver.newHouseIterator(i => {
            const nonetStartingRow = Math.floor(idx / House.NONET_SIDE_LENGTH) * House.NONET_SIDE_LENGTH;
            const nonetStartingCol = (idx % House.NONET_SIDE_LENGTH) * House.NONET_SIDE_LENGTH;
            const row = nonetStartingRow + Math.floor(i / House.NONET_SIDE_LENGTH);
            const col = nonetStartingCol + i % House.NONET_SIDE_LENGTH;
            return { row, col };
        });
    }
}
