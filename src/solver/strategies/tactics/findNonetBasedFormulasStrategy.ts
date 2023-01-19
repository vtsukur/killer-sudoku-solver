import * as _ from 'lodash';
import { Cell } from '../../../puzzle/cell';
import { House } from '../../../puzzle/house';
import { findNumCombinationsForSum } from '../../combinatorial/combinatorial';
import { CageModel } from '../../models/elements/cageModel';
import { CellModel } from '../../models/elements/cellModel';
import { NonetModel } from '../../models/elements/nonetModel';
import { MasterModel } from '../../models/masterModel';
import { Context } from '../context';

export function findNonetBasedFormulasStrategy(this: Context) {
    if (this.hasCageModelsToReevaluatePerms) return;

    const formulas = new Formulas();

    _.range(0, House.SIZE).forEach((index: number) => {
        const nonetM = this.model.nonetModels[index];
        const area = findAreaWithSingleInnieOrOutieCell(nonetM, this.model);
        if (!_.isUndefined(area) && area.outerCageMs.size > 0) {
            const outerCageMs = new Set<CageModel>(area.outerCageMs);
            for (const outerCageM of outerCageMs) {
                area.removeCageM(outerCageM);
                const unfilledInnerCellMs = area.unfilledInnerCellMs(this.model);
                const outerCellMs = area.outerCellMs;
                if (unfilledInnerCellMs.size === 1 && outerCellMs.size <= 2) {
                    formulas.add(new Formula(unfilledInnerCellMs.values().next().value, new Set<CellModel>(outerCellMs), area.deltaBetweenOuterAndInner));
                }
                area.addCageM(outerCageM);
            }
        }
    });

    let cageModelsToReduce = new Set<CageModel>();
    for (const formula of formulas.toArray()) {
        const reducedCellMs = reduceByFormula(formula);
        reducedCellMs.forEach(cellM => {
            cageModelsToReduce = new Set([...cageModelsToReduce, ...cellM.withinCageModels]);
        });
    }

    this.cageModelsToReevaluatePerms = cageModelsToReduce.size > 0 ? Array.from(cageModelsToReduce.values()) : undefined;

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

    constructor(nonetM: NonetModel) {
        this.#nonetM = nonetM;
        this.#sum = 0;
        this.#cageMs = new Set<CageModel>();
        this.#cellMs = new Set<CellModel>();
        this.#cellKeys = new Set<string>();
        this.#innerCellMs = new Set<CellModel>();
        this.#outerCellMs = new Set<CellModel>();
        this.#outerCageMs = new Set<CageModel>();
    }

    addCageM(cageM: CageModel) {
        this.#cageMs.add(cageM);
        cageM.cellMs.forEach(cellM => {
            this.#cellMs.add(cellM);
            this.#cellKeys.add(cellM.cell.key);
            if (cellM.cell.nonet == this.#nonetM.index) {
                this.#innerCellMs.add(cellM);
            } else {
                this.#outerCellMs.add(cellM);
                this.#outerCageMs.add(cageM);
            }
        });
        this.#sum += cageM.cage.sum;
    }

    removeCageM(cageM: CageModel) {
        this.#cageMs.delete(cageM);
        this.#outerCageMs.delete(cageM);
        cageM.cellMs.forEach(cellM => {
            this.#cellMs.delete(cellM);
            this.#cellKeys.delete(cellM.cell.key);
            this.#innerCellMs.delete(cellM);
            this.#outerCellMs.delete(cellM);
        });
        this.#sum -= cageM.cage.sum;
    }

    hasCellAt(row: number, col: number) {
        return this.#cellKeys.has(Cell.keyOf(row, col));
    }

    get innerCellMs() {
        return this.#innerCellMs;
    }

    unfilledInnerCellMs(model: MasterModel) {
        const result = new Set();
        for (const { row, col } of this.#nonetM.cellsIterator()) {
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
    private readonly _map;

    constructor() {
        this._map = new Map<string, Formula>();
    }

    add(formula: Formula) {
        this._map.set(formula.key, formula);
    }

    toArray() {
        return Array.from(this._map.values());
    }
}

class Formula {
    readonly cellM;
    readonly equalToCellMs;
    readonly withDelta;
    readonly key;

    constructor(cellM: CellModel, equalToCellMs: Set<CellModel>, withDelta: number) {
        this.cellM = cellM;
        this.equalToCellMs = equalToCellMs;
        const keysArr = [ cellM.cell ].concat(Array.from(equalToCellMs).map(cellM => cellM.cell)).map(cell => cell.key);
        keysArr.sort();
        this.withDelta = withDelta;
        this.key = `${keysArr.join(', ')}: ${withDelta}`;
    }
}

function findAreaWithSingleInnieOrOutieCell(nonetM: NonetModel, model: MasterModel) {
    const areaModel = new ExpandableNonOverlappingNonetAreaModel(nonetM);
    nonetM.cageModels.filter(cageM => cageM.derivedFromInputCage).
        forEach(cageM => areaModel.addCageM(cageM));

    if (areaModel.innerCellMs.size === House.SIZE && areaModel.outerCellMs.size === 0) return areaModel;

    for (const { row, col } of nonetM.cellsIterator()) {
        if (areaModel.hasCellAt(row, col)) continue;

        const cellM = model.cellModelAt(row, col);
        const cageMDerivedFromInputCage = Array.from(cellM.withinCageModels).find(cageM => cageM.derivedFromInputCage);
        if (!_.isUndefined(cageMDerivedFromInputCage)) areaModel.addCageM(cageMDerivedFromInputCage);
    }

    return areaModel;
}

function reduceByFormula(formula: Formula): Set<CellModel> {
    if (!_.inRange(formula.equalToCellMs.size, 1, 3)) return new Set();

    const reduced = new Set<CellModel>();

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
        } else if (formula.equalToCellMs.size === 2) {
            const cellMArr = Array.from(formula.equalToCellMs);
            const otherCellM1 = cellMArr[0];
            const otherCellM2 = cellMArr[1];
            const combos = findNumCombinationsForSum(targetSum, 2);
            let hasAtLeastOneCombo = false;
            for (const combo of combos) {
                const comboArr = Array.from(combo);
                const hasDirect = otherCellM1.hasNumOpt(comboArr[0]) && otherCellM2.hasNumOpt(comboArr[1]);
                const hasInverse = otherCellM1.hasNumOpt(comboArr[1]) && otherCellM2.hasNumOpt(comboArr[0]);
                if (hasDirect) {
                    checkingNumOpts.get(otherCellM1).add(comboArr[0]);
                    checkingNumOpts.get(otherCellM2).add(comboArr[1]);
                }
                if (hasInverse) {
                    checkingNumOpts.get(otherCellM1).add(comboArr[1]);
                    checkingNumOpts.get(otherCellM2).add(comboArr[0]);
                }
                hasAtLeastOneCombo ||= hasDirect || hasInverse;
            }
            if (!hasAtLeastOneCombo) {
                formula.cellM.deleteNumOpt(num);
                reduced.add(formula.cellM);
            }
        }
    }

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

    return reduced;
}
