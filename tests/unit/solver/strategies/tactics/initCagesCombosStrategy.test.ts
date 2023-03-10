import { Cage } from '../../../../../src/puzzle/cage';
import { Cell } from '../../../../../src/puzzle/cell';
import { Combo } from '../../../../../src/solver/math';
import { CageModel } from '../../../../../src/solver/models/elements/cageModel';
import { MasterModel } from '../../../../../src/solver/models/masterModel';
import { Context } from '../../../../../src/solver/strategies/context';
import { FindComplementingCagesStrategy } from '../../../../../src/solver/strategies/tactics/findComplementingCagesStrategy';
import { InitCagesCombosStrategy } from '../../../../../src/solver/strategies/tactics/initCagesCombosStrategy';
import { puzzleSamples } from '../../../puzzle/puzzleSamples';
import { newContext } from './contextBuilder';

describe('Unit tests for `InitCagesCombosStrategy`', () => {

    let context: Context;
    let model: MasterModel;

    // Given:
    beforeEach(() => {
        context = newContext(puzzleSamples.sudokuDotCom.dailyChallengeOf_2022_11_01);
        model = context.model;
        new FindComplementingCagesStrategy(context).execute();
    });

    test('Applying `Strategy` for Daily Challenge (2022-11-01) by Sudoku.com', () => {
        // When:
        new InitCagesCombosStrategy(context).execute();

        // Then:

        // Checking `Nonet 3`:
        const nonet3_cageM1 = cageM(4, [ Cell.at(3, 0), Cell.at(3, 1) ]);
        expect(nonet3_cageM1.combos).toEqual([ Combo.of(1, 3) ]);

        const nonet3_cageM2 = cageM(2, [ Cell.at(3, 2) ]);
        expect(nonet3_cageM2.combos).toEqual([ Combo.of(2) ]);

        const nonet3_cageM3 = cageM(27, [ Cell.at(4, 0), Cell.at(4, 1), Cell.at(5, 0), Cell.at(5, 1) ]);
        expect(nonet3_cageM3.combos).toEqual([ Combo.of(4, 6, 8, 9), Combo.of(5, 6, 7, 9) ]);

        const nonet3_cageM4 = cageM(12, [ Cell.at(4, 2), Cell.at(5, 2) ]);
        expect(nonet3_cageM4.combos).toEqual([ Combo.of(4, 8), Combo.of(5, 7) ]);
    });

    const cageM = (sum: number, cells: ReadonlyArray<Cell>) => {
        return model.cageModelsMap.get(Cage.ofSum(sum).withCells(cells).new().key) as CageModel;
    };

});
