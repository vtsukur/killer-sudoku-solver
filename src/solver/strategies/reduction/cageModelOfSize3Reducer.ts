import { InvalidSolverStateError } from '../../invalidSolverStateError';
import { Combo } from '../../math';
import { CageModel } from '../../models/elements/cageModel';
import { CellModel } from '../../models/elements/cellModel';
import { CombosSet } from '../../sets';
import { CageModelOfSize3FullReducer } from './archive/cageModelOfSize3FullReducer';
import { CageModelReducer } from './cageModelReducer';
import { MasterModelReduction } from './masterModelReduction';

/**
 * Type alias for pre-coded denormalized reducing function
 * with hardcoded actions relevant to the specific `Combo` numbers in the `CellModel`s.
 */
type DenormalizedTacticalReducer = (
    reduction: MasterModelReduction,
    cageM: CageModel,
    combosSet: CombosSet,
    combo: Combo,
    cellM1: CellModel,
    cellM2: CellModel,
    cellM3: CellModel
) => void;

/**
 * Reduces possible numbers for {@link CellModel}s
 * within a {@link CageModel} of a {@link Cage} with 3 {@link Cell}s
 * by checking the validity of numbers' options given possible {@link Combo}s for the {@link CageModel}.
 *
 * @public
 */
export class CageModelOfSize3Reducer implements CageModelReducer {

    /**
     * The {@link CageModel} to reduce.
     */
    private readonly _cageM: CageModel;

    /**
     * The first {@link CellModel} of the {@link CageModel}.
     */
    private readonly _cellM1: CellModel;

    /**
     * The second {@link CellModel} of the {@link CageModel}.
     */
    private readonly _cellM2: CellModel;

    /**
     * The third {@link CellModel} of the {@link CageModel}.
     */
    private readonly _cellM3: CellModel;

    private readonly _delegate: CageModelReducer;

    /**
     * Constructs a new reducer of possible numbers for {@link CellModel}s
     * within a {@link CageModel} of a {@link Cage} with 3 {@link Cell}s.
     *
     * @param cageM — The {@link CageModel} to reduce.
     */
    constructor(cageM: CageModel) {
        this._cageM = cageM;
        this._cellM1 = cageM.cellMs[0];
        this._cellM2 = cageM.cellMs[1];
        this._cellM3 = cageM.cellMs[2];
        this._delegate = new CageModelOfSize3FullReducer(cageM);
    }

    /**
     * @see CageModelReducer.reduce
     */
    reduce(reduction: MasterModelReduction): void {
        const denormalizedReducers = DENORMALIZED_TACTICAL_REDUCERS_FOR_SUMS[this._cageM.cage.sum];
        if (denormalizedReducers) {
            //
            // [PERFORMANCE] Storing possible numbers for both `CellModel`s as bit masks
            // for efficient low-level number check and manipulation.
            //
            const cellM1NumsBits = this._cellM1._numOptsSet.bitStore;
            const cellM2NumsBits = this._cellM2._numOptsSet.bitStore;
            const cellM3NumsBits = this._cellM3._numOptsSet.bitStore;

            const combosSet = this._cageM.comboSet;
            const combo = combosSet.combos[0];

            // [PERFORMANCE] Storing `Combo`'s unique numbers to access the object once for each number.
            const num1 = combo.number1;
            const num2 = combo.number2;
            const num3 = combo.number3;

            const compressedNumbersPresenceState =
                    ((cellM1NumsBits & (1 << num1)) >> num1) |
                    ((cellM1NumsBits & (1 << num2)) >> (num2 - 1)) |
                    ((cellM1NumsBits & (1 << num3)) >> (num3 - 2)) |
                    (
                        ((cellM2NumsBits & (1 << num1)) >> num1) |
                        ((cellM2NumsBits & (1 << num2)) >> (num2 - 1)) |
                        ((cellM2NumsBits & (1 << num3)) >> (num3 - 2))
                    ) << 3 |
                    (
                        ((cellM3NumsBits & (1 << num1)) >> num1) |
                        ((cellM3NumsBits & (1 << num2)) >> (num2 - 1)) |
                        ((cellM3NumsBits & (1 << num3)) >> (num3 - 2))
                    ) << 6;

            denormalizedReducers[compressedNumbersPresenceState](
                reduction, this._cageM, combosSet, combo,
                this._cellM1, this._cellM2, this._cellM3
            );
        } else {
            this._delegate.reduce(reduction);
        }
    }

}

