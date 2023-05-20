import { Combo } from '../../../math';
import { CageModel } from '../../../models/elements/cageModel';
import { CellModel } from '../../../models/elements/cellModel';
import { Bits32Set } from '../../../sets/bits32Set';
import { CageModelReducer } from '../cageModelReducer';
import { MasterModelReduction } from '../masterModelReduction';

type Context = {
    readonly processedCellMs: Set<CellModel>;
    readonly remainingCellMs: Set<CellModel>,
    readonly processedNums: Set<number>,
    readonly numbersStack: Array<number>,
    readonly cellMsStack: Array<CellModel>,
    readonly processCell: (cellM: CellModel, step: number, fn: () => boolean | void) => boolean | void;
    readonly mayNotProceedWithNum: (num: number) => boolean;
    readonly processNum: (num: number, step: number, fn: () => boolean | void) => boolean | void;
    readonly remainingCellM: () => CellModel;
};

const CELL_COUNT = 4;

/**
 * Reduces possible numbers for {@link CellModel}s
 * within a {@link CageModel} of a {@link Cage} with 4 {@link Cell}s
 * by checking the validity of numbers' options given possible {@link Combo}s for the {@link CageModel}.
 *
 * @public
 */
export class CageModel4FullReducer implements CageModelReducer {

    /**
     * The {@link CageModel} to reduce.
     */
    private readonly _cageM: CageModel;

    private readonly _cellMs: ReadonlyArray<CellModel>;

    /**
     * Constructs a new reducer of possible numbers for {@link CellModel}s
     * within a {@link CageModel} of a {@link Cage} with 3 {@link Cell}s.
     *
     * @param cageM — The {@link CageModel} to reduce.
     */
    constructor(cageM: CageModel) {
        this._cageM = cageM;
        this._cellMs = cageM.cellMs;
    }

    /**
     * @see CageModelReducer.reduce
     */
    reduce(reduction: MasterModelReduction): void {
        const context: Context = {
            processedCellMs: new Set(),
            remainingCellMs: new Set(this._cellMs),
            processedNums: new Set(),
            numbersStack: new Array(CELL_COUNT),
            cellMsStack: new Array(CELL_COUNT),
            processCell: function(cellM: CellModel, step: number, fn: () => boolean | void) {
                if (this.processedCellMs.has(cellM)) return;
                this.processedCellMs.add(cellM); this.remainingCellMs.delete(cellM);
                this.cellMsStack[step] = cellM;
                const retVal = fn();
                // this.cellMsStack[step] = undefined;
                this.processedCellMs.delete(cellM); this.remainingCellMs.add(cellM);
                return retVal;
            },
            mayNotProceedWithNum: function(num: number) {
                return this.processedNums.has(num);
            },
            processNum: function(num: number, step: number, fn: () => boolean | void) {
                if (this.mayNotProceedWithNum(num)) return;
                this.processedNums.add(num);
                this.numbersStack[step] = num;
                const retVal = fn();
                // this.numbersStack[step] = undefined;
                this.processedNums.delete(num);
                return retVal;
            },
            remainingCellM: function() {
                return context.remainingCellMs.values().next().value;
            }
        };

        this._cageM.combosSet.clear();

        this._cellMs.forEach(cellM => {
            context.processCell(cellM, 0, () => {
                Array.from(cellM.numOpts()).forEach(num => {
                    context.processNum(num, 0, () => {
                        if (!this.hasSumMatchingPermutationsRecursive(num, 1, context)) {
                            reduction.deleteNumOpt(cellM, num, this._cageM);
                        }
                    });
                });
            });
        });
    }

    private hasSumMatchingPermutationsRecursive(currentSum: number, step: number, context: Context) {
        if (currentSum > this._cageM.cage.sum) { return false; }

        let has = false;

        if (step === (CELL_COUNT - 1)) {
            const lastNum = this._cageM.cage.sum - currentSum;
            if (context.mayNotProceedWithNum(lastNum)) return false;
            const lastCellM = context.remainingCellM();
            has = lastCellM.hasNumOpt(lastNum);
            if (has) {
                context.numbersStack[CELL_COUNT - 1] = lastNum;
                const combo = Combo.BY_NUMS_BITS[Bits32Set.bitsOf(context.numbersStack)];
                this._cageM.combosSet.addCombo(combo);
            }
        } else {
            this._cellMs.forEach(cellM => {
                context.processCell(cellM, step, () => {
                    Array.from(cellM.numOpts()).forEach(num => {
                        context.processNum(num, step, () => {
                            has = this.hasSumMatchingPermutationsRecursive(currentSum + num, step + 1, context) || has;
                        });
                    });
                });
            });
        }

        return has;
    }

}
