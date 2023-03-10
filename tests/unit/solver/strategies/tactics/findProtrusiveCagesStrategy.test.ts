import { Cage } from '../../../../../src/puzzle/cage';
import { MasterModel } from '../../../../../src/solver/models/masterModel';
import { Context } from '../../../../../src/solver/strategies/context';
import { FindProtrusiveCagesStrategy } from '../../../../../src/solver/strategies/tactics/findProtrusiveCagesStrategy';
import { puzzleSamples } from '../../../puzzle/puzzleSamples';
import { newContext } from './contextBuilder';

describe('Unit tests for `FindProtrusiveCagesStrategy`', () => {

    let context: Context;
    let model: MasterModel;
    let originalCageCount: number;

    // Given:
    beforeEach(() => {
        context = newContext(puzzleSamples.sudokuDotCom.dailyChallengeOf_2022_11_01);
        model = context.model;
        originalCageCount = model.cageModelsMap.size;
    });

    test('Applying `Strategy` onto `Nonet`s within Daily Challenge (2022-11-01) by Sudoku.com', () => {
        // When:
        new FindProtrusiveCagesStrategy(context).execute();

        // Then:
        // There should be new `Cage`s in the model from 6 `Nonet`s.
        expect(model.cageModelsMap.size).toBe(originalCageCount + 6);

        // `Nonet` 0: NO protrusive `Cage`.

        // `Nonet` 1:
        // Protrusive `Cage` added.
        expect(model.hasCage(Cage.ofSum(14).at(1, 6).at(1, 7).at(3, 5).new())).toBeTruthy();

        // `Nonet` 2:
        // Protrusive `Cage` added.
        expect(model.hasCage(Cage.ofSum(8).at(1, 5).at(3, 6).new())).toBeTruthy();

        // `Nonet` 3:
        // Protrusive `Cage` added.
        expect(model.hasCage(Cage.ofSum(2).at(5, 3).new())).toBeTruthy();
        // By-product of slicing protrusive `Cage`.
        expect(model.hasCage(Cage.ofSum(12).at(4, 2).at(5, 2).new())).toBeTruthy();
        // Original `Cage` sliced by protrusive `Cage` is deleted.
        expect(model.hasCage(Cage.ofSum(14).at(4, 2).at(4, 3).at(5, 3).new())).toBeFalsy();

        // `Nonet` 4:
        // Protrusive `Cage` added.
        expect(model.hasCage(Cage.ofSum(9).at(2, 5).at(4, 6).new())).toBeTruthy();

        // `Nonet` 5: NO protrusive `Cage`.

        // `Nonet` 6:
        // Protrusive `Cage` added.
        expect(model.hasCage(Cage.ofSum(3).at(6, 3).new())).toBeTruthy();
        // By-product of slicing protrusive `Cage`.
        expect(model.hasCage(Cage.ofSum(12).at(6, 2).at(7, 2).new())).toBeTruthy();
        // Original `Cage` sliced by protrusive `Cage` is deleted.
        expect(model.hasCage(Cage.ofSum(15).at(6, 2).at(6, 3).at(7, 2).new())).toBeFalsy();

        // `Nonet` 7: protrusive `Cage` already processed.

        // `Nonet` 8:
        // Protrusive `Cage` added.
        expect(model.hasCage(Cage.ofSum(8).at(5, 6).at(5, 7).new())).toBeTruthy();
        // By-product of slicing protrusive `Cage`.
        expect(model.hasCage(Cage.ofSum(14).at(6, 6).at(6, 7).new())).toBeTruthy();
        // Original `Cage` sliced by protrusive `Cage` is deleted.
        expect(model.hasCage(Cage.ofSum(22).at(5, 6).at(5, 7).at(6, 6).at(6, 7).new())).toBeFalsy();
    });

    test('Applying `Strategy` with adjusted `Config` onto `Nonet`s within Daily Challenge (2022-11-01) by Sudoku.com', () => {
        // When:
        new FindProtrusiveCagesStrategy(context, {
            maxMeaningfulProtrusionSize: 1
        }).execute();

        // Then:
        // There should be new `Cage`s in the model from 6 `Nonet`s.
        expect(model.cageModelsMap.size).toBe(originalCageCount + 2);

        // `Nonet` 0: NO protrusive `Cage`.

        // `Nonet` 1:
        // Protrusive `Cage` found, but it is too large given the configuration.
        // expect(model.hasCage(Cage.ofSum(14).at(1, 6).at(1, 7).at(3, 5).new())).toBeTruthy();

        // `Nonet` 2:
        // Protrusive `Cage` found, but it is too large given the configuration.
        // expect(model.hasCage(Cage.ofSum(8).at(1, 5).at(3, 6).new())).toBeTruthy();

        // `Nonet` 3:
        // Protrusive `Cage` added.
        expect(model.hasCage(Cage.ofSum(2).at(5, 3).new())).toBeTruthy();
        // By-product of slicing protrusive `Cage`.
        expect(model.hasCage(Cage.ofSum(12).at(4, 2).at(5, 2).new())).toBeTruthy();
        // Original `Cage` sliced by protrusive `Cage` is deleted.
        expect(model.hasCage(Cage.ofSum(14).at(4, 2).at(4, 3).at(5, 3).new())).toBeFalsy();

        // `Nonet` 4:
        // Protrusive `Cage` found, but it is too large given the configuration.
        // expect(model.hasCage(Cage.ofSum(9).at(2, 5).at(4, 6).new())).toBeTruthy();

        // `Nonet` 5: NO protrusive `Cage`.

        // `Nonet` 6:
        // Protrusive `Cage` added.
        expect(model.hasCage(Cage.ofSum(3).at(6, 3).new())).toBeTruthy();
        // By-product of slicing protrusive `Cage`.
        expect(model.hasCage(Cage.ofSum(12).at(6, 2).at(7, 2).new())).toBeTruthy();
        // Original `Cage` sliced by protrusive `Cage` is deleted.
        expect(model.hasCage(Cage.ofSum(15).at(6, 2).at(6, 3).at(7, 2).new())).toBeFalsy();

        // `Nonet` 7: protrusive `Cage` already processed.

        // `Nonet` 8:
        // Protrusive `Cage` found, but it is too large given the configuration.
        // expect(model.hasCage(Cage.ofSum(8).at(5, 6).at(5, 7).new())).toBeTruthy();
        // By-product of slicing protrusive `Cage`.
        // expect(model.hasCage(Cage.ofSum(14).at(6, 6).at(6, 7).new())).toBeTruthy();
        // Original `Cage` sliced by protrusive `Cage` is deleted.
        // expect(model.hasCage(Cage.ofSum(22).at(5, 6).at(5, 7).at(6, 6).at(6, 7).new())).toBeFalsy();
    });

});
