import * as fs from 'node:fs';
import { parse } from 'yaml';
import { SumCombinatorics } from '../../../math';
import { Bits32, SudokuNumsSet } from '../../../sets';
import { CageSizeNReductionsDb } from './reductionDb';
import { SRC_SOLVER_PATH, UTF8_ENCODING } from '../../../../util/files';
import { Bits32Set } from '../../../sets/bits32Set';

/**
 * The state of a reduction of a {@link Cage} with 3 {@link Cell}s
 * for a particular {@link Combo} and
 * particular sets of _possible numbers_ for each {@link Cell} in a {@link Cage}.
 */
export type ComboReductionState = {

    /**
     * Whether the reduction is valid.
     */
    readonly isValid: boolean;

    /**
     * The bits of the {@link SudokuNumsSet} to keep in {@link Cell} 1
     * after reduction.
     */
    readonly keepCell1NumsBits: Bits32;

    /**
     * The bits of the {@link SudokuNumsSet} to keep in {@link Cell} 2
     * after reduction.
     */
    readonly keepCell2NumsBits: Bits32;

    /**
     * The bits of the {@link SudokuNumsSet} to keep in {@link Cell} 3
     * after reduction.
     */
    readonly keepCell3NumsBits: Bits32;

};

/**
 * Creates a new valid {@link ComboReductionState},
 * which should result in an _actionable reduction_,
 * meaning deletion of _possible numbers_ is necessary for at least one {@link Cell}.
 *
 * @param comboNumsBits - Bits of the {@link Combo}'s {@link SudokuNumsSet}.
 * @param deleteNums - The numbers to delete from the {@link Cell}s.
 * The first index is the {@link Cell} index in the range of `[0, 2]`.
 * The second index is the number to delete from the {@link Cell}.
 *
 * @returns New {@link ComboReductionState}, which should result in an _actionable reduction_.
 */
const newActionableComboReductionState = (comboNumsBits: Bits32, deleteNums: ReadonlyArray<ReadonlyArray<number>>): ComboReductionState => {
    return newValidComboReductionState(
        comboNumsBits & ~Bits32Set.bitsOf(deleteNums[0]),
        comboNumsBits & ~Bits32Set.bitsOf(deleteNums[1]),
        comboNumsBits & ~Bits32Set.bitsOf(deleteNums[2])
    );
};

/**
 * Creates a new valid {@link ComboReductionState},
 * which should *not* result in an _actionable reduction_,
 * meaning deletion of _possible numbers_ should not happen for all {@link Cell}s.
 *
 * @param comboNumsBits - Bits of the {@link Combo}'s {@link SudokuNumsSet}.
 *
 * @returns New {@link ComboReductionState}, which should *not* result in an _actionable reduction_.
 */
const newNonActionableComboReductionState = (comboNumsBits: Bits32): ComboReductionState => {
    return newValidComboReductionState(
        comboNumsBits,
        comboNumsBits,
        comboNumsBits
    );
};

/**
 * Creates a new valid {@link ComboReductionState}.
 *
 * @param keepCell1NumsBits - Bits of the first {@link Cell}'s {@link SudokuNumsSet}.
 * @param keepCell2NumsBits - Bits of the second {@link Cell}'s {@link SudokuNumsSet}.
 * @param keepCell3NumsBits - Bits of the third {@link Cell}'s {@link SudokuNumsSet}.
 *
 * @returns New {@link ComboReductionState}.
 */
const newValidComboReductionState = (keepCell1NumsBits: Bits32, keepCell2NumsBits: Bits32, keepCell3NumsBits: Bits32): ComboReductionState => {
    return Object.freeze({
        isValid: true,
        keepCell1NumsBits,
        keepCell2NumsBits,
        keepCell3NumsBits
    });
};

/**
 * The invalid state of a reduction of a {@link Cage} with 3 {@link Cell}s
 * for a particular {@link Combo} and
 * particular sets of _possible numbers_ for each {@link Cell} in a {@link Cage}.
 */
const INVALID_REDUCTION_STATE: ComboReductionState = Object.freeze({
    isValid: false,
    keepCell1NumsBits: 0,
    keepCell2NumsBits: 0,
    keepCell3NumsBits: 0
});

/**
 * The read-only array of the states of reductions of {@link Cage}s with 3 {@link Cell}s
 * for a particular {@link Combo}.
 *
 * The index is the numeric representation of the {@link Cage}'s
 * _present {@link Combo} numbers state_ (or _{@link Combo} PNS_).
 *
 * The value is the {@link ComboReductionState} for the {@link Cage}
 * according to the _{@link Combo} PNS_.
 */
export type ComboReductionStatesByPNS = ReadonlyArray<ComboReductionState>;

/**
 * The read-only array of the states of reductions of {@link Cage}s with 3 {@link Cell}s
 * for a particular {@link Cage} / {@link Combo} sum.
 *
 * The first index is the index of the {@link Combo} within the {@link SumCombinatorics}.
 *
 * The second index is the numeric representation of the {@link Cage}'s
 * _present {@link Combo} numbers state_ (or _{@link Combo} PNS_).
 *
 * The value is the {@link ComboReductionState} for the {@link Cage}
 * according to the _{@link Combo} PNS_.
 */
export type ComboReductionStatesByComboByPNS = ReadonlyArray<ComboReductionStatesByPNS>;

/**
 * The read-only array of all states of reductions of {@link Cage}s with 3 {@link Cell}s.
 *
 * The first index is the sum of the {@link Cage}.
 *
 * The second index is the index of the {@link Combo} within the {@link SumCombinatorics}.
 *
 * The third index is the numeric representation of the {@link Cage}'s
 * _present {@link Combo} numbers state_ (or _{@link Combo} PNS_).
 *
 * The value is the {@link ComboReductionState} for the {@link Cage}
 * according to the _{@link Combo} PNS_.
 */
export type ComboReductionStatesBySumByComboByPNS = ReadonlyArray<ComboReductionStatesByComboByPNS>;

const YAML_SOURCE_PATH = `${SRC_SOLVER_PATH}/strategies/reduction/db/cage3_reductions.yaml`;

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
        return parse(fs.readFileSync(YAML_SOURCE_PATH, UTF8_ENCODING)) as CageSizeNReductionsDb;
    }

    private static buildStatesFrom(sourceDb: CageSizeNReductionsDb) {
        const states = new Array<Array<Array<ComboReductionState>>>(SumCombinatorics.MAX_SUM_OF_CAGE_3 + 1);

        sourceDb.forEach(sumReductions => {
            states[sumReductions.sum] = sumReductions.combos.map(comboReductions => {
                const comboNumsBits = new SudokuNumsSet(comboReductions.combo).bits;

                const comboReductionStates = new Array<ComboReductionState>(REDUCTIONS_PER_COMBO_COUNT).fill(INVALID_REDUCTION_STATE);
                for (const entry of comboReductions.entries) {
                    comboReductionStates[entry.state] = (entry.actions) ?
                            newActionableComboReductionState(comboNumsBits, entry.actions.deleteNums) :
                            newNonActionableComboReductionState(comboNumsBits);
                }
                return comboReductionStates;
            });
        });

        return states;
    }

}
