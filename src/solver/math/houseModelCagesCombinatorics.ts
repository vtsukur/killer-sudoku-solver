// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Cage, ReadonlyCages } from '../../puzzle/cage';
import { HouseModel } from '../models/elements/houseModel';
import { Combo, ReadonlyCombos } from './combo';
import { HouseCagesPerms, NonOverlappingHouseCagesCombinatorics } from './nonOverlappingHouseCagesCombinatorics';
import { HouseCagesAreaModel } from '../models/elements/houseCagesAreaModel';
import { OverlappingHouseCagesCombinatorics } from './overlappingHouseCagesCombinatorics';
import { GridAreaModel } from '../models/elements/gridAreaModel';
import { CageModel } from '../models/elements/cageModel';
import { CachedNumRanges } from './cachedNumRanges';
import { HouseCagesCombos } from './houseCagesCombinatorics';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { House } from '../../puzzle/house';

/**
 * Combinatorics of possible numbers within {@link Cage}s
 * which belong to the same {@link HouseModel}'s {@link House}.
 *
 * This type follows Killer Sudoku constraint,
 * which states that _a {@link House} has nonrepeating set of {@link Cell}s with numbers from 1 to 9_.
 *
 * @public
 */
export class HouseModelCagesCombinatorics {

    /**
     * {@link Cage}s without shared {@link Cell}s forming area of maximized size within the {@link House}.
     *
     * Order of elements in this array follows the original order of
     * _non-overlapping_ {@link Cage}s in the `houseM.cageModels` input of {@link for} static factory method.
     *
     * For example, if the `houseM.cageModels[].cage` is represented as follows:
     * ```
     * [
     *   Cage 1 - non-overlapping,
     *   Cage 2 - non-overlapping,
     *   Cage 3 - overlapping,
     *   Cage 4 - overlapping,
     *   Cage 5 - non-overlapping
     * ]
     * ```
     * then {@link nonOverlappingCages} will be ordered as follows:
     * ```
     * [
     *   Cage 1 - non-overlapping,
     *   Cage 2 - non-overlapping,
     *   Cage 5 - non-overlapping
     * ]
     * ```
     */
    readonly nonOverlappingCages: ReadonlyCages;

    /**
     * Possible {@link House} {@link Cell}s' number permutations for {@link nonOverlappingCages}
     * in the form of {@link HouseCagesPerms}.
     *
     * Each value in this array is a single permutation of possible numbers in {@link House} {@link Cage}s
     * represented as {@link HouseCagesPerm}.
     *
     * Each {@link Combo} value in {@link HouseCagesPerm} appears in the same order as {@link Cage}s
     * in the {@link nonOverlappingCages}, meaning {@link Cage} of index `i` in the {@link nonOverlappingCages}
     * will be mapped to the {@link Combo} of index `i` in each {@link HouseCagesPerm}.
     *
     * Numbers in each {@link HouseCagesPerm} are guaranteed to be nonrepeating following Killer Sudoku constraint of
     * _a {@link House} having nonrepeating set of {@link Cell}'s with numbers from 1 to 9.
     */
    readonly sumPermsForNonOverlappingCages: HouseCagesPerms;

    /**
     * Possible {@link Cell}s' numbers for the {@link Cage}s within the same {@link House}
     * in the form of {@link HouseCagesCombos}.
     *
     * Each value in this array is a readonly array of unique {@link Combo}s
     * of nonrepeating numbers for respective {@link Cage} represented as {@link HouseCageCombos}.
     *
     * Numbers in each {@link Combo} are enumerated so that they add up to {@link Cage} sum.
     *
     * _Non-overlapping_ {@link Cage}s have combinations which are unique
     * to the possible permutations of ALL _non-overlapping_ {@link Cage}s within the {@link House}.
     *
     * For example, consider a {@link Cage} of sum `9` occupying 2 {@link Cell}s.
     * Such a {@link Cage} theoretically can have the following number combinations:
     * `(1, 8)`, `(2, 7)`, `(3, 6)`, `(4, 5)`.
     *
     * If enumeration of possible permutations results in finding subset of number combinations
     * (say `(1, 8)` and `(3, 6)`) then only these combinations will be added to {@link actualSumCombos}.
     *
     * _Overlapping_ {@link Cage}s have ALL combinations,
     * regardless of possible permutations in the {@link House}.
     *
     * Each {@link HouseCageCombos} value in this array appears in the same order as respective {@link Cage}s
     * in the `houseM.cageModels` input of {@link for} static factory method,
     * meaning {@link Cage} with of `i` in the `houseM.cageModels` input
     * will be mapped to the array element of {@link HouseCageCombos} with the index `i`.
     *
     * For example, if the `houseM.cageModels[].cage` is represented as follows:
     * ```
     * [
     *   Cage 1,
     *   Cage 2,
     *   Cage 3,
     *   Cage 4,
     *   Cage 5
     * ]
     * ```
     * then {@link actualSumCombos} will be ordered as follows:
     * ```
     * [
     *   [ ... Combos for Cage 1 ],
     *   [ ... Combos for Cage 2 ],
     *   [ ... Combos for Cage 3 ],
     *   [ ... Combos for Cage 4 ],
     *   [ ... Combos for Cage 5 ]
     * ]
     * ```
     *
     * Numbers in each {@link HouseCageCombos} are guaranteed to be nonrepeating following Killer Sudoku constraint of
     * _a {@link House} having nonrepeating set of {@link Cell}'s with numbers from 1 to 9.
     */
    readonly actualSumCombos: HouseCagesCombos;

