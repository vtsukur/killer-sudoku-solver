import * as _ from 'lodash';

export class CachedNumRanges {

    // should be LTE
    static ZERO_TO_N_LT_81: ReadonlyArray<ReadonlyArray<number>> = (() => {
        const val = new Array<ReadonlyArray<number>>(81 + 1);
        for (const i of _.range(val.length)) {
            val[i] = _.range(i);
        }
        return val;
    })();

    static ONE_TO_N_LT_10: ReadonlyArray<ReadonlyArray<number>> = (() => {
        const val = new Array<ReadonlyArray<number>>(10 + 1);
        for (const i of _.range(val.length)) {
            val[i] = _.range(1, i);
        }
        return val;
    })();

}
