import { Cage } from '../../../puzzle/cage';
import { House } from '../../../puzzle/house';
import { CageModel } from '../../models/elements/cageModel';
import { Context } from '../context';

export function findRedundantNonetSumsStrategy(this: Context) {
    const nonetCageMsMap = new Map();
    this.model.nonetModels.forEach(nonetM => {
        nonetCageMsMap.set(nonetM.index, new Set());
    });

    for (const cageM of this.model.cageModelsMap.values()) {
        for (const cellM of cageM.cellModels) {
            nonetCageMsMap.get(cellM.cell.nonet).add(cageM);
        }
    }

    for (const entry of nonetCageMsMap.entries()) {
        const index = entry[0];
        const cageMs = entry[1];

        const redundantCells = [];
        let cagesSum = 0;
        for (const cageM of cageMs) {
            for (const cellM of cageM.cellModels) {
                const cell = cellM.cell;
                if (cell.nonet !== index) {
                    redundantCells.push(cell);
                }
            }
            cagesSum += cageM.cage.sum;
        }

        if (redundantCells.length > 0 && redundantCells.length <= 5) {
            const cageBuilder = Cage.ofSum(cagesSum - House.SUM);
            redundantCells.forEach(cell => cageBuilder.cell(cell));
            const cage = cageBuilder.mk();

            this.model.registerCage(cage, !CageModel.positioningFlagsFor(cage.cells).isWithinHouse);
        }
    }
}