    private constructor(
            nonOverlappingCages: ReadonlyCages,
            sumPermsForNonOverlappingCages: HouseCagesPerms,
            actualSumCombos: HouseCagesCombos) {
        this.nonOverlappingCages = nonOverlappingCages;
        this.sumPermsForNonOverlappingCages = sumPermsForNonOverlappingCages;
        this.actualSumCombos = actualSumCombos;
    }

    /**
     * Enumerates possible numbers within {@link Cage}s
     * which belong to the same {@link HouseModel}'s {@link House}.
     *
     * @param houseM - {@link HouseModel} containing {@link House} {@link Cage}s to enumerates possible numbers for.
     *
     * @returns Possible numbers within {@link Cage}s
     * which belong to the same {@link HouseModel}'s {@link House}.
     *
     * @see {nonOverlappingCages}
     * @see {sumPermsForNonOverlappingCages}
     * @see {actualSumCombos}
     */
    static for(houseM: HouseModel) {
        // Determining _non-overlapping_ and _overlapping_ `Cage`s.
        const gridAreaModel = GridAreaModel.fromCageModels(houseM.cageModels);

        // Enumerating possible numbers for `Cell`s within _non-overlapping_ `Cage`s.
        const nonOverlappingCages = gridAreaModel.nonOverlappingCagesAreaModel.cages;
        const { houseCagesPerms: perms, houseCagesCombos: combosForNonOverlappingCages } = NonOverlappingHouseCagesCombinatorics.enumerateCombosAndPerms(new HouseCagesAreaModel(nonOverlappingCages));

        // Enumerating possible numbers for `Cell`s within _overlapping_ `Cage`s.
        const overlappingCages = gridAreaModel.overlappingCages;
        const combosForOverlappingCages = OverlappingHouseCagesCombinatorics.enumerateCombos(new HouseCagesAreaModel(overlappingCages)).houseCagesCombos;

        //
        // Merging number combinations for `Cell`s within _non-overlapping_ and _overlapping_ `Cage`s
        // and making sure that order of output combinations follows the order of input.
        //
        const actualSumCombos = this.mergeCombosPreservingInputOrder(combosForNonOverlappingCages, combosForOverlappingCages, houseM.cageModels, nonOverlappingCages, overlappingCages);

        return new HouseModelCagesCombinatorics(nonOverlappingCages, perms, actualSumCombos);
    }

    private static mergeCombosPreservingInputOrder(
            combosForNonOverlappingCages: ReadonlyArray<ReadonlyCombos>,
            combosForOverlappingCages: ReadonlyArray<ReadonlyCombos>,
            cageMs: ReadonlyArray<CageModel>,
            nonOverlappingCages: ReadonlyCages,
            overlappingCages: ReadonlyCages): ReadonlyArray<ReadonlyCombos> {
        const orderPreservedCombos = new Array<ReadonlyArray<Combo>>(cageMs.length);

        for (const i of CachedNumRanges.ZERO_TO_N_LTE_81[cageMs.length]) {
            const cage = cageMs[i].cage;
            const nonOverlappingCageIndex = nonOverlappingCages.findIndex(originalCage => originalCage === cage);
            if (nonOverlappingCageIndex !== -1) {
                orderPreservedCombos[i] = combosForNonOverlappingCages[nonOverlappingCageIndex];
            } else {
                const overlappingCageIndex = overlappingCages.findIndex(originalCage => originalCage === cage);
                orderPreservedCombos[i] = combosForOverlappingCages[overlappingCageIndex];
            }
        }

        return orderPreservedCombos;
    }

}
