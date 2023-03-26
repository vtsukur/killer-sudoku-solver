import { Cell } from '../../../../../../src/puzzle/cell';
import { MasterModel } from '../../../../../../src/solver/models/masterModel';
import { Context } from '../../../../../../src/solver/strategies/context';
import { puzzleSamples } from '../../../../puzzle/puzzleSamples';
import { newCageM, newContext } from './builders';
import { MasterInitStrategy } from '../../../../../../src/solver/strategies/tactics/init';
import { Combo } from '../../../../../../src/solver/math';

describe('Unit tests for `MasterInitStrategy`', () => {

    let context: Context;
    let model: MasterModel;

    // Given:
    beforeEach(() => {
        context = newContext(puzzleSamples.sudokuDotCom.dailyChallengeOf_2022_11_01);
        model = context.model;
    });

    test('Applying `Strategy` for Daily Challenge (2022-11-01) by Sudoku.com', () => {
        // When:
        new MasterInitStrategy(context).execute();

        // Then (selective assertion):

        // // ... Results of `FindProtrusiveCagesStrategy` (assertion skipped since this `Strategy` is disabled):

            // // `Nonet` 1:
            // // Protrusive `Cage` added.
            // expect(model.hasCage(Cage.ofSum(14).at(1, 6).at(1, 7).at(3, 5).new())).toBeTruthy();

        // // ... Results of `FindComplementingCagesStrategy` (selective assertion):

        // // Complement for `Column` 8.
        // expect(model.hasCage(Cage.ofSum(1).at(2, 8).new())).toBeTruthy();

        // ... Results of `FindCombosForHouseCagesStrategy` (selective assertion):

        // Checking one of `Cage`s in `Column 8`:
        const column8_cageM4 = cageM(14, [ Cell.at(6, 8), Cell.at(7, 8), Cell.at(8, 8) ]);
        expect(column8_cageM4.combos).toEqual([
            Combo.of(2, 4, 8),
            Combo.of(2, 5, 7),
            Combo.of(3, 4, 7)
        ]);

        // ... Accumulated results from several `Strategy`-ies reflecting non-empty reduction:

        expect(context.hasCageModelsToReduce).toBeTruthy();
        expect(context.cageModelsToReduce.size).toBeGreaterThan(1);
        expect(context.cageModelsToReduce.size).toBeLessThan(context.model.cageModelsMap.size);
    });

    const cageM = (sum: number, cells: ReadonlyArray<Cell>) => {
        return newCageM(model, sum, cells);
    };

});
