import * as fs from 'node:fs';
import { parse } from 'yaml';
import { SumCombinatorics } from '../../../math';
import { SudokuNumsSet } from '../../../sets';
import { CageSizeNReductionsDb } from './reductionDb';

export type ComboReductionState = {
    readonly isValid: boolean;
    readonly keepCell1NumsBits: number;
    readonly keepCell2NumsBits: number;
    readonly keepCell3NumsBits: number;
};

export type ComboReductionStatesByComboByPNS = ReadonlyArray<ReadonlyArray<ComboReductionState>>;

export type ComboReductionStatesBySumByComboByPNS = ReadonlyArray<ComboReductionStatesByComboByPNS>;

const INVALID_REDUCTION_STATE: ComboReductionState = {
    isValid: false,
    keepCell1NumsBits: 0,
    keepCell2NumsBits: 0,
    keepCell3NumsBits: 0
};

const YAML_SOURCE_PATH = './src/solver/strategies/reduction/db/cage3_reductions.yaml';

const YAML_SOURCE_ENCODING = 'utf-8';

const NUM_OPTIONS_PER_COMBO_COUNT = 3;

const CELL_COUNT = 3;

const REDUCTIONS_PER_COMBO_COUNT = Math.pow(2, CELL_COUNT * NUM_OPTIONS_PER_COMBO_COUNT);

export class CageModel3ReductionDb {

    /* istanbul ignore next */
    private constructor() {
        throw new Error('Non-contructible');
    }

    static readonly STATES: ComboReductionStatesBySumByComboByPNS = this.readStates();

    private static readStates(): ComboReductionStatesBySumByComboByPNS {
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
                const comboNumsBits = new SudokuNumsSet(comboReductions.combo).bits;

                const comboReductionStates = new Array<ComboReductionState>(REDUCTIONS_PER_COMBO_COUNT).fill(INVALID_REDUCTION_STATE);
                for (const entry of comboReductions.entries) {
                    comboReductionStates[entry.state] = (entry.actions) ? {
                        isValid: true,
                        keepCell1NumsBits: comboNumsBits & ~new SudokuNumsSet(entry.actions.deleteNums[0]).bits,
                        keepCell2NumsBits: comboNumsBits & ~new SudokuNumsSet(entry.actions.deleteNums[1]).bits,
                        keepCell3NumsBits: comboNumsBits & ~new SudokuNumsSet(entry.actions.deleteNums[2]).bits
                    } : {
                        isValid: true,
                        keepCell1NumsBits: comboNumsBits,
                        keepCell2NumsBits: comboNumsBits,
                        keepCell3NumsBits: comboNumsBits
                    };
                }
                return comboReductionStates;
            });
        });

        return states;
    }

}
