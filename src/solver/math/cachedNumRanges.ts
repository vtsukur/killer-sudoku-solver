import * as _ from 'lodash';

export class CachedNumRanges {

    static ZERO_TO_N_UP_TO_81: ReadonlyArray<ReadonlyArray<number>> = (function() {
        const val = new Array<ReadonlyArray<number>>(81);
        for (const i of _.range(val.length)) {
            val[i] = _.range(i);
        }
        return val;
    })();

    static ONE_TO_N_UP_TO_10: ReadonlyArray<ReadonlyArray<number>> = (function() {
        const val = new Array<ReadonlyArray<number>>(10);
        for (const i of _.range(val.length)) {
            val[i] = _.range(1, i);
        }
        return val;
    })();
}
