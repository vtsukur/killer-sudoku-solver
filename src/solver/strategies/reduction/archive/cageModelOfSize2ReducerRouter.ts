import { logFactory } from '../../../../util/logFactory';
import { CageModel } from '../../../models/elements/cageModel';
import { CellModel } from '../../../models/elements/cellModel';
import { CageModelOfSize2Reducer } from '../cageModelOfSize2Reducer';
import { CageModelReducer } from '../cageModelReducer';
import { MasterModelReduction } from '../masterModelReduction';
import { performance, PerformanceObserver } from 'perf_hooks';

const log = logFactory.withLabel('perf');

const perfObserver = new PerformanceObserver(() => {
    // No-op.
});
perfObserver.observe({ entryTypes: [ 'measure' ], buffered: true });

export class Stat {

    numsAfterReductionCellM1?: ReadonlyArray<number>;
    numsAfterReductionCellM2?: ReadonlyArray<number>;
    combosCountAfterReduction?: number;
    isFullReduction: boolean | undefined = true;
    duration = 0;

    constructor(
            readonly cageKey: string,
            readonly presentNumsCellM1: ReadonlyArray<number>,
            readonly presentNumsCellM2: ReadonlyArray<number>,
            readonly presentNumsCount: number,
            readonly deletedBeforeReductionNumsCellM1: ReadonlyArray<number>,
            readonly deletedBeforeReductionNumsCellM2: ReadonlyArray<number>,
            readonly deletedNumsCount: number,
            readonly combosCountBeforeReduction: number
    ) {
        // No-op.
    }
}

/**
 * Reduces possible numbers for {@link CellModel}s
 * within a {@link CageModel} of a {@link Cage} with 2 {@link Cell}s
 * by checking the validity of numbers' options given possible {@link Combo}s for the {@link CageModel}.
 *
 * @public
 */
export class CageModelOfSize2ReducerRouter implements CageModelReducer {

    private readonly _cageM: CageModel;
    private readonly _cellM1: CellModel;
    private readonly _cellM2: CellModel;
    private readonly _optimalReducer: CageModelOfSize2Reducer;
    private readonly _fullReducer: CageModelReducer;
    private readonly _partialReducer: CageModelReducer;

    static isAlwaysApplyOptimalReduction = true;

    static collectPerfStats = true;

    constructor(cageM: CageModel, fullReducer: CageModelReducer, partialReducer: CageModelReducer) {
        this._cageM = cageM;
        this._cellM1 = cageM.cellMs[0];
        this._cellM2 = cageM.cellMs[1];
        this._optimalReducer = new CageModelOfSize2Reducer(cageM);
        this._fullReducer = fullReducer;
        this._partialReducer = partialReducer;
    }

    /**
     * @see CageModelReducer.reduce
     */
    reduce(reduction: MasterModelReduction): void {
        if (CageModelOfSize2ReducerRouter.collectPerfStats) {
            const deletedNumsCellM1 = reduction.deletedNumOptsOf(this._cellM1).nums;
            const deletedNumsCellM2 = reduction.deletedNumOptsOf(this._cellM2).nums;
            const stat = new Stat(
                this._cageM.cage.key,
                this._cellM1.numOpts(),
                this._cellM2.numOpts(),
                this._cellM1.numOpts().length + this._cellM2.numOpts().length,
                deletedNumsCellM1,
                deletedNumsCellM2,
                deletedNumsCellM1.length + deletedNumsCellM2.length,
                this._cageM.comboSet.size
            );

            performance.mark('reduce-start');
            stat.isFullReduction = this.doReduce(reduction);
            performance.mark('reduce-end');

            stat.numsAfterReductionCellM1 = this._cellM1.numOpts();
            stat.numsAfterReductionCellM2 = this._cellM2.numOpts();
            stat.combosCountAfterReduction = this._cageM.comboSet.size;

            performance.measure('reduce', {
                detail: stat,
                start: 'reduce-start',
                end: 'reduce-end'
            });
        } else {
            this.doReduce(reduction);
        }
    }

    private doReduce(reduction: MasterModelReduction): boolean | undefined {
        const deletedNumOpts_cellM1 = reduction.deletedNumOptsOf(this._cellM1);
        const deletedNumOpts_cellM2 = reduction.deletedNumOptsOf(this._cellM2);

        //
        // Skipping reduction if the deletion of numbers did *not* ever happen
        // for `CageModel`'s `CellModel`s within the current `MasterModelReduction` state.
        //
        if (deletedNumOpts_cellM1.isEmpty && deletedNumOpts_cellM2.isEmpty) {
            return;
        }

        if (CageModelOfSize2ReducerRouter.isAlwaysApplyOptimalReduction) {
            this._optimalReducer.reduce(reduction);
            return;
        } else if (this._cageM.isFirstReduction ||
                (this._cageM.comboSet.size < deletedNumOpts_cellM1.size + deletedNumOpts_cellM2.size)) {
            this._fullReducer.reduce(reduction);
            return true;
        } else {
            this._partialReducer.reduce(reduction);
            return false;
        }
    }

    static captureMeasures(): ReadonlyArray<Stat> {
        const val = performance.getEntries()
                .filter(entry => entry.entryType === 'measure')
                .map(entry => {
                    const stat = entry.detail as Stat;
                    stat.duration = entry.duration;
                    return stat;
                });
        performance.clearMarks();
        performance.clearMeasures();
        return val;
    }

    static printStat(stat: Stat, isPrintDuration = true) {
        log.info(`{ cageKey: ${stat.cageKey}, ` +
                `presentNumsCellM1: ${stat.presentNumsCellM1}, ` +
                `presentNumsCellM2: ${stat.presentNumsCellM2}, ` +
                `presentNumsCount: ${stat.presentNumsCount}, ` +
                `deletedBeforeReductionNumsCellM1: ${stat.deletedBeforeReductionNumsCellM1}, ` +
                `deletedBeforeReductionNumsCellM2: ${stat.deletedBeforeReductionNumsCellM2}, ` +
                `deletedNumsCount: ${stat.deletedNumsCount}, ` +
                `combosCountBeforeReduction: ${stat.combosCountBeforeReduction}, ` +
                `numsAfterReductionCellM1: ${stat.numsAfterReductionCellM1}, ` +
                `numsAfterReductionCellM2: ${stat.numsAfterReductionCellM2}, ` +
                `combosCountAfterReduction: ${stat.combosCountAfterReduction}, ` +
                `isFullReduction: ${stat.isFullReduction}` +
                (isPrintDuration ? `: ${stat.duration} ms }` : ' }'));
    }

}
