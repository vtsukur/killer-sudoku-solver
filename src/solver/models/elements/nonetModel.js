import { Nonet } from '../../../problem/nonet';
import { HouseModel } from './houseModel';

export class NonetModel extends HouseModel {
    constructor(idx, cells) {
        super(idx, cells, NonetModel.iteratorFor);
    }

    static iteratorFor(idx) {
        return HouseModel.newHouseIterator(i => {
            const nonetStartingRow = Math.floor(idx / Nonet.SIDE_LENGTH) * Nonet.SIDE_LENGTH;
            const nonetStartingCol = (idx % Nonet.SIDE_LENGTH) * Nonet.SIDE_LENGTH;
            const row = nonetStartingRow + Math.floor(i / Nonet.SIDE_LENGTH);
            const col = nonetStartingCol + i % Nonet.SIDE_LENGTH;
            return { row, col };
        });
    }

    deepCopyWithoutCageModels() {
        return new NonetModel(this.idx, this.cells);
    }
}
