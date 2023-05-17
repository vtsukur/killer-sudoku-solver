import { parse } from 'yaml';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Cage } from '../../../../puzzle/cage';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Cell } from '../../../../puzzle/cell';
import { SRC_SOLVER_PATH, readTextFileSync } from '../../../../util/files';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Combo, SumCombinatorics } from '../../../math';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Bits32, SudokuNumsSet } from '../../../sets';
import { Bits32Set } from '../../../sets/bits32Set';
import { CageSizeNReductionsDb } from './reductionDb';

/**
 * The reduction of a {@link Cage} with 3 {@link Cell}s
 * for a particular {@link Combo} and
 * particular sets of _possible numbers_ for each {@link Cell} in a {@link Cage}.
 *
 * @public
 */
export type CageComboReduction = {

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
 * Creates a new valid _actionable_ {@link CageComboReduction},
 * meaning it instructs to delete
 * some of the _current possible numbers_ in at least one {@link Cell}.
 *
 * @param comboNumsBits - Bits of the {@link Combo}'s {@link SudokuNumsSet}.
 * @param deleteNums - The numbers to delete from the {@link Cell}s.
 * The first index is the {@link Cell} index in the range of `[0, 2]`.
 * The second index is the number to delete from the {@link Cell}.
 *
 * @returns New valid _actionable_ {@link CageComboReduction}.
 */
const newActionableCageComboReduction = (comboNumsBits: Bits32, deleteNums: ReadonlyArray<ReadonlyArray<number>>): CageComboReduction => {
    return newValidCageComboReduction(
        comboNumsBits & ~Bits32Set.bitsOf(deleteNums[0]),
        comboNumsBits & ~Bits32Set.bitsOf(deleteNums[1]),
        comboNumsBits & ~Bits32Set.bitsOf(deleteNums[2])
    );
};

/**
 * Creates a new valid _non-actionable_ {@link CageComboReduction},
 * meaning it instructs to keep
 * all _current possible numbers_ for all {@link Cell}s.
 *
 * @param comboNumsBits - Bits of the {@link Combo}'s {@link SudokuNumsSet}.
 *
 * @returns New valid _non-actionable_ {@link CageComboReduction}.
 */
const newNonActionableCageComboReduction = (comboNumsBits: Bits32): CageComboReduction => {
    return newValidCageComboReduction(
        comboNumsBits,
        comboNumsBits,
        comboNumsBits
    );
};

/**
 * Creates a new valid {@link CageComboReduction}.
 *
 * @param keepCell1NumsBits - Bits of the first {@link Cell}'s {@link SudokuNumsSet} to retain after the reduction.
 * @param keepCell2NumsBits - Bits of the second {@link Cell}'s {@link SudokuNumsSet} to retain after the reduction.
 * @param keepCell3NumsBits - Bits of the third {@link Cell}'s {@link SudokuNumsSet} to retain after the reduction.
 *
 * @returns New valid {@link CageComboReduction}.
 */
const newValidCageComboReduction = (keepCell1NumsBits: Bits32, keepCell2NumsBits: Bits32, keepCell3NumsBits: Bits32): CageComboReduction => {
    return Object.freeze({
        isValid: true,
        keepCell1NumsBits,
        keepCell2NumsBits,
        keepCell3NumsBits
    });
};

/**
 * The invalid reduction of a {@link Cage} with 3 {@link Cell}s
 * for a particular {@link Combo} and
 * particular sets of _possible numbers_ for each {@link Cell} in a {@link Cage}.
 */
const INVALID_CAGE_COMBO_REDUCTION: CageComboReduction = Object.freeze({
    isValid: false,
    keepCell1NumsBits: 0,
    keepCell2NumsBits: 0,
    keepCell3NumsBits: 0
});

/**
 * The read-only array of reductions of {@link Cage}s with 3 {@link Cell}s
 * for a particular {@link Combo}.
 *
 * The index is the numeric representation of the {@link Cage}'s
 * _present {@link Combo} numbers state_ (or _{@link Combo} PNS_).
 *
 * The value is the {@link CageComboReduction} for the {@link Cage}
 * according to the _{@link Combo} PNS_.
 *
 * @public
 */
type CageComboReductionsByPNS = ReadonlyArray<CageComboReduction>;

/**
 * The read-only array of reductions of {@link Cage}s with 3 {@link Cell}s
 * for a particular {@link Cage} / {@link Combo} sum.
 *
 * The first index is the index of the {@link Combo} within the {@link SumCombinatorics}.
 *
 * The second index is the numeric representation of the {@link Cage}'s
 * _present {@link Combo} numbers state_ (or _{@link Combo} PNS_).
 *
 * The value is the {@link CageComboReduction} for the {@link Cage}
 * according to the _{@link Combo} PNS_.
 *
 * @public
 */
export type CageComboReductionsByComboByPNS = ReadonlyArray<CageComboReductionsByPNS>;

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
 * The value is the {@link CageComboReduction} for the {@link Cage}
 * according to the _{@link Combo} PNS_.
 *
 * @public
 */
type CageComboReductionsBySumByComboByPNS = ReadonlyArray<CageComboReductionsByComboByPNS>;

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
const PNS_COUNT_PER_COMBO = Math.pow(2, CELL_COUNT * COMBO_NUM_COUNT);

/**
 * In-memory database of all reductions of {@link Cage}s with 3 {@link Cell}s.
 *
 * @public
 */
export class CageModel3ReductionDb {

    /* istanbul ignore next */
    private constructor() {
        throw new Error('Non-contructible');
    }

    /**
     * The read-only array of all reductions of {@link Cage}s with 3 {@link Cell}s.
     *
     * The first index is the sum of the {@link Cage}.
     *
     * The second index is the index of the {@link Combo} within the {@link SumCombinatorics}.
     *
     * The third index is the numeric representation of the {@link Cage}'s
     * _present {@link Combo} numbers state_ (or _{@link Combo} PNS_).
     *
     * The value is the {@link CageComboReduction} for the {@link Cage}
     * according to the _{@link Combo} PNS_.
     */
    static readonly REDUCTIONS_BY_SUM_BY_COMBO_BY_PNS: CageComboReductionsBySumByComboByPNS = this.readReductions();

    private static readReductions(): CageComboReductionsBySumByComboByPNS {
        const sourceDb = this.readFromYamlSourceSync();
        return this.buildReductionsFrom(sourceDb);
    }

    private static readFromYamlSourceSync(): CageSizeNReductionsDb {
        return parse(readTextFileSync(YAML_SOURCE_PATH)) as CageSizeNReductionsDb;
    }

    private static buildReductionsFrom(sourceDb: CageSizeNReductionsDb) {
        const reductions = new Array<Array<Array<CageComboReduction>>>(SumCombinatorics.MAX_SUM_OF_CAGE_3 + 1);

        sourceDb.forEach(sumReductions => {
            reductions[sumReductions.sum] = sumReductions.combos.map(comboReductions => {
                const comboNumsBits = Bits32Set.bitsOf(comboReductions.combo);

                const cageComboReductionsByPNS = new Array<CageComboReduction>(PNS_COUNT_PER_COMBO).fill(INVALID_CAGE_COMBO_REDUCTION);
                for (const entry of comboReductions.entries) {
                    cageComboReductionsByPNS[entry.state] = (entry.actions) ?
                            newActionableCageComboReduction(comboNumsBits, entry.actions.deleteNums) :
                            newNonActionableCageComboReduction(comboNumsBits);
                }

                return cageComboReductionsByPNS;
            });
        });

        return reductions;
    }

}
