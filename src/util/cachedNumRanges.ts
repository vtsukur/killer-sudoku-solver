import * as _ from 'lodash';

export class CachedNumRanges {

    static readonly ZERO_TO_N_LTE_81: ReadonlyArray<ReadonlyArray<number>> = (() => {
        const val = new Array<ReadonlyArray<number>>(81 + 1);
        for (const i of _.range(val.length)) {
            val[i] = _.range(i);
        }
        return val;
    })();

    static readonly ONE_TO_N_LTE_10: ReadonlyArray<ReadonlyArray<number>> = (() => {
        const val = new Array<ReadonlyArray<number>>(10 + 1);
        for (const i of _.range(val.length)) {
            val[i] = _.range(1, i);
        }
        return val;
    })();

}
