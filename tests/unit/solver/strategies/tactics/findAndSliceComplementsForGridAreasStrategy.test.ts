import { Cage } from '../../../../../src/puzzle/cage';
import { House } from '../../../../../src/puzzle/house';
import { Puzzle } from '../../../../../src/puzzle/puzzle';
import { MasterModel } from '../../../../../src/solver/models/masterModel';
import { Context } from '../../../../../src/solver/strategies/context';
import { Strategy } from '../../../../../src/solver/strategies/strategy';
import { FindAndSliceComplementsForGridAreasStrategy } from '../../../../../src/solver/strategies/tactics/findAndSliceComplementsForGridAreasStrategy';
import { FindRedundantNonetSumsStrategy } from '../../../../../src/solver/strategies/tactics/findRedundantNonetSumsStrategy';
import { CageSlicer } from '../../../../../src/solver/transform/cageSlicer';
import { puzzleSamples } from '../../../puzzle/puzzleSamples';

describe('Unit tests for `FindAndSliceComplementsForGridAreasStrategy`', () => {
    test('Applying strategy onto single `Row`s within Daily Challenge (2022-10-22) by Sudoku.com', () => {
        // given
        const context = newContext(puzzleSamples.sudokuDotCom.dailyChallengeOf_2022_10_22);
        runSetUpStrategies(new FindRedundantNonetSumsStrategy(context));
        const originalCageCount = context.model.cageModelsMap.size;

        // when
        // (slicing only single `Row`s)
        new FindAndSliceComplementsForGridAreasStrategy(context, {
            isApplyToRowAreas: true,
            isApplyToColumnAreas: false,
            isApplyToNonetAreas: false,
            minAdjacentHouses: 1,
            maxAdjacentHouses: 1,
            maxComplementSize: 9
        }).execute();

        // then
        expect(context.model.cageModelsMap.size).toBe(originalCageCount + House.COUNT_OF_ONE_TYPE_PER_GRID);
        // (`Row` 0)
        expect(context.model.hasCage(Cage.ofSum(34).at(0, 2).at(0, 3).at(0, 4).at(0, 5).at(0, 6).at(0, 7).at(0, 8).new())).toBeTruthy();
        // (`Row` 1)
        expect(context.model.hasCage(Cage.ofSum(35).at(1, 2).at(1, 3).at(1, 4).at(1, 5).at(1, 6).at(1, 7).at(1, 8).new())).toBeTruthy();
        // (`Row` 2)
        expect(context.model.hasCage(Cage.ofSum(31).at(2, 2).at(2, 3).at(2, 4).at(2, 7).at(2, 8).new())).toBeTruthy();
        // (`Row` 3)
        expect(context.model.hasCage(Cage.ofSum(27).at(3, 2).at(3, 3).at(3, 6).at(3, 7).at(3, 8).new())).toBeTruthy();
        // (`Row` 4)
        expect(context.model.hasCage(Cage.ofSum(27).at(4, 0).at(4, 3).at(4, 6).at(4, 7).at(4, 8).new())).toBeTruthy();
        // (`Row` 5)
        expect(context.model.hasCage(Cage.ofSum(39).at(5, 0).at(5, 1).at(5, 2).at(5, 3).at(5, 4).at(5, 6).at(5, 7).at(5, 8).new())).toBeTruthy();
        // (`Row` 6)
        expect(context.model.hasCage(Cage.ofSum(45).at(6, 0).at(6, 1).at(6, 2).at(6, 3).at(6, 4).at(6, 5).at(6, 6).at(6, 7).at(6, 8).new())).toBeTruthy();
        // (`Row` 7)
        expect(context.model.hasCage(Cage.ofSum(27).at(7, 0).at(7, 4).at(7, 5).at(7, 6).at(7, 7).at(7, 8).new())).toBeTruthy();
        // (`Row` 8)
        expect(context.model.hasCage(Cage.ofSum(18).at(8, 0).at(8, 5).at(8, 8).new())).toBeTruthy();
    });

    test('Applying strategy onto single `Column`s within Daily Challenge (2022-10-22) by Sudoku.com', () => {
        // given
        const context = newContext(puzzleSamples.sudokuDotCom.dailyChallengeOf_2022_10_22);
        runSetUpStrategies(new FindRedundantNonetSumsStrategy(context));
        const originalCageCount = context.model.cageModelsMap.size;

        // when
        // (slicing only single `Column`s)
        new FindAndSliceComplementsForGridAreasStrategy(context, {
            isApplyToRowAreas: false,
            isApplyToColumnAreas: true,
            isApplyToNonetAreas: false,
            minAdjacentHouses: 1,
            maxAdjacentHouses: 1,
            maxComplementSize: 9
        }).execute();

        // then
        expect(context.model.cageModelsMap.size).toBe(originalCageCount + House.COUNT_OF_ONE_TYPE_PER_GRID);
        // (`Column` 0)
        expect(context.model.hasCage(Cage.ofSum(37).at(0, 0).at(1, 0).at(2, 0).at(3, 0).at(4, 0).at(5, 0).at(6, 0).new())).toBeTruthy();
        // (`Column` 1)
        expect(context.model.hasCage(Cage.ofSum(45).at(0, 1).at(1, 1).at(2, 1).at(3, 1).at(4, 1).at(5, 1).at(6, 1).at(7, 1).at(8, 1).new())).toBeTruthy();
        // (`Column` 2)
        expect(context.model.hasCage(Cage.ofSum(45).at(0, 2).at(1, 2).at(2, 2).at(3, 2).at(4, 2).at(5, 2).at(6, 2).at(7, 2).at(8, 2).new())).toBeTruthy();
        // (`Column` 3)
        expect(context.model.hasCage(Cage.ofSum(29).at(0, 3).at(3, 3).at(6, 3).at(7, 3).at(8, 3).new())).toBeTruthy();
        // (`Column` 4)
        expect(context.model.hasCage(Cage.ofSum(31).at(0, 4).at(3, 4).at(4, 4).at(5, 4).at(6, 4).at(7, 4).at(8, 4).new())).toBeTruthy();
        // (`Column` 5)
        expect(context.model.hasCage(Cage.ofSum(39).at(0, 5).at(1, 5).at(2, 5).at(3, 5).at(4, 5).at(6, 5).at(7, 5).at(8, 5).new())).toBeTruthy();
        // (`Column` 6)
        expect(context.model.hasCage(Cage.ofSum(45).at(0, 6).at(1, 6).at(2, 6).at(3, 6).at(4, 6).at(5, 6).at(6, 6).at(7, 6).at(8, 6).new())).toBeTruthy();
        // (`Column` 7 with `Cell` at `(2, 7)` when slicing `Column` 8)
        expect(context.model.hasCage(Cage.ofSum(15).at(0, 7).at(1, 7).at(3, 7).at(8, 7).new())).toBeTruthy();
        // (`Column` 8)
        expect(context.model.hasCage(Cage.ofSum(9).at(2, 8).at(3, 8).new())).toBeTruthy();
    });

    test('Applying strategy onto `Nonet`s within Daily Challenge (2022-10-22) by Sudoku.com', () => {
        // given
        const context = newContext(puzzleSamples.sudokuDotCom.dailyChallengeOf_2022_10_22);
        runSetUpStrategies(new FindRedundantNonetSumsStrategy(context));
        const originalCageCount = context.model.cageModelsMap.size;

        // when
        // (slicing only single `Column`s)
        new FindAndSliceComplementsForGridAreasStrategy(context, {
            isApplyToRowAreas: false,
            isApplyToColumnAreas: false,
            isApplyToNonetAreas: true,
            minAdjacentHouses: 1,
            maxAdjacentHouses: 1,
            maxComplementSize: 9
        }).execute();

        // then
        expect(context.model.cageModelsMap.size).toBe(originalCageCount + House.COUNT_OF_ONE_TYPE_PER_GRID);
        // (`Nonet` 0)
        expect(context.model.hasCage(Cage.ofSum(18).at(0, 2).at(1, 2).at(2, 2).new())).toBeTruthy();
        // (`Nonet` 1)
        expect(context.model.hasCage(Cage.ofSum(21).at(0, 3).at(0, 4).at(0, 5).at(1, 5).at(2, 5).new())).toBeTruthy();
        // (`Nonet` 2)
        expect(context.model.hasCage(Cage.ofSum(24).at(0, 6).at(2, 6).at(2, 7).at(2, 8).new())).toBeTruthy();
        // (`Nonet` 3)
        expect(context.model.hasCage(Cage.ofSum(26).at(3, 2).at(4, 0).at(5, 0).at(5, 1).at(5, 2).new())).toBeTruthy();
        // (`Nonet` 4)
        expect(context.model.hasCage(Cage.ofSum(16).at(3, 3).at(5, 4).new())).toBeTruthy();
        // (`Nonet` 5)
        expect(context.model.hasCage(Cage.ofSum(9).at(3, 8).at(5, 6).new())).toBeTruthy();
        // (`Nonet` 6)
        expect(context.model.hasCage(Cage.ofSum(33).at(6, 0).at(6, 1).at(6, 2).at(7, 1).at(7, 2).new())).toBeTruthy();
        // (`Nonet` 7)
        expect(context.model.hasCage(Cage.ofSum(35).at(6, 3).at(6, 4).at(6, 5).at(7, 3).at(7, 4).at(7, 5).at(8, 5).new())).toBeTruthy();
        // (`Nonet` 8)
        expect(context.model.hasCage(Cage.ofSum(3).at(6, 6).at(7, 6).new())).toBeTruthy();
    });

    const newContext = (puzzle: Puzzle) => {
        const masterModel = new MasterModel(puzzle);
        const cageSlider = new CageSlicer(masterModel);
        return new Context(masterModel, cageSlider);
    };

    const runSetUpStrategies = (...strategies: ReadonlyArray<Strategy>) => {
        for (const strategy of strategies) {
            strategy.execute();
        }
    };
});
