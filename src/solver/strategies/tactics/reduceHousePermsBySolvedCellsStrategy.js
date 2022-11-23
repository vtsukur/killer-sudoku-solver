import { BaseStrategy } from '../baseStrategy';

export class ReduceHousePermsBySolvedCellsStrategy extends BaseStrategy {
    #solvedCellModels;

    constructor(model, solvedCellModels) {
        super(model);
        this.#solvedCellModels = solvedCellModels;
    }

    apply() {
        let cageModelsToReduceSet = new Set();
        this.#solvedCellModels.forEach(cellModel => {
            const num = cellModel.placedNum;
            [
                this.model.rowModels[cellModel.cell.row],
                this.model.columnModels[cellModel.cell.col],
                this.model.nonetModels[cellModel.cell.nonet]
            ].forEach(houseModel => {
                for (const { row, col } of houseModel.cellIterator()) {
                    if (row === cellModel.cell.row && col === cellModel.cell.col) continue;
        
                    const aCellModel = this.model.cellModelAt(row, col);
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
