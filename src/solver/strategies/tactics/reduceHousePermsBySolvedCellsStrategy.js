import { BaseStrategy } from '../baseStrategy';

export class ReduceHousePermsBySolvedCellsStrategy extends BaseStrategy {
    #solvedCellModels;

    constructor(solvedCellModels) {
        super();
        this.#solvedCellModels = solvedCellModels;
    }

    apply(ctx) {
        let cageModelsToReduceSet = new Set();
        this.#solvedCellModels.forEach(cellModel => {
            const num = cellModel.placedNum;
            [
                ctx.model.rowModels[cellModel.cell.row],
                ctx.model.columnModels[cellModel.cell.col],
                ctx.model.nonetModels[cellModel.cell.nonet]
            ].forEach(houseModel => {
                for (const { row, col } of houseModel.cellIterator()) {
                    if (row === cellModel.cell.row && col === cellModel.cell.col) continue;
        
                    const aCellModel = ctx.model.cellModelAt(row, col);
                    if (aCellModel.hasNumOpt(num)) {
                        aCellModel.deleteNumOpt(num);
                        cageModelsToReduceSet = new Set([...cageModelsToReduceSet, ...aCellModel.withinCageModels]);
                    }
                }    
            });
        });
        return cageModelsToReduceSet;
    }
}
