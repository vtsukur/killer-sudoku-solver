import _ from 'lodash';
import { Cell } from '../../../problem/cell';
import { House } from '../../../problem/house';

let i = 0;
export function findNonetBasedFormulasStrategy() {
    ++i;

    const formulas = new Formulas();

    _.range(0, House.SIZE).forEach(idx => {
        const nonetM = this.model.nonetModels[idx];
        const area = findAreaWithSingleInnieOrOutieCell(nonetM, this.model);
        if (!_.isUndefined(area) && area.outerCageMs.size > 0) {
            const outerCageMs = new Set(area.outerCageMs);
            for (const outerCageM of outerCageMs) {
                area.removeCageM(outerCageM);
                const unfilledInnerCellMs = area.unfilledInnerCellMs(this.model);
                const outerCellMs = area.outerCellMs;
                if (unfilledInnerCellMs.size === 1 && outerCellMs.size <= 2) {
                    formulas.add(new Formula(unfilledInnerCellMs.values().next().value, new Set(outerCellMs)));
                } else if (outerCellMs.size === 1 && unfilledInnerCellMs.size <= 2) {
                    formulas.add(new Formula(outerCellMs.values().next().value, new Set(unfilledInnerCellMs)));
                }
                area.addCageM(outerCageM);
            }
        }
    });

    return formulas;
}

class ExpandableNonOverlappingNonetAreaModel {
    #nonetM;
    #cageMs;
    #cellMs;
    #cellKeys;
    #innerCellMs;
    #outerCellMs;
    #outerCageMs;

    constructor(nonetM) {
        this.#nonetM = nonetM;
        this.#cageMs = new Set();
        this.#cellMs = new Set();
        this.#cellKeys = new Set();
        this.#innerCellMs = new Set();
        this.#outerCellMs = new Set();
        this.#outerCageMs = new Set();
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
                this.#outerCageMs.add(cageM);
            }
        });
    }

    removeCageM(cageM) {
        this.#cageMs.delete(cageM);
        this.#outerCageMs.delete(cageM);
        cageM.cellModels.forEach(cellM => {
            this.#cellMs.delete(cellM);
            this.#cellKeys.delete(cellM.cell.key);
            this.#innerCellMs.delete(cellM);
            this.#outerCellMs.delete(cellM);
        });
    }

    hasCellAt(row, col) {
        return this.#cellKeys.has(Cell.keyOf(row, col));
    }

    get innerCellMs() {
        return this.#innerCellMs;
    }

    unfilledInnerCellMs(model) {
        const result = new Set();
        for (const { row, col } of this.#nonetM.cellIterator()) {
            if (!this.#cellKeys.has(Cell.keyOf(row, col))) {
                result.add(model.cellModelAt(row, col));
            }
        }
        return result;
    }

    get outerCellMs() {
        return this.#outerCellMs;
    }

    get outerCageMs() {
        return this.#outerCageMs;
    }
}

class Formulas {
    #map;

    constructor() {
        this.#map = new Map();
    }

    add(formula) {
        this.#map.set(formula.key, formula);
    }

    toArray() {
        return Array.from(this.#map.values());
    }
}

class Formula {
    #cellM;
    #equalToCellMs;
    #key;

    constructor(cellM, equalToCellMs) {
        this.#cellM = cellM;
        this.#equalToCellMs = equalToCellMs;
        const keysArr = [ cellM.cell ].concat(Array.from(equalToCellMs).map(cellM => cellM.cell)).map(cell => cell.key);
        keysArr.sort();
        this.#key = keysArr.join(', ');
    }

    get cellM() {
        return this.#cellM;
    }

    get equalToCellMs() {
        return this.#equalToCellMs;
    }

    get key() {
        return this.#key;
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
