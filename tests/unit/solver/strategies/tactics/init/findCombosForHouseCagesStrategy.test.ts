import { Cell } from '../../../../../../src/puzzle/cell';
import { Combo } from '../../../../../../src/solver/math';
import { MasterModel } from '../../../../../../src/solver/models/masterModel';
import { Context } from '../../../../../../src/solver/strategies/context';
import { FindComplementingCagesStrategy } from '../../../../../../src/solver/strategies/tactics/init/findComplementingCagesStrategy';
import { FindCombosForHouseCagesStrategy } from '../../../../../../src/solver/strategies/tactics/init/findCombosForHouseCagesStrategy';
import { puzzleSamples } from '../../../../puzzle/puzzleSamples';
import { newCageM, newContext } from './builders';

describe('Unit tests for `FindCombosForHouseCagesStrategy`', () => {

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
        new FindCombosForHouseCagesStrategy(context).execute();

        // Then (selective assertion):

        // Checking `Row 2`:

        const row2_cageM1 = cageM(13, [ Cell.at(2, 0), Cell.at(2, 1), Cell.at(2, 2) ]);
        expect(row2_cageM1.combos).toEqual([
            Combo.of(2, 5, 6),
            Combo.of(3, 4, 6)
        ]);

        const row2_cageM2 = cageM(11, [ Cell.at(2, 3), Cell.at(2, 4) ]);
        expect(row2_cageM2.combos).toEqual([ Combo.of(4, 7), Combo.of(5, 6) ]);

        const row2_cageM3 = cageM(12, [ Cell.at(2, 5), Cell.at(2, 6) ]);
        expect(row2_cageM3.combos).toEqual([ Combo.of(3, 9), Combo.of(5, 7) ]);

        const row2_cageM4 = cageM(8, [ Cell.at(2, 7) ]);
        expect(row2_cageM4.combos).toEqual([ Combo.of(8) ]);

        const row2_cageM5 = cageM(1, [ Cell.at(2, 8) ]);
        expect(row2_cageM5.combos).toEqual([ Combo.of(1) ]);

        // Checking `Column 8`:

        const column8_cageM1 = cageM(11, [ Cell.at(0, 8), Cell.at(1, 8) ]);
        expect(column8_cageM1.combos).toEqual([
            Combo.of(2, 9),
            Combo.of(4, 7),
            Combo.of(5, 6)
        ]);

        const column8_cageM2 = cageM(1, [ Cell.at(2, 8) ]);
        expect(column8_cageM2.combos).toEqual([ Combo.of(1) ]);

        const column8_cageM3 = cageM(19, [ Cell.at(3, 8), Cell.at(4, 8), Cell.at(5, 8) ]);
        expect(column8_cageM3.combos).toEqual([
            Combo.of(2, 8, 9),
            Combo.of(3, 7, 9),
            Combo.of(4, 6, 9),
            Combo.of(5, 6, 8)
        ]);

        const column8_cageM4 = cageM(14, [ Cell.at(6, 8), Cell.at(7, 8), Cell.at(8, 8) ]);
        expect(column8_cageM4.combos).toEqual([
            Combo.of(2, 4, 8),
            Combo.of(2, 5, 7),
            Combo.of(3, 4, 7)
        ]);

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
        return newCageM(model, sum, cells);
    };

});
