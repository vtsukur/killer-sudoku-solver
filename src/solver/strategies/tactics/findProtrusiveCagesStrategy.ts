import { Cage } from '../../../puzzle/cage';
import { House } from '../../../puzzle/house';
import { Strategy } from '../strategy';

export class FindProtrusiveCagesStrategy extends Strategy {

    execute() {
        const nonetCageMsMap = new Map();
        this._model.nonetModels.forEach(nonetM => {
            nonetCageMsMap.set(nonetM.index, new Set());
        });

        for (const cageM of this._model.cageModelsMap.values()) {
            for (const cellM of cageM.cellMs) {
                nonetCageMsMap.get(cellM.cell.nonet).add(cageM);
            }
        }

        for (const entry of nonetCageMsMap.entries()) {
            const index = entry[0];
            const cageMs = entry[1];

            const redundantCells = [];
            let cagesSum = 0;
            for (const cageM of cageMs) {
                for (const cellM of cageM.cellMs) {
                    const cell = cellM.cell;
                    if (cell.nonet !== index) {
                        redundantCells.push(cell);
                    }
                }
                cagesSum += cageM.cage.sum;
            }

            if (redundantCells.length > 0 && redundantCells.length <= 5) {
                const cage = Cage.ofSum(cagesSum - House.SUM).withCells(redundantCells).setIsInput(this._model.isDerivedFromInputCage(redundantCells)).new();
                this._context.cageSlicer.addAndSliceResidualCageRecursively(cage);
            }
        }
    }

}