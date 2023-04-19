import * as fs from 'node:fs';
import { parse } from 'yaml';
import { Combo, SumAddendsCombinatorics } from '../../../math';
import { SudokuNumsSet } from '../../../sets';
import { CageSizeNReductionsDb } from './reductionDb';

export type ComboReductionState = {
    readonly isValid: boolean;
    readonly cell1KeepNumsBits: number;
    readonly cell2KeepNumsBits: number;
    readonly cell3KeepNumsBits: number;
};

const INVALID_REDUCTION_STATE: ComboReductionState = {
    isValid: false,
    cell1KeepNumsBits: 0,
    cell2KeepNumsBits: 0,
    cell3KeepNumsBits: 0
};

export class CageModel3ReductionDb {

    /* istanbul ignore next */
    private constructor() {
        throw new Error('Non-contructible');
    }

    private static readonly YAML_SOURCE_PATH = './src/solver/strategies/reduction/db/cage3_reductions.yaml';

    private static readonly YAML_SOURCE_ENCODING = 'utf-8';

    private static readonly REDUCTIONS_PER_COMBO_COUNT = Math.pow(2, 3 * 3);

    static readonly STATES: ReadonlyArray<ReadonlyArray<ReadonlyArray<ComboReductionState>>> = this.readStates();

    private static readStates(): ReadonlyArray<ReadonlyArray<ReadonlyArray<ComboReductionState>>> {
        const sourceDb = this.readFromYamlSourceSync();
        return this.buildStatesFrom(sourceDb);
    }

    private static readFromYamlSourceSync(): CageSizeNReductionsDb {
        return parse(fs.readFileSync(this.YAML_SOURCE_PATH, this.YAML_SOURCE_ENCODING)) as CageSizeNReductionsDb;
    }

    private static buildStatesFrom(sourceDb: CageSizeNReductionsDb) {
        const states = new Array<Array<ReadonlyArray<ComboReductionState>>>(SumAddendsCombinatorics.MAX_SUM_OF_CAGE_3 + 1);

        sourceDb.forEach(sumReductions => {
            states[sumReductions.sum] = sumReductions.combos.map(comboReductions => {
                const comboNumsBits = Combo.of(...comboReductions.combo).numsSet.bitStore;

                const comboReductionStates = new Array<ComboReductionState>(this.REDUCTIONS_PER_COMBO_COUNT).fill(INVALID_REDUCTION_STATE);
                for (const entry of comboReductions.entries) {
                    comboReductionStates[entry.state] = (entry.actions) ? {
                        isValid: true,
                        cell1KeepNumsBits: comboNumsBits & ~new SudokuNumsSet(entry.actions.deleteNums[0]).bitStore,
                        cell2KeepNumsBits: comboNumsBits & ~new SudokuNumsSet(entry.actions.deleteNums[1]).bitStore,
                        cell3KeepNumsBits: comboNumsBits & ~new SudokuNumsSet(entry.actions.deleteNums[2]).bitStore
                    } : {
                        isValid: true,
                        cell1KeepNumsBits: comboNumsBits,
                        cell2KeepNumsBits: comboNumsBits,
                        cell3KeepNumsBits: comboNumsBits
                    };
                }
                return comboReductionStates;
            });
        });

        return states;
    }

}
