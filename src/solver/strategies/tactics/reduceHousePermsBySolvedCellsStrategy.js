import { BaseModelStrategy } from './baseModelStrategy';

export class ReduceHousePermsBySolvedCellsStrategy extends BaseModelStrategy {
    #solvedCellSolvers;

    constructor(model, solvedCellSolvers) {
        super(model);
        this.#solvedCellSolvers = solvedCellSolvers;
    }

    apply() {
        let cageSolversToReduceSet = new Set();
        this.#solvedCellSolvers.forEach(cellSolver => {
            const num = cellSolver.placedNum;
            [
                this.model.rowSolvers[cellSolver.cell.row],
                this.model.columnSolvers[cellSolver.cell.col],
                this.model.nonetSolvers[cellSolver.cell.nonet]
            ].forEach(houseSolver => {
                for (const { row, col } of houseSolver.cellIterator()) {
                    if (row === cellSolver.cell.row && col === cellSolver.cell.col) continue;
        
                    const aCellDet = this.model.cellSolverAt(row, col);
                    if (aCellDet.hasNumOpt(num)) {
                        aCellDet.deleteNumOpt(num);
                        cageSolversToReduceSet = new Set([...cageSolversToReduceSet, ...aCellDet.withinCageSolvers]);
                    }
                }    
            });
        });
        return cageSolversToReduceSet;
    }
}
