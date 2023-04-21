import * as fs from 'node:fs';
import { parse } from 'yaml';
import { SumCombinatorics } from '../../../math';
import { SudokuNumsSet } from '../../../sets';
import { CageSizeNReductionsDb } from './reductionDb';

export type ComboReductionState = {
    readonly isValid: boolean;
    readonly cell1KeepNumsBits: number;
    readonly cell2KeepNumsBits: number;
    readonly cell3KeepNumsBits: number;
};

export type ComboReductionStatesByComboByCNPS = ReadonlyArray<ReadonlyArray<ComboReductionState>>;

export type ComboReductionStatesBySumByComboByCNPS = ReadonlyArray<ComboReductionStatesByComboByCNPS>;

const INVALID_REDUCTION_STATE: ComboReductionState = {
    isValid: false,
    cell1KeepNumsBits: 0,
    cell2KeepNumsBits: 0,
    cell3KeepNumsBits: 0
};

const YAML_SOURCE_PATH = './src/solver/strategies/reduction/db/cage3_reductions.yaml';

const YAML_SOURCE_ENCODING = 'utf-8';

const REDUCTIONS_PER_COMBO_COUNT = Math.pow(2, 3 * 3);

export class CageModel3ReductionDb {

    /* istanbul ignore next */
    private constructor() {
        throw new Error('Non-contructible');
    }

    static readonly STATES: ComboReductionStatesBySumByComboByCNPS = this.readStates();

    private static readStates(): ComboReductionStatesBySumByComboByCNPS {
        const sourceDb = this.readFromYamlSourceSync();
        return this.buildStatesFrom(sourceDb);
    }

    private static readFromYamlSourceSync(): CageSizeNReductionsDb {
        return parse(fs.readFileSync(YAML_SOURCE_PATH, YAML_SOURCE_ENCODING)) as CageSizeNReductionsDb;
    }

    private static buildStatesFrom(sourceDb: CageSizeNReductionsDb) {
        const states = new Array<Array<Array<ComboReductionState>>>(SumCombinatorics.MAX_SUM_OF_CAGE_3 + 1);

        sourceDb.forEach(sumReductions => {
            states[sumReductions.sum] = sumReductions.combos.map(comboReductions => {
                const comboNumsBits = new SudokuNumsSet(comboReductions.combo).bitStore;

                const comboReductionStates = new Array<ComboReductionState>(REDUCTIONS_PER_COMBO_COUNT).fill(INVALID_REDUCTION_STATE);
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
