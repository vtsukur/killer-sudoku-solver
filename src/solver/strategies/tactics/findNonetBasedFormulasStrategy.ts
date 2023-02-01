import * as _ from 'lodash';
import { Cell, CellKeysSet } from '../../../puzzle/cell';
import { House, HouseIndex } from '../../../puzzle/house';
import { combosForSum } from '../../math';
import { CageModel } from '../../models/elements/cageModel';
import { CellModel } from '../../models/elements/cellModel';
import { NonetModel } from '../../models/elements/nonetModel';
import { MasterModel } from '../../models/masterModel';
import { ReducedCellModels } from '../reducedCellModels';
import { Strategy } from '../strategy';

export class FindNonetBasedFormulasStrategy extends Strategy {
    execute() {
        if (this._context.hasCageModelsToReduce) return;

        const formulas = new Formulas();

        _.range(0, House.CELL_COUNT).forEach((index: number) => {
            const nonetM = this._model.nonetModels[index];
            const area = findAreaWithSingleInnieOrOutieCell(nonetM, this._model);
            if (!_.isUndefined(area) && area.outerCageMs.size > 0) {
                const outerCageMs = new Set<CageModel>(area.outerCageMs);
                for (const outerCageM of outerCageMs) {
                    area.removeCageM(outerCageM);
                    const unfilledInnerCellMs = area.unfilledInnerCellMs(this._model);
                    const outerCellMs = area.outerCellMs;
                    if (unfilledInnerCellMs.size === 1 && outerCellMs.size <= 2) {
                        formulas.add(new Formula(unfilledInnerCellMs.values().next().value, new Set<CellModel>(outerCellMs), area.deltaBetweenOuterAndInner));
                    }
                    area.addCageM(outerCageM);
                }
            }
        });

        const reducedCellMs = new ReducedCellModels();
        for (const formula of formulas.toArray()) {
            reducedCellMs.add(reduceByFormula(formula));
        }
        this._context.setCageModelsToReduceFrom(reducedCellMs);

        return formulas;
    }
}

class ExpandableNonOverlappingNonetAreaModel {
    private _nonetM;
    private _sum;
    private _cageMs;
    private _cellMs;
    private _cellKeys: CellKeysSet;
    private _innerCellMs;
    private _outerCellMs;
    private _outerCageMs;

    constructor(nonetM: NonetModel) {
        this._nonetM = nonetM;
        this._sum = 0;
        this._cageMs = new Set<CageModel>();
        this._cellMs = new Set<CellModel>();
        this._cellKeys = new Set();
        this._innerCellMs = new Set<CellModel>();
        this._outerCellMs = new Set<CellModel>();
        this._outerCageMs = new Set<CageModel>();
    }

    addCageM(cageM: CageModel) {
        this._cageMs.add(cageM);
        cageM.cellMs.forEach(cellM => {
            this._cellMs.add(cellM);
            this._cellKeys.add(cellM.cell.key);
            if (cellM.cell.nonet == this._nonetM.index) {
                this._innerCellMs.add(cellM);
            } else {
                this._outerCellMs.add(cellM);
                this._outerCageMs.add(cageM);
            }
        });
        this._sum += cageM.cage.sum;
    }

    removeCageM(cageM: CageModel) {
        this._cageMs.delete(cageM);
        this._outerCageMs.delete(cageM);
        cageM.cellMs.forEach(cellM => {
            this._cellMs.delete(cellM);
            this._cellKeys.delete(cellM.cell.key);
            this._innerCellMs.delete(cellM);
            this._outerCellMs.delete(cellM);
        });
        this._sum -= cageM.cage.sum;
    }

    hasCellAt(row: HouseIndex, col: HouseIndex) {
        return this._cellKeys.has(Cell.at(row, col).key);
    }

    get innerCellMs() {
        return this._innerCellMs;
    }

    unfilledInnerCellMs(model: MasterModel) {
        const result = new Set();
        for (const { row, col } of this._nonetM.cellsIterator()) {
            if (!this._cellKeys.has(Cell.at(row, col).key)) {
                result.add(model.cellModelAt(row, col));
            }
        }
        return result;
    }

    get deltaBetweenOuterAndInner() {
        return this._sum - House.SUM;
    }

    get outerCellMs() {
        return this._outerCellMs;
    }

    get outerCageMs() {
        return this._outerCageMs;
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

    if (areaModel.innerCellMs.size === House.CELL_COUNT && areaModel.outerCellMs.size === 0) return areaModel;

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
            const combos = combosForSum(targetSum, 2);
            let hasAtLeastOneCombo = false;
            for (const combo of combos) {
                const comboArr = combo.nums;
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
