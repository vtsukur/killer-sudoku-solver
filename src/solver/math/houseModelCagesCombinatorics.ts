import { Cage, ReadonlyCages } from '../../puzzle/cage';
import { HouseModel } from '../models/elements/houseModel';
import { Combo, ReadonlyCombos } from './combo';
import { NonOverlappingHouseCagesCombinatorics } from './nonOverlappingHouseCagesCombinatorics';
import { HouseCagesAreaModel } from '../models/elements/houseCagesAreaModel';
import { OverlappingHouseCagesCombinatorics } from './overlappingHouseCagesCombinatorics';
import { GridAreaModel } from '../models/elements/gridAreaModel';
import { CageModel } from '../models/elements/cageModel';
import { CachedNumRanges } from './cachedNumRanges';

export class HouseModelCagesCombinatorics {

    readonly nonOverlappingCages: ReadonlyArray<Cage>;
    readonly sumPermsForNonOverlappingCages: ReadonlyArray<ReadonlyCombos>;
    readonly actualSumCombos: ReadonlyArray<ReadonlyCombos>;

    private constructor(
            nonOverlappingCages: ReadonlyArray<Cage>,
            sumPermsForNonOverlappingCages: ReadonlyArray<ReadonlyCombos>,
            actualSumCombos: ReadonlyArray<ReadonlyCombos>) {
        this.nonOverlappingCages = nonOverlappingCages;
        this.sumPermsForNonOverlappingCages = sumPermsForNonOverlappingCages;
        this.actualSumCombos = actualSumCombos;
    }

    static for(houseM: HouseModel) {
        const gridAreaModel = GridAreaModel.fromCageModels(houseM.cageModels);
        const nonOverlappingCages = gridAreaModel.nonOverlappingCagesAreaModel.cages;
        const overlappingCages = gridAreaModel.overlappingCages;

        const { houseCagesPerms: perms, houseCagesCombos: combosForNonOverlappingCages } = NonOverlappingHouseCagesCombinatorics.enumerateCombosAndPerms(new HouseCagesAreaModel(nonOverlappingCages));
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
