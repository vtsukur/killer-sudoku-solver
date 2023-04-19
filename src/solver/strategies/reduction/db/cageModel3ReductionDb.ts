import * as fs from 'node:fs';
import { parse } from 'yaml';
import { Combo, SumAddendsCombinatorics } from '../../../math';
import { SudokuNumsSet } from '../../../sets';
import { CageSizeNReductionsDb } from './reductionDb';

export type ReductionState = {
    readonly isValid: boolean;
    readonly keepNumsInCell1Bits: number;
    readonly keepNumsInCell2Bits: number;
    readonly keepNumsInCell3Bits: number;
};

const INVALID_REDUCTION_STATE: ReductionState = {
    isValid: false,
    keepNumsInCell1Bits: 0,
    keepNumsInCell2Bits: 0,
    keepNumsInCell3Bits: 0
};

export class CageModel3ReductionDb {

    /* istanbul ignore next */
    private constructor() {
        throw new Error('Non-contructible');
    }

    private static readonly YAML_SOURCE_PATH = './src/solver/strategies/reduction/db/cage3_reductions.yaml';

    private static readonly YAML_SOURCE_ENCODING = 'utf-8';

    private static readonly REDUCTIONS_PER_COMBO_COUNT = Math.pow(2, 3 * 3);

    static readonly STATES: ReadonlyArray<ReadonlyArray<ReadonlyArray<ReductionState>>> = this.readStates();

    private static readStates(): ReadonlyArray<ReadonlyArray<ReadonlyArray<ReductionState>>> {
        const sourceDb = this.readFromYamlSourceSync();
        return this.buildStatesFrom(sourceDb);
    }

    private static readFromYamlSourceSync(): CageSizeNReductionsDb {
        return parse(fs.readFileSync(this.YAML_SOURCE_PATH, this.YAML_SOURCE_ENCODING)) as CageSizeNReductionsDb;
    }

    private static buildStatesFrom(sourceDb: CageSizeNReductionsDb) {
        const states = new Array<Array<ReadonlyArray<ReductionState>>>(SumAddendsCombinatorics.MAX_SUM_OF_CAGE_3 + 1);

        sourceDb.forEach(sumReductions => {
            states[sumReductions.sum] = sumReductions.combos.map(comboReductions => {
                const comboNumsBits = Combo.of(...comboReductions.combo).numsSet.bitStore;

                const comboReductionStates = new Array<ReductionState>(this.REDUCTIONS_PER_COMBO_COUNT).fill(INVALID_REDUCTION_STATE);
                for (const entry of comboReductions.entries) {
                    comboReductionStates[entry.state] = (entry.actions) ? {
                        isValid: true,
                        keepNumsInCell1Bits: comboNumsBits & ~new SudokuNumsSet(entry.actions.deleteNums[0]).bitStore,
                        keepNumsInCell2Bits: comboNumsBits & ~new SudokuNumsSet(entry.actions.deleteNums[1]).bitStore,
                        keepNumsInCell3Bits: comboNumsBits & ~new SudokuNumsSet(entry.actions.deleteNums[2]).bitStore
                    } : {
                        isValid: true,
                        keepNumsInCell1Bits: comboNumsBits,
                        keepNumsInCell2Bits: comboNumsBits,
                        keepNumsInCell3Bits: comboNumsBits
                    };
                }
                return comboReductionStates;
            });
        });

        return states;
    }

}
