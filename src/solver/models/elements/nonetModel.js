import { Nonet } from '../../../problem/nonet';
import { HouseSolver } from './houseSolver';

export class NonetModel extends HouseSolver {
    constructor(idx, cells, inputCages) {
        super(idx, cells, inputCages, NonetModel.iteratorFor);
    }

    static iteratorFor(idx) {
        return HouseSolver.newHouseIterator(i => {
            const nonetStartingRow = Math.floor(idx / Nonet.SIDE_LENGTH) * Nonet.SIDE_LENGTH;
            const nonetStartingCol = (idx % Nonet.SIDE_LENGTH) * Nonet.SIDE_LENGTH;
            const row = nonetStartingRow + Math.floor(i / Nonet.SIDE_LENGTH);
            const col = nonetStartingCol + i % Nonet.SIDE_LENGTH;
            return { row, col };
        });
    }
}
