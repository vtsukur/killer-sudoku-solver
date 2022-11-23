import { BaseStrategy } from '../baseStrategy';

export class ReduceHousePermsBySolvedCellsStrategy extends BaseStrategy {
    #solvedCellSolvers;

    constructor(model, solvedCellSolvers) {
        super(model);
        this.#solvedCellSolvers = solvedCellSolvers;
    }

    apply() {
        let cageSolversToReduceSet = new Set();
        this.#solvedCellSolvers.forEach(cellModel => {
            const num = cellModel.placedNum;
            [
                this.model.rowSolvers[cellModel.cell.row],
                this.model.columnSolvers[cellModel.cell.col],
                this.model.nonetSolvers[cellModel.cell.nonet]
            ].forEach(houseSolver => {
                for (const { row, col } of houseSolver.cellIterator()) {
                    if (row === cellModel.cell.row && col === cellModel.cell.col) continue;
        
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
