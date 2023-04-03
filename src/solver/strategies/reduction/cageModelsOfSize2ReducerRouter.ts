import { CageModel } from '../../models/elements/cageModel';
import { CellModel } from '../../models/elements/cellModel';
import { CageModelReducer } from './cageModelReducer';
import { MasterModelReduction } from './masterModelReduction';
import { performance, PerformanceObserver } from 'perf_hooks';

const perfObserver = new PerformanceObserver(() => {
    // No-op.
});
perfObserver.observe({ entryTypes: [ 'measure' ], buffered: true });

export type Stat = {
    presentNumsCount: number;
    deletedNumsCount: number;
    combosCount: number;
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
    private readonly _underlyingReducer: CageModelReducer;

    constructor(cageM: CageModel, underlyingReducer: CageModelReducer) {
        this._cageM = cageM;
        this._cellM0 = cageM.cellMs[0];
        this._cellM1 = cageM.cellMs[1];
        this._underlyingReducer = underlyingReducer;
    }

    /**
     * @see CageModelReducer.reduce
     */
    reduce(reduction: MasterModelReduction): void {
        const stat = {
            presentNumsCount: this._cellM0.numOpts().length + this._cellM1.numOpts().length,
            deletedNumsCount: reduction.deletedNumOptsOf(this._cellM0).nums.length + reduction.deletedNumOptsOf(this._cellM1).nums.length,
            combosCount: this._cageM.comboSet.size
        };

        performance.mark('reduce-start');

        this._underlyingReducer.reduce(reduction);

        performance.mark('reduce-end');
        performance.measure('reduce', {
            detail: stat,
            start: 'reduce-start',
            end: 'reduce-end'
        });
    }

}
