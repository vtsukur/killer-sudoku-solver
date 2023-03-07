import { Cage } from '../../../puzzle/cage';
import { House } from '../../../puzzle/house';
import { CageModel } from '../../models/elements/cageModel';
import { MasterModelEvents } from '../../models/masterModel';
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

        const cageRegisteredEventHandler = (cageM: CageModel) => {
            if (cageM.cage.isInput) {
                for (const cellM of cageM.cellMs) {
                    nonetCageMsMap.get(cellM.cell.nonet).add(cageM);
                }
            }
        };
        const cageUnregisteredEventHandler = (cageM: CageModel) => {
            if (cageM.cage.isInput) {
                for (const cellM of cageM.cellMs) {
                    nonetCageMsMap.get(cellM.cell.nonet).delete(cageM);
                }
            }
        };
        this._model.addEventHandler(MasterModelEvents.CAGE_REGISTERED, cageRegisteredEventHandler);
        this._model.addEventHandler(MasterModelEvents.CAGE_UNREGISTERED, cageUnregisteredEventHandler);

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

        this._model.removeEventHandler(MasterModelEvents.CAGE_REGISTERED, cageRegisteredEventHandler);
        this._model.removeEventHandler(MasterModelEvents.CAGE_UNREGISTERED, cageUnregisteredEventHandler);
    }

}
