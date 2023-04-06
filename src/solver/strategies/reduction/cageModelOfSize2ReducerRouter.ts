import { logFactory } from '../../../util/logFactory';
import { CageModel } from '../../models/elements/cageModel';
import { CellModel } from '../../models/elements/cellModel';
import { CageModelReducer } from './cageModelReducer';
import { MasterModelReduction } from './masterModelReduction';
import { performance, PerformanceObserver } from 'perf_hooks';

const log = logFactory.withLabel('perf');

const perfObserver = new PerformanceObserver(() => {
    // No-op.
});
perfObserver.observe({ entryTypes: [ 'measure' ], buffered: true });

export class Stat {

    numsAfterReductionCellM0?: ReadonlyArray<number>;
    numsAfterReductionCellM1?: ReadonlyArray<number>;
    combosCountAfterReduction?: number;
    isFullReduction = true;
    duration = 0;

    constructor(
            readonly cageKey: string,
            readonly presentNumsCellM0: ReadonlyArray<number>,
            readonly presentNumsCellM1: ReadonlyArray<number>,
            readonly presentNumsCount: number,
            readonly deletedBeforeReductionNumsCellM0: ReadonlyArray<number>,
            readonly deletedBeforeReductionNumsCellM1: ReadonlyArray<number>,
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
    private readonly _cellM0: CellModel;
    private readonly _cellM1: CellModel;
    private readonly _fullReducer: CageModelReducer;
    private readonly _partialReducer: CageModelReducer;

    static isAlwaysApplyFullReduction = false;

    static collectPerfStats = true;

    constructor(cageM: CageModel, fullReducer: CageModelReducer, partialReducer: CageModelReducer) {
        this._cageM = cageM;
        this._cellM0 = cageM.cellMs[0];
        this._cellM1 = cageM.cellMs[1];
        this._fullReducer = fullReducer;
        this._partialReducer = partialReducer;
    }

    /**
     * @see CageModelReducer.reduce
     */
    reduce(reduction: MasterModelReduction): void {
        if (CageModelOfSize2ReducerRouter.collectPerfStats) {
            const deletedNumsCellM0 = reduction.deletedNumOptsOf(this._cellM0).nums;
            const deletedNumsCellM1 = reduction.deletedNumOptsOf(this._cellM1).nums;
            const stat = new Stat(
                this._cageM.cage.key,
                this._cellM0.numOpts(),
                this._cellM1.numOpts(),
                this._cellM0.numOpts().length + this._cellM1.numOpts().length,
                deletedNumsCellM0,
                deletedNumsCellM1,
                deletedNumsCellM0.length + deletedNumsCellM1.length,
                this._cageM.comboSet.size
            );

            performance.mark('reduce-start');
            stat.isFullReduction = this.doReduce(reduction);
            performance.mark('reduce-end');

            stat.numsAfterReductionCellM0 = this._cellM0.numOpts();
            stat.numsAfterReductionCellM1 = this._cellM1.numOpts();
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

    private doReduce(reduction: MasterModelReduction): boolean {
        if (CageModelOfSize2ReducerRouter.isAlwaysApplyFullReduction) {
            this._fullReducer.reduce(reduction);
            return true;
        } else {
            if (this._cageM.isFirstReduction) {
                this._fullReducer.reduce(reduction);
                return true;
            } else {
                this._partialReducer.reduce(reduction);
                return false;
            }
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
                `presentNumsCellM0: ${stat.presentNumsCellM0}, ` +
                `presentNumsCellM1: ${stat.presentNumsCellM1}, ` +
                `presentNumsCount: ${stat.presentNumsCount}, ` +
                `deletedBeforeReductionNumsCellM0: ${stat.deletedBeforeReductionNumsCellM0}, ` +
                `deletedBeforeReductionNumsCellM1: ${stat.deletedBeforeReductionNumsCellM1}, ` +
                `deletedNumsCount: ${stat.deletedNumsCount}, ` +
                `combosCountBeforeReduction: ${stat.combosCountBeforeReduction}, ` +
                `numsAfterReductionCellM0: ${stat.numsAfterReductionCellM0}, ` +
                `numsAfterReductionCellM1: ${stat.numsAfterReductionCellM1}, ` +
                `combosCountAfterReduction: ${stat.combosCountAfterReduction}, ` +
                `isFullReduction: ${stat.isFullReduction}` +
                (isPrintDuration ? `: ${stat.duration} ms }` : ' }'));
    }

}