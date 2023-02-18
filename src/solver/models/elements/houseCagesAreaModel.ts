import { ReadonlyCages } from '../../../puzzle/cage';

export class HouseCagesAreaModel {

    readonly cages: ReadonlyCages;
    readonly cellCount: number;

    constructor(cages: ReadonlyCages) {
        this.cages = cages;
        this.cellCount = cages.reduce((partialCellCount, a) => partialCellCount + a.cellCount, 0);
    }

}
