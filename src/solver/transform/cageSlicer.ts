import { Cage } from '../../puzzle/cage';
import { Cell } from '../../puzzle/cell';
import { House } from '../../puzzle/house';
import { Sets } from '../../util/sets';
import { CageModel } from '../models/elements/cageModel';
import { MasterModel } from '../models/masterModel';

type CageInSlicing = {
    cage: Cage;
    canHaveDuplicateNums: boolean;
};

export class CageSlicer {

    readonly model;

    constructor(model: MasterModel) {
        this.model = model;
    }

    addAndSliceResidualCageRecursively(initialResidualCage: Cage) {
        let residualCages = [ { cage: initialResidualCage, canHaveDuplicateNums: !CageModel.positioningFlagsFor(initialResidualCage.cells).isWithinHouse } ];

        while (residualCages.length > 0) {
            const nextResidualCages = new Array<CageInSlicing>();

            residualCages.forEach(entry => {
                const residualCage = entry.cage;
                if (this.model.cageModelsMap.has(residualCage.key)) return;

                const cageMsForResidualCage = this.getCageMsFullyContainingResidualCage(residualCage);
                const cagesToUnregister = new Array<Cage>();
                let canHaveDuplicateNums = entry.canHaveDuplicateNums;
                cageMsForResidualCage.forEach((cageM: CageModel) => {
                    const secondChunkCage = CageSlicer.slice(cageM.cage, residualCage, this.model);
                    cagesToUnregister.push(cageM.cage);
                    nextResidualCages.push({ cage: secondChunkCage, canHaveDuplicateNums: cageM.canHaveDuplicateNums });
                    canHaveDuplicateNums = canHaveDuplicateNums && cageM.canHaveDuplicateNums;
                });

                cagesToUnregister.forEach(cage => this.model.unregisterCage(cage));

                this.model.registerCage(residualCage, canHaveDuplicateNums);
            });

            residualCages = nextResidualCages;
        }
    }

    private getCageMsFullyContainingResidualCage(residualCage: Cage) {
        const allAssociatedCageMsSet = new Set<CageModel>();
        residualCage.cells.forEach(cell => {
            Sets.U(allAssociatedCageMsSet, this.model.cellModelOf(cell).withinCageModels);
        });
        allAssociatedCageMsSet.delete(this.model.cageModelsMap.get(residualCage.key) as CageModel);

        const result = new Array<CageModel>();
        for (const associatedCageM of allAssociatedCageMsSet.values()) {
            const associatedCageFullyContainsResidualCage = residualCage.cells.every(cell => {
                return this.model.cellModelOf(cell).withinCageModels.has(associatedCageM);
            });
            if (associatedCageFullyContainsResidualCage) {
                result.push(associatedCageM);
            }
        }

        return result;
    }

    static slice(cageToSlice: Cage, firstChunkCage: Cage, model: MasterModel) {
        const cells = cageToSlice.cells.filter(cell => firstChunkCage.cells.findIndex(aCell => aCell.key === cell.key) === -1);
        return Cage.ofSum(cageToSlice.sum - firstChunkCage.sum)
            .withCells(cells)
            .setIsInput(model.isDerivedFromInputCage(cells))
            .new();
    }

    static sliceBy(cageToSlice: Cage, sliceIndexFn: (cell: Cell) => number) {
        const slices: Array<Array<Cell>> = new Array(House.CELL_COUNT).fill([]).map(() => []);
        slices[0].push(Cell.at(0, 0));
        cageToSlice.cells.forEach((cell: Cell) => {
            const index = sliceIndexFn(cell);
            slices[index].push(cell);
        });
        return slices.filter(cells => cells.length > 0);
    }

}
