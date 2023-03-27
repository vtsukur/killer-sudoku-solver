import { Strategy } from '../../strategy';

export class ReduceHousePermsBySolvedCellsStrategy extends Strategy {

    execute() {
        this._context.recentlySolvedCellModels.forEach(cellM => {
            const num = cellM.placedNum as number;
            [
                this._model.rowModels[cellM.cell.row],
                this._model.columnModels[cellM.cell.col],
                this._model.nonetModels[cellM.cell.nonet]
            ].forEach(houseM => {
                for (const { row, col } of houseM.cells) {
                    if (row === cellM.cell.row && col === cellM.cell.col) continue;

                    this._context.reduction.tryDeleteNumOpt(this._model.cellModelAt(row, col), num);
                }
            });
        });
    }

}
