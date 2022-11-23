import { BaseStrategy } from '../baseStrategy';

export class ReduceHousePermsBySolvedCellsStrategy extends BaseStrategy {
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
        
                    const aCellModel = this.model.cellSolverAt(row, col);
                    if (aCellModel.hasNumOpt(num)) {
                        aCellModel.deleteNumOpt(num);
                        cageSolversToReduceSet = new Set([...cageSolversToReduceSet, ...aCellModel.withinCageSolvers]);
                    }
                }    
            });
        });
        return cageSolversToReduceSet;
    }
}
