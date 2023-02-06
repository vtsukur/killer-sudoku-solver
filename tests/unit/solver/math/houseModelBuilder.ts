import { ReadonlyCages } from '../../../../src/puzzle/cage';
import { Cell, CellKey } from '../../../../src/puzzle/cell';
import { Row } from '../../../../src/puzzle/row';
import { CageModel } from '../../../../src/solver/models/elements/cageModel';
import { HouseModel } from '../../../../src/solver/models/elements/houseModel';

export const newHouseModel = (cages: ReadonlyCages) => {
    const cellsMap: Map<CellKey, Cell> = new Map();
    cages.forEach(cage => {
        cage.cells.forEach(cell => {
            cellsMap.set(cell.key, cell);
        });
    });
    const cageMs = cages.map(cage => new CageModel(cage, []));
    const houseM = new HouseModel(0, Array.from(cellsMap.values()), () => Row.newCellsIterator(0));
    for (const cageM of cageMs) {
        houseM.addCageModel(cageM);
    }
    return houseM;
};