const DENORMALIZED_TACTICAL_REDUCERS_FOR_SUM_OF_6: ReadonlyArray<DenormalizedTacticalReducer> = [
    // `0b000_000_000 = 0`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_000_001 = 1`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_000_010 = 2`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_000_011 = 3`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_000_100 = 4`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_000_101 = 5`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_000_110 = 6`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_000_111 = 7`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_001_000 = 8`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_001_001 = 9`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_001_010 = 10`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_001_011 = 11`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_001_100 = 12`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_001_101 = 13`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_001_110 = 14`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_001_111 = 15`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_010_000 = 16`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_010_001 = 17`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_010_010 = 18`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_010_011 = 19`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_010_100 = 20`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_010_101 = 21`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_010_110 = 22`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_010_111 = 23`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_011_000 = 24`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_011_001 = 25`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_011_010 = 26`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_011_011 = 27`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_011_100 = 28`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_011_101 = 29`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_011_110 = 30`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_011_111 = 31`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_100_000 = 32`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_100_001 = 33`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_100_010 = 34`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_100_011 = 35`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_100_100 = 36`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_100_101 = 37`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_100_110 = 38`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_100_111 = 39`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_101_000 = 40`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_101_001 = 41`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_101_010 = 42`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_101_011 = 43`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_101_100 = 44`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_101_101 = 45`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_101_110 = 46`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_101_111 = 47`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_110_000 = 48`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_110_001 = 49`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_110_010 = 50`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_110_011 = 51`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_110_100 = 52`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_110_101 = 53`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_110_110 = 54`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_110_111 = 55`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_111_000 = 56`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_111_001 = 57`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_111_010 = 58`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_111_011 = 59`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_111_100 = 60`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_111_101 = 61`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_111_110 = 62`
    IMPOSSIBLE_TO_REDUCE,
    // `0b000_111_111 = 63`
    IMPOSSIBLE_TO_REDUCE,
    // `0b001_000_000 = 64`
    IMPOSSIBLE_TO_REDUCE,
    // `0b001_000_001 = 65`
    IMPOSSIBLE_TO_REDUCE,
    // `0b001_000_010 = 66`
    IMPOSSIBLE_TO_REDUCE,
    // `0b001_000_011 = 67`
    IMPOSSIBLE_TO_REDUCE,
    // `0b001_000_100 = 68`
    IMPOSSIBLE_TO_REDUCE,
    // `0b001_000_101 = 69`
    IMPOSSIBLE_TO_REDUCE,
    // `0b001_000_110 = 70`
    IMPOSSIBLE_TO_REDUCE,
    // `0b001_000_111 = 71`
    IMPOSSIBLE_TO_REDUCE,
    // `0b001_001_000 = 72`
    IMPOSSIBLE_TO_REDUCE,
    // `0b001_001_001 = 73`
    IMPOSSIBLE_TO_REDUCE,
    // `0b001_001_010 = 74`
    IMPOSSIBLE_TO_REDUCE,
    // `0b001_001_011 = 75`
    IMPOSSIBLE_TO_REDUCE,
    // `0b001_001_100 = 76`
    IMPOSSIBLE_TO_REDUCE,
    // `0b001_001_101 = 77`
    IMPOSSIBLE_TO_REDUCE,
    // `0b001_001_110 = 78`
    IMPOSSIBLE_TO_REDUCE,
    // `0b001_001_111 = 79`
    IMPOSSIBLE_TO_REDUCE,
    // `0b001_010_000 = 80`
    IMPOSSIBLE_TO_REDUCE,
    // `0b001_010_001 = 81`
    IMPOSSIBLE_TO_REDUCE,
    // `0b001_010_010 = 82`
    IMPOSSIBLE_TO_REDUCE,
    // `0b001_010_011 = 83`
    IMPOSSIBLE_TO_REDUCE,
    // `0b001_010_100 = 84`
    NOTHING_TO_REDUCE,
    // `0b001_010_101 = 85`
    (reduction, cageM, _combosSet, _combo, cellM1) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
    },
    // `0b001_010_110 = 86`
    (reduction, cageM, _combosSet, _combo, cellM1) => {
        reduction.deleteNumOpt(cellM1, 2, cageM);
    },
    // `0b001_010_111 = 87`
    (reduction, cageM, _combosSet, _combo, cellM1) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
        reduction.deleteNumOpt(cellM1, 2, cageM);
    },
    // `0b001_011_000 = 88`
    IMPOSSIBLE_TO_REDUCE,
    // `0b001_011_001 = 89`
    IMPOSSIBLE_TO_REDUCE,
    // `0b001_011_010 = 90`
    IMPOSSIBLE_TO_REDUCE,
    // `0b001_011_011 = 91`
    IMPOSSIBLE_TO_REDUCE,
    // `0b001_011_100 = 92`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM2, 1, cageM);
    },
    // `0b001_011_101 = 93`
    (reduction, cageM, _combosSet, _combo, cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
        reduction.deleteNumOpt(cellM2, 1, cageM);
    },
    // `0b001_011_110 = 94`
    (reduction, cageM, _combosSet, _combo, cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM1, 2, cageM);
        reduction.deleteNumOpt(cellM2, 1, cageM);
    },
    // `0b001_011_111 = 95`
    (reduction, cageM, _combosSet, _combo, cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
        reduction.deleteNumOpt(cellM1, 2, cageM);
        reduction.deleteNumOpt(cellM2, 1, cageM);
    },
    // `0b001_100_000 = 96`
    IMPOSSIBLE_TO_REDUCE,
    // `0b001_100_001 = 97`
    IMPOSSIBLE_TO_REDUCE,
    // `0b001_100_010 = 98`
    NOTHING_TO_REDUCE,
    // `0b001_100_011 = 99`
    (reduction, cageM, _combosSet, _combo, cellM1) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
    },
    // `0b001_100_100 = 100`
    IMPOSSIBLE_TO_REDUCE,
    // `0b001_100_101 = 101`
    IMPOSSIBLE_TO_REDUCE,
    // `0b001_100_110 = 102`
    (reduction, cageM, _combosSet, _combo, cellM1) => {
        reduction.deleteNumOpt(cellM1, 3, cageM);
    },
    // `0b001_100_111 = 103`
    (reduction, cageM, _combosSet, _combo, cellM1) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
        reduction.deleteNumOpt(cellM1, 3, cageM);
    },
    // `0b001_101_000 = 104`
    IMPOSSIBLE_TO_REDUCE,
    // `0b001_101_001 = 105`
    IMPOSSIBLE_TO_REDUCE,
    // `0b001_101_010 = 106`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM2, 1, cageM);
    },
    // `0b001_101_011 = 107`
    (reduction, cageM, _combosSet, _combo, cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
        reduction.deleteNumOpt(cellM2, 1, cageM);
    },
    // `0b001_101_100 = 108`
    IMPOSSIBLE_TO_REDUCE,
    // `0b001_101_101 = 109`
    IMPOSSIBLE_TO_REDUCE,
    // `0b001_101_110 = 110`
    (reduction, cageM, _combosSet, _combo, cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM1, 3, cageM);
        reduction.deleteNumOpt(cellM2, 1, cageM);
    },
    // `0b001_101_111 = 111`
    (reduction, cageM, _combosSet, _combo, cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
        reduction.deleteNumOpt(cellM1, 3, cageM);
        reduction.deleteNumOpt(cellM2, 1, cageM);
    },
    // `0b001_110_000 = 112`
    IMPOSSIBLE_TO_REDUCE,
    // `0b001_110_001 = 113`
    IMPOSSIBLE_TO_REDUCE,
    // `0b001_110_010 = 114`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM2, 2, cageM);
    },
    // `0b001_110_011 = 115`
    (reduction, cageM, _combosSet, _combo, cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
        reduction.deleteNumOpt(cellM2, 2, cageM);
    },
    // `0b001_110_100 = 116`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM2, 3, cageM);
    },
    // `0b001_110_101 = 117`
    (reduction, cageM, _combosSet, _combo, cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
        reduction.deleteNumOpt(cellM2, 3, cageM);
    },
    // `0b001_110_110 = 118`
    NOTHING_TO_REDUCE,
    // `0b001_110_111 = 119`
    (reduction, cageM, _combosSet, _combo, cellM1) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
    },
    // `0b001_111_000 = 120`
    IMPOSSIBLE_TO_REDUCE,
    // `0b001_111_001 = 121`
    IMPOSSIBLE_TO_REDUCE,
    // `0b001_111_010 = 122`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM2, 1, cageM);
        reduction.deleteNumOpt(cellM2, 2, cageM);
    },
    // `0b001_111_011 = 123`
    (reduction, cageM, _combosSet, _combo, cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
        reduction.deleteNumOpt(cellM2, 1, cageM);
        reduction.deleteNumOpt(cellM2, 2, cageM);
    },
    // `0b001_111_100 = 124`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM2, 1, cageM);
        reduction.deleteNumOpt(cellM2, 3, cageM);
    },
    // `0b001_111_101 = 125`
    (reduction, cageM, _combosSet, _combo, cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
        reduction.deleteNumOpt(cellM2, 1, cageM);
        reduction.deleteNumOpt(cellM2, 3, cageM);
    },
    // `0b001_111_110 = 126`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM2, 1, cageM);
    },
    // `0b001_111_111 = 127`
    (reduction, cageM, _combosSet, _combo, cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
        reduction.deleteNumOpt(cellM2, 1, cageM);
    },
    // `0b010_000_000 = 128`
    IMPOSSIBLE_TO_REDUCE,
    // `0b010_000_001 = 129`
    IMPOSSIBLE_TO_REDUCE,
    // `0b010_000_010 = 130`
    IMPOSSIBLE_TO_REDUCE,
    // `0b010_000_011 = 131`
    IMPOSSIBLE_TO_REDUCE,
    // `0b010_000_100 = 132`
    IMPOSSIBLE_TO_REDUCE,
    // `0b010_000_101 = 133`
    IMPOSSIBLE_TO_REDUCE,
    // `0b010_000_110 = 134`
    IMPOSSIBLE_TO_REDUCE,
    // `0b010_000_111 = 135`
    IMPOSSIBLE_TO_REDUCE,
    // `0b010_001_000 = 136`
    IMPOSSIBLE_TO_REDUCE,
    // `0b010_001_001 = 137`
    IMPOSSIBLE_TO_REDUCE,
    // `0b010_001_010 = 138`
    IMPOSSIBLE_TO_REDUCE,
    // `0b010_001_011 = 139`
    IMPOSSIBLE_TO_REDUCE,
    // `0b010_001_100 = 140`
    NOTHING_TO_REDUCE,
    // `0b010_001_101 = 141`
    (reduction, cageM, _combosSet, _combo, cellM1) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
    },
    // `0b010_001_110 = 142`
    (reduction, cageM, _combosSet, _combo, cellM1) => {
        reduction.deleteNumOpt(cellM1, 2, cageM);
    },
    // `0b010_001_111 = 143`
    (reduction, cageM, _combosSet, _combo, cellM1) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
        reduction.deleteNumOpt(cellM1, 2, cageM);
    },
    // `0b010_010_000 = 144`
    IMPOSSIBLE_TO_REDUCE,
    // `0b010_010_001 = 145`
    IMPOSSIBLE_TO_REDUCE,
    // `0b010_010_010 = 146`
    IMPOSSIBLE_TO_REDUCE,
    // `0b010_010_011 = 147`
    IMPOSSIBLE_TO_REDUCE,
    // `0b010_010_100 = 148`
    IMPOSSIBLE_TO_REDUCE,
    // `0b010_010_101 = 149`
    IMPOSSIBLE_TO_REDUCE,
    // `0b010_010_110 = 150`
    IMPOSSIBLE_TO_REDUCE,
    // `0b010_010_111 = 151`
    IMPOSSIBLE_TO_REDUCE,
    // `0b010_011_000 = 152`
    IMPOSSIBLE_TO_REDUCE,
    // `0b010_011_001 = 153`
    IMPOSSIBLE_TO_REDUCE,
    // `0b010_011_010 = 154`
    IMPOSSIBLE_TO_REDUCE,
    // `0b010_011_011 = 155`
    IMPOSSIBLE_TO_REDUCE,
    // `0b010_011_100 = 156`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM2, 2, cageM);
    },
    // `0b010_011_101 = 157`
    (reduction, cageM, _combosSet, _combo, cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
        reduction.deleteNumOpt(cellM2, 2, cageM);
    },
    // `0b010_011_110 = 158`
    (reduction, cageM, _combosSet, _combo, cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM1, 2, cageM);
        reduction.deleteNumOpt(cellM2, 2, cageM);
    },
    // `0b010_011_111 = 159`
    (reduction, cageM, _combosSet, _combo, cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
        reduction.deleteNumOpt(cellM1, 2, cageM);
        reduction.deleteNumOpt(cellM2, 2, cageM);
    },
    // `0b010_100_000 = 160`
    IMPOSSIBLE_TO_REDUCE,
    // `0b010_100_001 = 161`
    NOTHING_TO_REDUCE,
    // `0b010_100_010 = 162`
    IMPOSSIBLE_TO_REDUCE,
    // `0b010_100_011 = 163`
    (reduction, cageM, _combosSet, _combo, cellM1) => {
        reduction.deleteNumOpt(cellM1, 2, cageM);
    },
    // `0b010_100_100 = 164`
    IMPOSSIBLE_TO_REDUCE,
    // `0b010_100_101 = 165`
    (reduction, cageM, _combosSet, _combo, cellM1) => {
        reduction.deleteNumOpt(cellM1, 3, cageM);
    },
    // `0b010_100_110 = 166`
    IMPOSSIBLE_TO_REDUCE,
    // `0b010_100_111 = 167`
    (reduction, cageM, _combosSet, _combo, cellM1) => {
        reduction.deleteNumOpt(cellM1, 2, cageM);
        reduction.deleteNumOpt(cellM1, 3, cageM);
    },
    // `0b010_101_000 = 168`
    IMPOSSIBLE_TO_REDUCE,
    // `0b010_101_001 = 169`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM2, 1, cageM);
    },
    // `0b010_101_010 = 170`
    IMPOSSIBLE_TO_REDUCE,
    // `0b010_101_011 = 171`
    (reduction, cageM, _combosSet, _combo, cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM1, 2, cageM);
        reduction.deleteNumOpt(cellM2, 1, cageM);
    },
    // `0b010_101_100 = 172`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM2, 3, cageM);
    },
    // `0b010_101_101 = 173`
    NOTHING_TO_REDUCE,
    // `0b010_101_110 = 174`
    (reduction, cageM, _combosSet, _combo, cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM1, 2, cageM);
        reduction.deleteNumOpt(cellM2, 3, cageM);
    },
    // `0b010_101_111 = 175`
    (reduction, cageM, _combosSet, _combo, cellM1) => {
        reduction.deleteNumOpt(cellM1, 2, cageM);
    },
    // `0b010_110_000 = 176`
    IMPOSSIBLE_TO_REDUCE,
    // `0b010_110_001 = 177`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM2, 2, cageM);
    },
    // `0b010_110_010 = 178`
    IMPOSSIBLE_TO_REDUCE,
    // `0b010_110_011 = 179`
    (reduction, cageM, _combosSet, _combo, cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM1, 2, cageM);
        reduction.deleteNumOpt(cellM2, 2, cageM);
    },
    // `0b010_110_100 = 180`
    IMPOSSIBLE_TO_REDUCE,
    // `0b010_110_101 = 181`
    (reduction, cageM, _combosSet, _combo, cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM1, 3, cageM);
        reduction.deleteNumOpt(cellM2, 2, cageM);
    },
    // `0b010_110_110 = 182`
    IMPOSSIBLE_TO_REDUCE,
    // `0b010_110_111 = 183`
    (reduction, cageM, _combosSet, _combo, cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM1, 2, cageM);
        reduction.deleteNumOpt(cellM1, 3, cageM);
        reduction.deleteNumOpt(cellM2, 2, cageM);
    },
    // `0b010_111_000 = 184`
    IMPOSSIBLE_TO_REDUCE,
    // `0b010_111_001 = 185`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM2, 1, cageM);
        reduction.deleteNumOpt(cellM2, 2, cageM);
    },
    // `0b010_111_010 = 186`
    IMPOSSIBLE_TO_REDUCE,
    // `0b010_111_011 = 187`
    (reduction, cageM, _combosSet, _combo, cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM1, 2, cageM);
        reduction.deleteNumOpt(cellM2, 1, cageM);
        reduction.deleteNumOpt(cellM2, 2, cageM);
    },
    // `0b010_111_100 = 188`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM2, 2, cageM);
        reduction.deleteNumOpt(cellM2, 3, cageM);
    },
    // `0b010_111_101 = 189`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM2, 2, cageM);
    },
    // `0b010_111_110 = 190`
    (reduction, cageM, _combosSet, _combo, cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM1, 2, cageM);
        reduction.deleteNumOpt(cellM2, 2, cageM);
        reduction.deleteNumOpt(cellM2, 3, cageM);
    },
    // `0b010_111_111 = 191`
    (reduction, cageM, _combosSet, _combo, cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM1, 2, cageM);
        reduction.deleteNumOpt(cellM2, 2, cageM);
    },
    // `0b011_000_000 = 192`
    IMPOSSIBLE_TO_REDUCE,
    // `0b011_000_001 = 193`
    IMPOSSIBLE_TO_REDUCE,
    // `0b011_000_010 = 194`
    IMPOSSIBLE_TO_REDUCE,
    // `0b011_000_011 = 195`
    IMPOSSIBLE_TO_REDUCE,
    // `0b011_000_100 = 196`
    IMPOSSIBLE_TO_REDUCE,
    // `0b011_000_101 = 197`
    IMPOSSIBLE_TO_REDUCE,
    // `0b011_000_110 = 198`
    IMPOSSIBLE_TO_REDUCE,
    // `0b011_000_111 = 199`
    IMPOSSIBLE_TO_REDUCE,
    // `0b011_001_000 = 200`
    IMPOSSIBLE_TO_REDUCE,
    // `0b011_001_001 = 201`
    IMPOSSIBLE_TO_REDUCE,
    // `0b011_001_010 = 202`
    IMPOSSIBLE_TO_REDUCE,
    // `0b011_001_011 = 203`
    IMPOSSIBLE_TO_REDUCE,
    // `0b011_001_100 = 204`
    (reduction, cageM, _combosSet, _combo, _cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM3, 1, cageM);
    },
    // `0b011_001_101 = 205`
    (reduction, cageM, _combosSet, _combo, cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
        reduction.deleteNumOpt(cellM3, 1, cageM);
    },
    // `0b011_001_110 = 206`
    (reduction, cageM, _combosSet, _combo, cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM1, 2, cageM);
        reduction.deleteNumOpt(cellM3, 1, cageM);
    },
    // `0b011_001_111 = 207`
    (reduction, cageM, _combosSet, _combo, cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
        reduction.deleteNumOpt(cellM1, 2, cageM);
        reduction.deleteNumOpt(cellM3, 1, cageM);
    },
    // `0b011_010_000 = 208`
    IMPOSSIBLE_TO_REDUCE,
    // `0b011_010_001 = 209`
    IMPOSSIBLE_TO_REDUCE,
    // `0b011_010_010 = 210`
    IMPOSSIBLE_TO_REDUCE,
    // `0b011_010_011 = 211`
    IMPOSSIBLE_TO_REDUCE,
    // `0b011_010_100 = 212`
    (reduction, cageM, _combosSet, _combo, _cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM3, 2, cageM);
    },
    // `0b011_010_101 = 213`
    (reduction, cageM, _combosSet, _combo, cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
        reduction.deleteNumOpt(cellM3, 2, cageM);
    },
    // `0b011_010_110 = 214`
    (reduction, cageM, _combosSet, _combo, cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM1, 2, cageM);
        reduction.deleteNumOpt(cellM3, 2, cageM);
    },
    // `0b011_010_111 = 215`
    (reduction, cageM, _combosSet, _combo, cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
        reduction.deleteNumOpt(cellM1, 2, cageM);
        reduction.deleteNumOpt(cellM3, 2, cageM);
    },
    // `0b011_011_000 = 216`
    IMPOSSIBLE_TO_REDUCE,
    // `0b011_011_001 = 217`
    IMPOSSIBLE_TO_REDUCE,
    // `0b011_011_010 = 218`
    IMPOSSIBLE_TO_REDUCE,
    // `0b011_011_011 = 219`
    IMPOSSIBLE_TO_REDUCE,
    // `0b011_011_100 = 220`
    NOTHING_TO_REDUCE,
    // `0b011_011_101 = 221`
    (reduction, cageM, _combosSet, _combo, cellM1) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
    },
    // `0b011_011_110 = 222`
    (reduction, cageM, _combosSet, _combo, cellM1) => {
        reduction.deleteNumOpt(cellM1, 2, cageM);
    },
    // `0b011_011_111 = 223`
    (reduction, cageM, _combosSet, _combo, cellM1) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
        reduction.deleteNumOpt(cellM1, 2, cageM);
    },
    // `0b011_100_000 = 224`
    IMPOSSIBLE_TO_REDUCE,
    // `0b011_100_001 = 225`
    (reduction, cageM, _combosSet, _combo, _cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM3, 1, cageM);
    },
    // `0b011_100_010 = 226`
    (reduction, cageM, _combosSet, _combo, _cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM3, 2, cageM);
    },
    // `0b011_100_011 = 227`
    NOTHING_TO_REDUCE,
    // `0b011_100_100 = 228`
    IMPOSSIBLE_TO_REDUCE,
    // `0b011_100_101 = 229`
    (reduction, cageM, _combosSet, _combo, cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM1, 3, cageM);
        reduction.deleteNumOpt(cellM3, 1, cageM);
    },
    // `0b011_100_110 = 230`
    (reduction, cageM, _combosSet, _combo, cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM1, 3, cageM);
        reduction.deleteNumOpt(cellM3, 2, cageM);
    },
    // `0b011_100_111 = 231`
    (reduction, cageM, _combosSet, _combo, cellM1) => {
        reduction.deleteNumOpt(cellM1, 3, cageM);
    },
    // `0b011_101_000 = 232`
    IMPOSSIBLE_TO_REDUCE,
    // `0b011_101_001 = 233`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM2, 1, cageM);
        reduction.deleteNumOpt(cellM3, 1, cageM);
    },
    // `0b011_101_010 = 234`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM2, 1, cageM);
        reduction.deleteNumOpt(cellM3, 2, cageM);
    },
    // `0b011_101_011 = 235`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM2, 1, cageM);
    },
    // `0b011_101_100 = 236`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM2, 3, cageM);
        reduction.deleteNumOpt(cellM3, 1, cageM);
    },
    // `0b011_101_101 = 237`
    (reduction, cageM, _combosSet, _combo, _cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM3, 1, cageM);
    },
    // `0b011_101_110 = 238`
    NOTHING_TO_REDUCE,
    // `0b011_101_111 = 239`
    NOTHING_TO_REDUCE,
    // `0b011_110_000 = 240`
    IMPOSSIBLE_TO_REDUCE,
    // `0b011_110_001 = 241`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM2, 2, cageM);
        reduction.deleteNumOpt(cellM3, 1, cageM);
    },
    // `0b011_110_010 = 242`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM2, 2, cageM);
        reduction.deleteNumOpt(cellM3, 2, cageM);
    },
    // `0b011_110_011 = 243`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM2, 2, cageM);
    },
    // `0b011_110_100 = 244`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM2, 3, cageM);
        reduction.deleteNumOpt(cellM3, 2, cageM);
    },
    // `0b011_110_101 = 245`
    NOTHING_TO_REDUCE,
    // `0b011_110_110 = 246`
    (reduction, cageM, _combosSet, _combo, _cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM3, 2, cageM);
    },
    // `0b011_110_111 = 247`
    NOTHING_TO_REDUCE,
    // `0b011_111_000 = 248`
    IMPOSSIBLE_TO_REDUCE,
    // `0b011_111_001 = 249`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM2, 1, cageM);
        reduction.deleteNumOpt(cellM2, 2, cageM);
        reduction.deleteNumOpt(cellM3, 1, cageM);
    },
    // `0b011_111_010 = 250`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM2, 1, cageM);
        reduction.deleteNumOpt(cellM2, 2, cageM);
        reduction.deleteNumOpt(cellM3, 2, cageM);
    },
    // `0b011_111_011 = 251`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM2, 1, cageM);
        reduction.deleteNumOpt(cellM2, 2, cageM);
    },
    // `0b011_111_100 = 252`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM2, 3, cageM);
    },
    // `0b011_111_101 = 253`
    NOTHING_TO_REDUCE,
    // `0b011_111_110 = 254`
    NOTHING_TO_REDUCE,
    // `0b011_111_111 = 255`
    NOTHING_TO_REDUCE,
    // `0b100_000_000 = 256`
    IMPOSSIBLE_TO_REDUCE,
    // `0b100_000_001 = 257`
    IMPOSSIBLE_TO_REDUCE,
    // `0b100_000_010 = 258`
    IMPOSSIBLE_TO_REDUCE,
    // `0b100_000_011 = 259`
    IMPOSSIBLE_TO_REDUCE,
    // `0b100_000_100 = 260`
    IMPOSSIBLE_TO_REDUCE,
    // `0b100_000_101 = 261`
    IMPOSSIBLE_TO_REDUCE,
    // `0b100_000_110 = 262`
    IMPOSSIBLE_TO_REDUCE,
    // `0b100_000_111 = 263`
    IMPOSSIBLE_TO_REDUCE,
    // `0b100_001_000 = 264`
    IMPOSSIBLE_TO_REDUCE,
    // `0b100_001_001 = 265`
    IMPOSSIBLE_TO_REDUCE,
    // `0b100_001_010 = 266`
    NOTHING_TO_REDUCE,
    // `0b100_001_011 = 267`
    (reduction, cageM, _combosSet, _combo, cellM1) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
    },
    // `0b100_001_100 = 268`
    IMPOSSIBLE_TO_REDUCE,
    // `0b100_001_101 = 269`
    IMPOSSIBLE_TO_REDUCE,
    // `0b100_001_110 = 270`
    (reduction, cageM, _combosSet, _combo, cellM1) => {
        reduction.deleteNumOpt(cellM1, 3, cageM);
    },
    // `0b100_001_111 = 271`
    (reduction, cageM, _combosSet, _combo, cellM1) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
        reduction.deleteNumOpt(cellM1, 3, cageM);
    },
    // `0b100_010_000 = 272`
    IMPOSSIBLE_TO_REDUCE,
    // `0b100_010_001 = 273`
    NOTHING_TO_REDUCE,
    // `0b100_010_010 = 274`
    IMPOSSIBLE_TO_REDUCE,
    // `0b100_010_011 = 275`
    (reduction, cageM, _combosSet, _combo, cellM1) => {
        reduction.deleteNumOpt(cellM1, 2, cageM);
    },
    // `0b100_010_100 = 276`
    IMPOSSIBLE_TO_REDUCE,
    // `0b100_010_101 = 277`
    (reduction, cageM, _combosSet, _combo, cellM1) => {
        reduction.deleteNumOpt(cellM1, 3, cageM);
    },
    // `0b100_010_110 = 278`
    IMPOSSIBLE_TO_REDUCE,
    // `0b100_010_111 = 279`
    (reduction, cageM, _combosSet, _combo, cellM1) => {
        reduction.deleteNumOpt(cellM1, 2, cageM);
        reduction.deleteNumOpt(cellM1, 3, cageM);
    },
    // `0b100_011_000 = 280`
    IMPOSSIBLE_TO_REDUCE,
    // `0b100_011_001 = 281`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM2, 1, cageM);
    },
    // `0b100_011_010 = 282`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM2, 2, cageM);
    },
    // `0b100_011_011 = 283`
    NOTHING_TO_REDUCE,
    // `0b100_011_100 = 284`
    IMPOSSIBLE_TO_REDUCE,
    // `0b100_011_101 = 285`
    (reduction, cageM, _combosSet, _combo, cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM1, 3, cageM);
        reduction.deleteNumOpt(cellM2, 1, cageM);
    },
    // `0b100_011_110 = 286`
    (reduction, cageM, _combosSet, _combo, cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM1, 3, cageM);
        reduction.deleteNumOpt(cellM2, 2, cageM);
    },
    // `0b100_011_111 = 287`
    (reduction, cageM, _combosSet, _combo, cellM1) => {
        reduction.deleteNumOpt(cellM1, 3, cageM);
    },
    // `0b100_100_000 = 288`
    IMPOSSIBLE_TO_REDUCE,
    // `0b100_100_001 = 289`
    IMPOSSIBLE_TO_REDUCE,
    // `0b100_100_010 = 290`
    IMPOSSIBLE_TO_REDUCE,
    // `0b100_100_011 = 291`
    IMPOSSIBLE_TO_REDUCE,
    // `0b100_100_100 = 292`
    IMPOSSIBLE_TO_REDUCE,
    // `0b100_100_101 = 293`
    IMPOSSIBLE_TO_REDUCE,
    // `0b100_100_110 = 294`
    IMPOSSIBLE_TO_REDUCE,
    // `0b100_100_111 = 295`
    IMPOSSIBLE_TO_REDUCE,
    // `0b100_101_000 = 296`
    IMPOSSIBLE_TO_REDUCE,
    // `0b100_101_001 = 297`
    IMPOSSIBLE_TO_REDUCE,
    // `0b100_101_010 = 298`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM2, 3, cageM);
    },
    // `0b100_101_011 = 299`
    (reduction, cageM, _combosSet, _combo, cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
        reduction.deleteNumOpt(cellM2, 3, cageM);
    },
    // `0b100_101_100 = 300`
    IMPOSSIBLE_TO_REDUCE,
    // `0b100_101_101 = 301`
    IMPOSSIBLE_TO_REDUCE,
    // `0b100_101_110 = 302`
    (reduction, cageM, _combosSet, _combo, cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM1, 3, cageM);
        reduction.deleteNumOpt(cellM2, 3, cageM);
    },
    // `0b100_101_111 = 303`
    (reduction, cageM, _combosSet, _combo, cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
        reduction.deleteNumOpt(cellM1, 3, cageM);
        reduction.deleteNumOpt(cellM2, 3, cageM);
    },
    // `0b100_110_000 = 304`
    IMPOSSIBLE_TO_REDUCE,
    // `0b100_110_001 = 305`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM2, 3, cageM);
    },
    // `0b100_110_010 = 306`
    IMPOSSIBLE_TO_REDUCE,
    // `0b100_110_011 = 307`
    (reduction, cageM, _combosSet, _combo, cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM1, 2, cageM);
        reduction.deleteNumOpt(cellM2, 3, cageM);
    },
    // `0b100_110_100 = 308`
    IMPOSSIBLE_TO_REDUCE,
    // `0b100_110_101 = 309`
    (reduction, cageM, _combosSet, _combo, cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM1, 3, cageM);
        reduction.deleteNumOpt(cellM2, 3, cageM);
    },
    // `0b100_110_110 = 310`
    IMPOSSIBLE_TO_REDUCE,
    // `0b100_110_111 = 311`
    (reduction, cageM, _combosSet, _combo, cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM1, 2, cageM);
        reduction.deleteNumOpt(cellM1, 3, cageM);
        reduction.deleteNumOpt(cellM2, 3, cageM);
    },
    // `0b100_111_000 = 312`
    IMPOSSIBLE_TO_REDUCE,
    // `0b100_111_001 = 313`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM2, 1, cageM);
        reduction.deleteNumOpt(cellM2, 3, cageM);
    },
    // `0b100_111_010 = 314`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM2, 2, cageM);
        reduction.deleteNumOpt(cellM2, 3, cageM);
    },
    // `0b100_111_011 = 315`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM2, 3, cageM);
    },
    // `0b100_111_100 = 316`
    IMPOSSIBLE_TO_REDUCE,
    // `0b100_111_101 = 317`
    (reduction, cageM, _combosSet, _combo, cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM1, 3, cageM);
        reduction.deleteNumOpt(cellM2, 1, cageM);
        reduction.deleteNumOpt(cellM2, 3, cageM);
    },
    // `0b100_111_110 = 318`
    (reduction, cageM, _combosSet, _combo, cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM1, 3, cageM);
        reduction.deleteNumOpt(cellM2, 2, cageM);
        reduction.deleteNumOpt(cellM2, 3, cageM);
    },
    // `0b100_111_111 = 319`
    (reduction, cageM, _combosSet, _combo, cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM1, 3, cageM);
        reduction.deleteNumOpt(cellM2, 3, cageM);
    },
    // `0b101_000_000 = 320`
    IMPOSSIBLE_TO_REDUCE,
    // `0b101_000_001 = 321`
    IMPOSSIBLE_TO_REDUCE,
    // `0b101_000_010 = 322`
    IMPOSSIBLE_TO_REDUCE,
    // `0b101_000_011 = 323`
    IMPOSSIBLE_TO_REDUCE,
    // `0b101_000_100 = 324`
    IMPOSSIBLE_TO_REDUCE,
    // `0b101_000_101 = 325`
    IMPOSSIBLE_TO_REDUCE,
    // `0b101_000_110 = 326`
    IMPOSSIBLE_TO_REDUCE,
    // `0b101_000_111 = 327`
    IMPOSSIBLE_TO_REDUCE,
    // `0b101_001_000 = 328`
    IMPOSSIBLE_TO_REDUCE,
    // `0b101_001_001 = 329`
    IMPOSSIBLE_TO_REDUCE,
    // `0b101_001_010 = 330`
    (reduction, cageM, _combosSet, _combo, _cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM3, 1, cageM);
    },
    // `0b101_001_011 = 331`
    (reduction, cageM, _combosSet, _combo, cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
        reduction.deleteNumOpt(cellM3, 1, cageM);
    },
    // `0b101_001_100 = 332`
    IMPOSSIBLE_TO_REDUCE,
    // `0b101_001_101 = 333`
    IMPOSSIBLE_TO_REDUCE,
    // `0b101_001_110 = 334`
    (reduction, cageM, _combosSet, _combo, cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM1, 3, cageM);
        reduction.deleteNumOpt(cellM3, 1, cageM);
    },
    // `0b101_001_111 = 335`
    (reduction, cageM, _combosSet, _combo, cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
        reduction.deleteNumOpt(cellM1, 3, cageM);
        reduction.deleteNumOpt(cellM3, 1, cageM);
    },
    // `0b101_010_000 = 336`
    IMPOSSIBLE_TO_REDUCE,
    // `0b101_010_001 = 337`
    (reduction, cageM, _combosSet, _combo, _cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM3, 1, cageM);
    },
    // `0b101_010_010 = 338`
    IMPOSSIBLE_TO_REDUCE,
    // `0b101_010_011 = 339`
    (reduction, cageM, _combosSet, _combo, cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM1, 2, cageM);
        reduction.deleteNumOpt(cellM3, 1, cageM);
    },
    // `0b101_010_100 = 340`
    (reduction, cageM, _combosSet, _combo, _cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b101_010_101 = 341`
    NOTHING_TO_REDUCE,
    // `0b101_010_110 = 342`
    (reduction, cageM, _combosSet, _combo, cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM1, 2, cageM);
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b101_010_111 = 343`
    (reduction, cageM, _combosSet, _combo, cellM1) => {
        reduction.deleteNumOpt(cellM1, 2, cageM);
    },
    // `0b101_011_000 = 344`
    IMPOSSIBLE_TO_REDUCE,
    // `0b101_011_001 = 345`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM2, 1, cageM);
        reduction.deleteNumOpt(cellM3, 1, cageM);
    },
    // `0b101_011_010 = 346`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM2, 2, cageM);
        reduction.deleteNumOpt(cellM3, 1, cageM);
    },
    // `0b101_011_011 = 347`
    (reduction, cageM, _combosSet, _combo, _cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM3, 1, cageM);
    },
    // `0b101_011_100 = 348`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM2, 1, cageM);
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b101_011_101 = 349`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM2, 1, cageM);
    },
    // `0b101_011_110 = 350`
    NOTHING_TO_REDUCE,
    // `0b101_011_111 = 351`
    NOTHING_TO_REDUCE,
    // `0b101_100_000 = 352`
    IMPOSSIBLE_TO_REDUCE,
    // `0b101_100_001 = 353`
    IMPOSSIBLE_TO_REDUCE,
    // `0b101_100_010 = 354`
    (reduction, cageM, _combosSet, _combo, _cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b101_100_011 = 355`
    (reduction, cageM, _combosSet, _combo, cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b101_100_100 = 356`
    IMPOSSIBLE_TO_REDUCE,
    // `0b101_100_101 = 357`
    IMPOSSIBLE_TO_REDUCE,
    // `0b101_100_110 = 358`
    (reduction, cageM, _combosSet, _combo, cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM1, 3, cageM);
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b101_100_111 = 359`
    (reduction, cageM, _combosSet, _combo, cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
        reduction.deleteNumOpt(cellM1, 3, cageM);
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b101_101_000 = 360`
    IMPOSSIBLE_TO_REDUCE,
    // `0b101_101_001 = 361`
    IMPOSSIBLE_TO_REDUCE,
    // `0b101_101_010 = 362`
    NOTHING_TO_REDUCE,
    // `0b101_101_011 = 363`
    (reduction, cageM, _combosSet, _combo, cellM1) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
    },
    // `0b101_101_100 = 364`
    IMPOSSIBLE_TO_REDUCE,
    // `0b101_101_101 = 365`
    IMPOSSIBLE_TO_REDUCE,
    // `0b101_101_110 = 366`
    (reduction, cageM, _combosSet, _combo, cellM1) => {
        reduction.deleteNumOpt(cellM1, 3, cageM);
    },
    // `0b101_101_111 = 367`
    (reduction, cageM, _combosSet, _combo, cellM1) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
        reduction.deleteNumOpt(cellM1, 3, cageM);
    },
    // `0b101_110_000 = 368`
    IMPOSSIBLE_TO_REDUCE,
    // `0b101_110_001 = 369`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM2, 3, cageM);
        reduction.deleteNumOpt(cellM3, 1, cageM);
    },
    // `0b101_110_010 = 370`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM2, 2, cageM);
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b101_110_011 = 371`
    NOTHING_TO_REDUCE,
    // `0b101_110_100 = 372`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM2, 3, cageM);
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b101_110_101 = 373`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM2, 3, cageM);
    },
    // `0b101_110_110 = 374`
    (reduction, cageM, _combosSet, _combo, _cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b101_110_111 = 375`
    NOTHING_TO_REDUCE,
    // `0b101_111_000 = 376`
    IMPOSSIBLE_TO_REDUCE,
    // `0b101_111_001 = 377`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM2, 1, cageM);
        reduction.deleteNumOpt(cellM2, 3, cageM);
        reduction.deleteNumOpt(cellM3, 1, cageM);
    },
    // `0b101_111_010 = 378`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM2, 2, cageM);
    },
    // `0b101_111_011 = 379`
    NOTHING_TO_REDUCE,
    // `0b101_111_100 = 380`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM2, 1, cageM);
        reduction.deleteNumOpt(cellM2, 3, cageM);
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b101_111_101 = 381`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM2, 1, cageM);
        reduction.deleteNumOpt(cellM2, 3, cageM);
    },
    // `0b101_111_110 = 382`
    NOTHING_TO_REDUCE,
    // `0b101_111_111 = 383`
    NOTHING_TO_REDUCE,
    // `0b110_000_000 = 384`
    IMPOSSIBLE_TO_REDUCE,
    // `0b110_000_001 = 385`
    IMPOSSIBLE_TO_REDUCE,
    // `0b110_000_010 = 386`
    IMPOSSIBLE_TO_REDUCE,
    // `0b110_000_011 = 387`
    IMPOSSIBLE_TO_REDUCE,
    // `0b110_000_100 = 388`
    IMPOSSIBLE_TO_REDUCE,
    // `0b110_000_101 = 389`
    IMPOSSIBLE_TO_REDUCE,
    // `0b110_000_110 = 390`
    IMPOSSIBLE_TO_REDUCE,
    // `0b110_000_111 = 391`
    IMPOSSIBLE_TO_REDUCE,
    // `0b110_001_000 = 392`
    IMPOSSIBLE_TO_REDUCE,
    // `0b110_001_001 = 393`
    IMPOSSIBLE_TO_REDUCE,
    // `0b110_001_010 = 394`
    (reduction, cageM, _combosSet, _combo, _cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM3, 2, cageM);
    },
    // `0b110_001_011 = 395`
    (reduction, cageM, _combosSet, _combo, cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
        reduction.deleteNumOpt(cellM3, 2, cageM);
    },
    // `0b110_001_100 = 396`
    (reduction, cageM, _combosSet, _combo, _cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b110_001_101 = 397`
    (reduction, cageM, _combosSet, _combo, cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b110_001_110 = 398`
    NOTHING_TO_REDUCE,
    // `0b110_001_111 = 399`
    (reduction, cageM, _combosSet, _combo, cellM1) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
    },
    // `0b110_010_000 = 400`
    IMPOSSIBLE_TO_REDUCE,
    // `0b110_010_001 = 401`
    (reduction, cageM, _combosSet, _combo, _cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM3, 2, cageM);
    },
    // `0b110_010_010 = 402`
    IMPOSSIBLE_TO_REDUCE,
    // `0b110_010_011 = 403`
    (reduction, cageM, _combosSet, _combo, cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM1, 2, cageM);
        reduction.deleteNumOpt(cellM3, 2, cageM);
    },
    // `0b110_010_100 = 404`
    IMPOSSIBLE_TO_REDUCE,
    // `0b110_010_101 = 405`
    (reduction, cageM, _combosSet, _combo, cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM1, 3, cageM);
        reduction.deleteNumOpt(cellM3, 2, cageM);
    },
    // `0b110_010_110 = 406`
    IMPOSSIBLE_TO_REDUCE,
    // `0b110_010_111 = 407`
    (reduction, cageM, _combosSet, _combo, cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM1, 2, cageM);
        reduction.deleteNumOpt(cellM1, 3, cageM);
        reduction.deleteNumOpt(cellM3, 2, cageM);
    },
    // `0b110_011_000 = 408`
    IMPOSSIBLE_TO_REDUCE,
    // `0b110_011_001 = 409`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM2, 1, cageM);
        reduction.deleteNumOpt(cellM3, 2, cageM);
    },
    // `0b110_011_010 = 410`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM2, 2, cageM);
        reduction.deleteNumOpt(cellM3, 2, cageM);
    },
    // `0b110_011_011 = 411`
    (reduction, cageM, _combosSet, _combo, _cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM3, 2, cageM);
    },
    // `0b110_011_100 = 412`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM2, 2, cageM);
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b110_011_101 = 413`
    NOTHING_TO_REDUCE,
    // `0b110_011_110 = 414`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM2, 2, cageM);
    },
    // `0b110_011_111 = 415`
    NOTHING_TO_REDUCE,
    // `0b110_100_000 = 416`
    IMPOSSIBLE_TO_REDUCE,
    // `0b110_100_001 = 417`
    (reduction, cageM, _combosSet, _combo, _cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b110_100_010 = 418`
    IMPOSSIBLE_TO_REDUCE,
    // `0b110_100_011 = 419`
    (reduction, cageM, _combosSet, _combo, cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM1, 2, cageM);
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b110_100_100 = 420`
    IMPOSSIBLE_TO_REDUCE,
    // `0b110_100_101 = 421`
    (reduction, cageM, _combosSet, _combo, cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM1, 3, cageM);
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b110_100_110 = 422`
    IMPOSSIBLE_TO_REDUCE,
    // `0b110_100_111 = 423`
    (reduction, cageM, _combosSet, _combo, cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM1, 2, cageM);
        reduction.deleteNumOpt(cellM1, 3, cageM);
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b110_101_000 = 424`
    IMPOSSIBLE_TO_REDUCE,
    // `0b110_101_001 = 425`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM2, 1, cageM);
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b110_101_010 = 426`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM2, 3, cageM);
        reduction.deleteNumOpt(cellM3, 2, cageM);
    },
    // `0b110_101_011 = 427`
    NOTHING_TO_REDUCE,
    // `0b110_101_100 = 428`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM2, 3, cageM);
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b110_101_101 = 429`
    (reduction, cageM, _combosSet, _combo, _cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b110_101_110 = 430`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM2, 3, cageM);
    },
    // `0b110_101_111 = 431`
    NOTHING_TO_REDUCE,
    // `0b110_110_000 = 432`
    IMPOSSIBLE_TO_REDUCE,
    // `0b110_110_001 = 433`
    NOTHING_TO_REDUCE,
    // `0b110_110_010 = 434`
    IMPOSSIBLE_TO_REDUCE,
    // `0b110_110_011 = 435`
    (reduction, cageM, _combosSet, _combo, cellM1) => {
        reduction.deleteNumOpt(cellM1, 2, cageM);
    },
    // `0b110_110_100 = 436`
    IMPOSSIBLE_TO_REDUCE,
    // `0b110_110_101 = 437`
    (reduction, cageM, _combosSet, _combo, cellM1) => {
        reduction.deleteNumOpt(cellM1, 3, cageM);
    },
    // `0b110_110_110 = 438`
    IMPOSSIBLE_TO_REDUCE,
    // `0b110_110_111 = 439`
    (reduction, cageM, _combosSet, _combo, cellM1) => {
        reduction.deleteNumOpt(cellM1, 2, cageM);
        reduction.deleteNumOpt(cellM1, 3, cageM);
    },
    // `0b110_111_000 = 440`
    IMPOSSIBLE_TO_REDUCE,
    // `0b110_111_001 = 441`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM2, 1, cageM);
    },
    // `0b110_111_010 = 442`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM2, 2, cageM);
        reduction.deleteNumOpt(cellM2, 3, cageM);
        reduction.deleteNumOpt(cellM3, 2, cageM);
    },
    // `0b110_111_011 = 443`
    NOTHING_TO_REDUCE,
    // `0b110_111_100 = 444`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM2, 2, cageM);
        reduction.deleteNumOpt(cellM2, 3, cageM);
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b110_111_101 = 445`
    NOTHING_TO_REDUCE,
    // `0b110_111_110 = 446`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2) => {
        reduction.deleteNumOpt(cellM2, 2, cageM);
        reduction.deleteNumOpt(cellM2, 3, cageM);
    },
    // `0b110_111_111 = 447`
    NOTHING_TO_REDUCE,
    // `0b111_000_000 = 448`
    IMPOSSIBLE_TO_REDUCE,
    // `0b111_000_001 = 449`
    IMPOSSIBLE_TO_REDUCE,
    // `0b111_000_010 = 450`
    IMPOSSIBLE_TO_REDUCE,
    // `0b111_000_011 = 451`
    IMPOSSIBLE_TO_REDUCE,
    // `0b111_000_100 = 452`
    IMPOSSIBLE_TO_REDUCE,
    // `0b111_000_101 = 453`
    IMPOSSIBLE_TO_REDUCE,
    // `0b111_000_110 = 454`
    IMPOSSIBLE_TO_REDUCE,
    // `0b111_000_111 = 455`
    IMPOSSIBLE_TO_REDUCE,
    // `0b111_001_000 = 456`
    IMPOSSIBLE_TO_REDUCE,
    // `0b111_001_001 = 457`
    IMPOSSIBLE_TO_REDUCE,
    // `0b111_001_010 = 458`
    (reduction, cageM, _combosSet, _combo, _cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM3, 1, cageM);
        reduction.deleteNumOpt(cellM3, 2, cageM);
    },
    // `0b111_001_011 = 459`
    (reduction, cageM, _combosSet, _combo, cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
        reduction.deleteNumOpt(cellM3, 1, cageM);
        reduction.deleteNumOpt(cellM3, 2, cageM);
    },
    // `0b111_001_100 = 460`
    (reduction, cageM, _combosSet, _combo, _cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM3, 1, cageM);
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b111_001_101 = 461`
    (reduction, cageM, _combosSet, _combo, cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
        reduction.deleteNumOpt(cellM3, 1, cageM);
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b111_001_110 = 462`
    (reduction, cageM, _combosSet, _combo, _cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM3, 1, cageM);
    },
    // `0b111_001_111 = 463`
    (reduction, cageM, _combosSet, _combo, cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM1, 1, cageM);
        reduction.deleteNumOpt(cellM3, 1, cageM);
    },
    // `0b111_010_000 = 464`
    IMPOSSIBLE_TO_REDUCE,
    // `0b111_010_001 = 465`
    (reduction, cageM, _combosSet, _combo, _cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM3, 1, cageM);
        reduction.deleteNumOpt(cellM3, 2, cageM);
    },
    // `0b111_010_010 = 466`
    IMPOSSIBLE_TO_REDUCE,
    // `0b111_010_011 = 467`
    (reduction, cageM, _combosSet, _combo, cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM1, 2, cageM);
        reduction.deleteNumOpt(cellM3, 1, cageM);
        reduction.deleteNumOpt(cellM3, 2, cageM);
    },
    // `0b111_010_100 = 468`
    (reduction, cageM, _combosSet, _combo, _cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM3, 2, cageM);
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b111_010_101 = 469`
    (reduction, cageM, _combosSet, _combo, _cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM3, 2, cageM);
    },
    // `0b111_010_110 = 470`
    (reduction, cageM, _combosSet, _combo, cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM1, 2, cageM);
        reduction.deleteNumOpt(cellM3, 2, cageM);
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b111_010_111 = 471`
    (reduction, cageM, _combosSet, _combo, cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM1, 2, cageM);
        reduction.deleteNumOpt(cellM3, 2, cageM);
    },
    // `0b111_011_000 = 472`
    IMPOSSIBLE_TO_REDUCE,
    // `0b111_011_001 = 473`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM2, 1, cageM);
        reduction.deleteNumOpt(cellM3, 1, cageM);
        reduction.deleteNumOpt(cellM3, 2, cageM);
    },
    // `0b111_011_010 = 474`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM2, 2, cageM);
        reduction.deleteNumOpt(cellM3, 1, cageM);
        reduction.deleteNumOpt(cellM3, 2, cageM);
    },
    // `0b111_011_011 = 475`
    (reduction, cageM, _combosSet, _combo, _cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM3, 1, cageM);
        reduction.deleteNumOpt(cellM3, 2, cageM);
    },
    // `0b111_011_100 = 476`
    (reduction, cageM, _combosSet, _combo, _cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b111_011_101 = 477`
    NOTHING_TO_REDUCE,
    // `0b111_011_110 = 478`
    NOTHING_TO_REDUCE,
    // `0b111_011_111 = 479`
    NOTHING_TO_REDUCE,
    // `0b111_100_000 = 480`
    IMPOSSIBLE_TO_REDUCE,
    // `0b111_100_001 = 481`
    (reduction, cageM, _combosSet, _combo, _cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM3, 1, cageM);
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b111_100_010 = 482`
    (reduction, cageM, _combosSet, _combo, _cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM3, 2, cageM);
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b111_100_011 = 483`
    (reduction, cageM, _combosSet, _combo, _cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b111_100_100 = 484`
    IMPOSSIBLE_TO_REDUCE,
    // `0b111_100_101 = 485`
    (reduction, cageM, _combosSet, _combo, cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM1, 3, cageM);
        reduction.deleteNumOpt(cellM3, 1, cageM);
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b111_100_110 = 486`
    (reduction, cageM, _combosSet, _combo, cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM1, 3, cageM);
        reduction.deleteNumOpt(cellM3, 2, cageM);
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b111_100_111 = 487`
    (reduction, cageM, _combosSet, _combo, cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM1, 3, cageM);
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b111_101_000 = 488`
    IMPOSSIBLE_TO_REDUCE,
    // `0b111_101_001 = 489`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM2, 1, cageM);
        reduction.deleteNumOpt(cellM3, 1, cageM);
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b111_101_010 = 490`
    (reduction, cageM, _combosSet, _combo, _cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM3, 2, cageM);
    },
    // `0b111_101_011 = 491`
    NOTHING_TO_REDUCE,
    // `0b111_101_100 = 492`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM2, 3, cageM);
        reduction.deleteNumOpt(cellM3, 1, cageM);
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b111_101_101 = 493`
    (reduction, cageM, _combosSet, _combo, _cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM3, 1, cageM);
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b111_101_110 = 494`
    NOTHING_TO_REDUCE,
    // `0b111_101_111 = 495`
    NOTHING_TO_REDUCE,
    // `0b111_110_000 = 496`
    IMPOSSIBLE_TO_REDUCE,
    // `0b111_110_001 = 497`
    (reduction, cageM, _combosSet, _combo, _cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM3, 1, cageM);
    },
    // `0b111_110_010 = 498`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM2, 2, cageM);
        reduction.deleteNumOpt(cellM3, 2, cageM);
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b111_110_011 = 499`
    NOTHING_TO_REDUCE,
    // `0b111_110_100 = 500`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM2, 3, cageM);
        reduction.deleteNumOpt(cellM3, 2, cageM);
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b111_110_101 = 501`
    NOTHING_TO_REDUCE,
    // `0b111_110_110 = 502`
    (reduction, cageM, _combosSet, _combo, _cellM1, _cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM3, 2, cageM);
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b111_110_111 = 503`
    NOTHING_TO_REDUCE,
    // `0b111_111_000 = 504`
    IMPOSSIBLE_TO_REDUCE,
    // `0b111_111_001 = 505`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM2, 1, cageM);
        reduction.deleteNumOpt(cellM3, 1, cageM);
    },
    // `0b111_111_010 = 506`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM2, 2, cageM);
        reduction.deleteNumOpt(cellM3, 2, cageM);
    },
    // `0b111_111_011 = 507`
    NOTHING_TO_REDUCE,
    // `0b111_111_100 = 508`
    (reduction, cageM, _combosSet, _combo, _cellM1, cellM2, cellM3) => {
        reduction.deleteNumOpt(cellM2, 3, cageM);
        reduction.deleteNumOpt(cellM3, 3, cageM);
    },
    // `0b111_111_101 = 509`
    NOTHING_TO_REDUCE,
    // `0b111_111_110 = 510`
    NOTHING_TO_REDUCE,
    // `0b111_111_111 = 511`
    NOTHING_TO_REDUCE,
];

const DENORMALIZED_TACTICAL_REDUCERS_FOR_SUMS: ReadonlyArray<ReadonlyArray<DenormalizedTacticalReducer> | undefined> = [
    // Sum of 0 = no reducers.
    undefined,
    // Sum of 1 = no reducers.
    undefined,
    // Sum of 2 = no reducers.
    undefined,
    // Sum of 3 = no reducers.
    undefined,
    // Sum of 4 = no reducers.
    undefined,
    // Sum of 5 = no reducers.
    undefined,
    // Sum of 6 = reducers for `Combo` of [1, 2, 3].
    DENORMALIZED_TACTICAL_REDUCERS_FOR_SUM_OF_6
];

/**
 * Empty reducing function.
 */
function NOTHING_TO_REDUCE() {
    // No-op.
}

/**
 * Throwing reducing function which is executed if the combination of numbers is not possible.
 */
function IMPOSSIBLE_TO_REDUCE() {
    throw new InvalidSolverStateError('Met compressed numbers state which should not be possible');
}
