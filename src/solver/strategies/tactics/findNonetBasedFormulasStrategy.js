import _ from 'lodash';
import { Cell } from '../../../problem/cell';
import { House } from '../../../problem/house';

let i = 0;
export function findNonetBasedFormulasStrategy() {
    if (this.hasCageModelsToReevaluatePerms) return;

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
                    formulas.add(new Formula(unfilledInnerCellMs.values().next().value, new Set(outerCellMs), area.deltaBetweenOuterAndInner));
                }
                area.addCageM(outerCageM);
            }
        }
    });

    let cageModelsToReduce = new Set();
    for (const formula of formulas.toArray()) {
        const reducedCellModels = reduceByFormula(formula);
        reducedCellModels.forEach(cellModel => {
            cageModelsToReduce = new Set([...cageModelsToReduce, ...cellModel.withinCageModels]);
        });
    }

    this.cageModelsToReevaluatePerms = cageModelsToReduce.size > 0 ? cageModelsToReduce.values() : undefined;

    return formulas;
}

class ExpandableNonOverlappingNonetAreaModel {
    #nonetM;
    #sum;
    #cageMs;
    #cellMs;
    #cellKeys;
    #innerCellMs;
    #outerCellMs;
    #outerCageMs;

    constructor(nonetM) {
        this.#nonetM = nonetM;
        this.#sum = 0;
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
        this.#sum += cageM.cage.sum;
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
        this.#sum -= cageM.cage.sum;
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

    get deltaBetweenOuterAndInner() {
        return this.#sum - House.SUM;
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
    #withDelta;
    #key;

    constructor(cellM, equalToCellMs, withDelta) {
        this.#cellM = cellM;
        this.#equalToCellMs = equalToCellMs;
        const keysArr = [ cellM.cell ].concat(Array.from(equalToCellMs).map(cellM => cellM.cell)).map(cell => cell.key);
        keysArr.sort();
        this.#key = `${keysArr.join(', ')}: ${withDelta}`;
        this.#withDelta = withDelta;
    }

    get cellM() {
        return this.#cellM;
    }

    get equalToCellMs() {
        return this.#equalToCellMs;
    }

    get withDelta() {
        return this.#withDelta;
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

function reduceByFormula(formula) {
    const reduced = new Set();

    const checkingNumOpts = new Map();
    formula.equalToCellMs.forEach(cellM => {
        checkingNumOpts.set(cellM, new Set());
    });

    // also check for duplicate nums possibility?

    for (const num of formula.cellM.numOpts()) {
        const targetSum = num + formula.withDelta;
        if (formula.equalToCellMs.size === 1) {
            const otherCellM = formula.equalToCellMs.values().next().value;
            if (!otherCellM.hasNumOpt(targetSum)) {
                formula.cellM.deleteNumOpt(num);
                reduced.add(formula.cellM);
            } else {
                checkingNumOpts.get(otherCellM).add(targetSum);
            }
        }
    }

    if (formula.equalToCellMs.size === 1) {
        for (const checkingEntry of checkingNumOpts.entries()) {
            const cellM = checkingEntry[0];
            const numOpts = checkingEntry[1];

            for (const num of cellM.numOpts()) {
                if (!numOpts.has(num)) {
                    cellM.deleteNumOpt(num);
                    reduced.add(cellM);
                }
            }
        }
    }

    return reduced;
}
