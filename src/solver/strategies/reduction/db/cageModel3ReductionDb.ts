import * as fs from 'node:fs';
import { parse } from 'yaml';
import { Combo } from '../../../math';
import { SudokuNumsSet } from '../../../sets';
import { CageSizeNReductionsDb } from './reductionDb';

export type ReductionState = {
    isValid: boolean;
    keepNumsInCell1Bits: number;
    keepNumsInCell2Bits: number;
    keepNumsInCell3Bits: number;
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
        const db = this.readFromYamlSourceSync();
        return this.buildStatesFrom(db);
    }

    private static readFromYamlSourceSync(): CageSizeNReductionsDb {
        return parse(fs.readFileSync(this.YAML_SOURCE_PATH, this.YAML_SOURCE_ENCODING)) as CageSizeNReductionsDb;
    }

    private static buildStatesFrom(db: CageSizeNReductionsDb) {
        const states: Array<Array<ReadonlyArray<ReductionState>>> = new Array(db[db.length - 1].sum + 1);
        db.forEach(sumReductions => {
            states[sumReductions.sum] = sumReductions.combos.map(comboReductions => {
                const combo = Combo.of(...comboReductions.combo);
                const comboNumsSet = combo.numsSet;
                const reductionStates = new Array<ReductionState>(this.REDUCTIONS_PER_COMBO_COUNT).fill(INVALID_REDUCTION_STATE);
                for (const entry of comboReductions.entries) {
                    if (entry.actions) {
                        const cellM1DeletedNums = SudokuNumsSet.of(...entry.actions.deleteNums[0]);
                        const cellM2DeletedNums = SudokuNumsSet.of(...entry.actions.deleteNums[1]);
                        const cellM3DeletedNums = SudokuNumsSet.of(...entry.actions.deleteNums[2]);
                        reductionStates[entry.state] = {
                            isValid: true,
                            keepNumsInCell1Bits: comboNumsSet.bitStore & ~cellM1DeletedNums.bitStore,
                            keepNumsInCell2Bits: comboNumsSet.bitStore & ~cellM2DeletedNums.bitStore,
                            keepNumsInCell3Bits: comboNumsSet.bitStore & ~cellM3DeletedNums.bitStore
                        };
                    } else {
                        reductionStates[entry.state] = {
                            isValid: true,
                            keepNumsInCell1Bits: comboNumsSet.bitStore,
                            keepNumsInCell2Bits: comboNumsSet.bitStore,
                            keepNumsInCell3Bits: comboNumsSet.bitStore
                        };
                    }
                }
                return reductionStates;
            });
        });

        return states;
    }

}
