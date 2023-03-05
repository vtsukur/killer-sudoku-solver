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

/**
 * Combinatorics of possible numbers within {@link CageModel}'s {@link Cage}s
 * which belong to the same {@link HouseModel}.
 *
 * This type follows Killer Sudoku constraint,
 * which states that _a {@link House} has nonrepeating set of {@link Cell}s with numbers from 1 to 9_.
 *
 * @public
 */
export class HouseModelCagesCombinatorics {

    /**
     * {@link Cage}s without shared {@link Cell}s forming area of maximized size within the {@link House}.
     */
    readonly nonOverlappingCages: ReadonlyCages;

    /**
     * Possible {@link House} {@link Cell}s' number permutations for {@link nonOverlappingCages}
     * in the form of {@link HouseCagesPerms}.
     *
     * Each value in this array is a single permutation of possible numbers in {@link House} {@link Cage}s
     * represented as {@link HouseCagesPerm}.
     *
     * Each {@link Combo} value in {@link HouseCagesPerm} appears in the same order as respective {@link Cage}s
     * in the `houseM.cageModels` input of {@link for} method,
     * meaning {@link Cage} of index `i` in the `houseM.cageModels` input
     * will be mapped to the {@link Combo} of index `i` in each {@link HouseCagesPerm}.
     *
     * Numbers in each {@link HouseCagesPerm} are guaranteed to be nonrepeating following Killer Sudoku constraint of
     * _a {@link House} having nonrepeating set of {@link Cell}'s with numbers from 1 to 9.
     */
    readonly sumPermsForNonOverlappingCages: HouseCagesPerms;

    readonly actualSumCombos: ReadonlyArray<ReadonlyCombos>;

    private constructor(
            nonOverlappingCages: ReadonlyCages,
            sumPermsForNonOverlappingCages: HouseCagesPerms,
            actualSumCombos: ReadonlyArray<ReadonlyCombos>) {
        this.nonOverlappingCages = nonOverlappingCages;
        this.sumPermsForNonOverlappingCages = sumPermsForNonOverlappingCages;
        this.actualSumCombos = actualSumCombos;
    }

    static for(houseM: HouseModel) {
        const gridAreaModel = GridAreaModel.fromCageModels(houseM.cageModels);

        const nonOverlappingCages = gridAreaModel.nonOverlappingCagesAreaModel.cages;
        const { houseCagesPerms: perms, houseCagesCombos: combosForNonOverlappingCages } = NonOverlappingHouseCagesCombinatorics.enumerateCombosAndPerms(new HouseCagesAreaModel(nonOverlappingCages));

        const overlappingCages = gridAreaModel.overlappingCages;
        const combosForOverlappingCages = OverlappingHouseCagesCombinatorics.enumerateCombos(new HouseCagesAreaModel(overlappingCages)).houseCagesCombos;

        const actualSumCombos = preserveCombosOrder(combosForNonOverlappingCages, combosForOverlappingCages, houseM.cageModels, nonOverlappingCages, overlappingCages);

        return new HouseModelCagesCombinatorics(nonOverlappingCages, perms, actualSumCombos);
    }

}

function preserveCombosOrder(combosForNonOverlappingCages: ReadonlyArray<ReadonlyCombos>, combosForOverlappingCages: ReadonlyArray<ReadonlyCombos>, cageMs: ReadonlyArray<CageModel>, nonOverlappingCages: ReadonlyCages, overlappingCages: ReadonlyCages): ReadonlyArray<ReadonlyCombos> {
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
