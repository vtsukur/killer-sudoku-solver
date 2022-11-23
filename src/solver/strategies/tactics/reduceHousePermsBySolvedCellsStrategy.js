export const reduceHousePermsBySolvedCellsStrategy = (ctx) => {
    let cageModelsToReduceSet = new Set();
    ctx.recentlySolvedCellModels.forEach(cellModel => {
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
