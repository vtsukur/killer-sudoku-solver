import _ from 'lodash';
import { Cell } from '../../../problem/cell';
import { House } from '../../../problem/house';

let i = 0;
export function findNonetBasedFormulasStrategy() {
    ++i;
    
    _.range(0, House.SIZE).forEach(idx => {
        const nonetM = this.model.nonetModels[idx];
        const area = findAreaWithSingleInnieOrOutieCell(nonetM, this.model);
        if (!_.isUndefined(area)) {

        }
    });
}

class ExpandableNonOverlappingNonetAreaModel {
    #nonetM;
    #cageMs;
    #cellMs;
    #cellKeys;
    #innerCellMs;
    #outerCellMs;

    constructor(nonetM) {
        this.#nonetM = nonetM;
        this.#cageMs = new Set();
        this.#cellMs = new Set();
        this.#cellKeys = new Set();
        this.#innerCellMs = new Set();
        this.#outerCellMs = new Set();
    }

    addCageM(cageM) {
        this.#cageMs.add(cageM);
        cageM.cellModels.forEach(cellM => {
            this.#cellMs.add(cellM);
            this.#cellKeys.add(cellM.cell.key);
            if (cellM.cell.nonet == this.#nonetM.idx) {
                this.#innerCellMs.add(cellM);
            } else {
                this.#outerCellMs.add(cellM);
            }
        });
    }

    hasCellAt(row, col) {
        return this.#cellKeys.has(Cell.keyOf(row, col));
    }

    get innerCellMs() {
        return this.#innerCellMs;
    }

    get outerCellMs() {
        return this.#outerCellMs;
    }
}

function findAreaWithSingleInnieOrOutieCell(nonetM, model) {
    const areaModel = new ExpandableNonOverlappingNonetAreaModel(nonetM);
    nonetM.cageModels.filter(cageM => cageM.derivedFromInputCage).
        forEach(cageM => areaModel.addCageM(cageM));

    if (areaModel.innerCellMs.size === House.SIZE && areaModel.outerCellMs.size === 0) return areaModel;

    for (const { row, col } of nonetM.cellIterator()) {
        if (areaModel.hasCellAt(row, col)) continue;

        const cellM = model.cellModelAt(row, col);
        const cageMDerivedFromInputCage = Array.from(cellM.withinCageModels).find(cageM => cageM.derivedFromInputCage);
        if (!_.isUndefined(cageMDerivedFromInputCage)) areaModel.addCageM(cageMDerivedFromInputCage);
    }

    return areaModel;
}
