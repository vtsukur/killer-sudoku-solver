import * as fs from 'node:fs';
import { parse } from 'yaml';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Cage } from '../../../../puzzle/cage';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Cell } from '../../../../puzzle/cell';
import { SRC_SOLVER_PATH, UTF8_ENCODING } from '../../../../util/files';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Combo, SumCombinatorics } from '../../../math';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Bits32, SudokuNumsSet } from '../../../sets';
import { Bits32Set } from '../../../sets/bits32Set';
import { CageSizeNReductionsDb } from './reductionDb';

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
     * The bits of the {@link SudokuNumsSet} to keep in the first {@link Cell}
     * after reduction.
     */
    readonly keepCell1NumsBits: Bits32;

    /**
     * The bits of the {@link SudokuNumsSet} to keep in the second {@link Cell}
     * after reduction.
     */
    readonly keepCell2NumsBits: Bits32;

    /**
     * The bits of the {@link SudokuNumsSet} to keep in the third {@link Cell}
     * after reduction.
     */
    readonly keepCell3NumsBits: Bits32;

};

/**
 * Creates a new valid {@link ComboReductionState},
 * which should result in an _actionable reduction_,
 * meaning it instructs to delete some of the _current possible numbers_ in at least one {@link Cell}.
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
 * which should result in a _non-actionable reduction_,
 * meaning it instructs to keep all _current possible numbers_ for all {@link Cell}s.
 *
 * @param comboNumsBits - Bits of the {@link Combo}'s {@link SudokuNumsSet}.
 *
 * @returns New {@link ComboReductionState}, which should result in a _non-actionable reduction_.
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
 * @param keepCell1NumsBits - Bits of the first {@link Cell}'s {@link SudokuNumsSet} to retain after the reduction.
 * @param keepCell2NumsBits - Bits of the second {@link Cell}'s {@link SudokuNumsSet} to retain after the reduction.
 * @param keepCell3NumsBits - Bits of the third {@link Cell}'s {@link SudokuNumsSet} to retain after the reduction.
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

/**
 * Path to the YAML source file of the {@link CageModel3ReductionDb}.
 */
const YAML_SOURCE_PATH = `${SRC_SOLVER_PATH}/strategies/reduction/db/cage3_reductions.yaml`;

/**
 * The amount of numbers per {@link Combo} in a {@link Cage} with 3 {@link Cell}s.
 */
const COMBO_NUM_COUNT = 3;

/**
 * The number of {@link Cell}s in a {@link Cage} with 3 {@link Cell}s.
 */
const CELL_COUNT = 3;

/**
 * The total number of _possible {@link Combo} numbers states_ (or _{@link Combo} PNSs_),
 * which is `2 ^ (3 * 3) = 2 ^ 9 = 512`.
 */
const PNS_VARIATION_COUNT = Math.pow(2, CELL_COUNT * COMBO_NUM_COUNT);

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
                const comboNumsBits = Bits32Set.bitsOf(comboReductions.combo);

                const comboReductionStates = new Array<ComboReductionState>(PNS_VARIATION_COUNT).fill(INVALID_REDUCTION_STATE);
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
