import { Cage } from '../../../problem/cage';
import { CageSlicer } from '../../transform/cageSlicer';
import { BaseStrategy } from '../baseStrategy';

export class SliceCagesForSolvedCellsStrategy extends BaseStrategy {
    #cageSlicer;
    #solvedCellSolvers;

    constructor(model, solvedCellSolvers) {
        super(model);
        this.#cageSlicer = new CageSlicer(model);
        this.#solvedCellSolvers = solvedCellSolvers;
    }

    apply() {
        this.#solvedCellSolvers.forEach(cellSolver => {
            const withinCageSolversSet = cellSolver.withinCageSolvers;
            if (!(withinCageSolversSet.size === 1 && withinCageSolversSet.values().next().value.isSingleCellCage)) {
                const firstChunkCage = Cage.ofSum(cellSolver.placedNum).at(cellSolver.cell.row, cellSolver.cell.col).mk();
                this.#cageSlicer.addAndSliceResidualCageRecursively(firstChunkCage);
            }
        });
    }
}
