import { Cage } from '../../../../../src/puzzle/cage';
import { House } from '../../../../../src/puzzle/house';
import { Context } from '../../../../../src/solver/strategies/context';
import { FindComplementingCagesStrategy } from '../../../../../src/solver/strategies/tactics/findComplementingCagesStrategy';
import { puzzleSamples } from '../../../puzzle/puzzleSamples';
import { newContext } from './contextBuilder';

describe('Unit tests for `FindComplementingCagesStrategy`', () => {

    let context: Context;
    let originalCageCount: number;

    // Given:
    beforeEach(() => {
        context = newContext(puzzleSamples.sudokuDotCom.dailyChallengeOf_2022_10_22);
        originalCageCount = context.model.cageModelsMap.size;
    });

    test('Applying strategy onto single `Row`s within Daily Challenge (2022-10-22) by Sudoku.com', () => {
        // When:
        new FindComplementingCagesStrategy(context, {
            isApplyToRowAreas: true,
            isApplyToColumnAreas: false,
            isApplyToNonetAreas: false,
            minAdjacentRowsAndColumnsAreas: 1,
            maxAdjacentRowsAndColumnsAreas: 1
        }).execute();

        // Then:
        // There should be new `Cage`s in the model, as many as the amount of `Row`s.
        expect(context.model.cageModelsMap.size).toBe(originalCageCount + House.COUNT);
        // Complement for `Row` 0.
        expect(context.model.hasCage(Cage.ofSum(34).at(0, 2).at(0, 3).at(0, 4).at(0, 5).at(0, 6).at(0, 7).at(0, 8).new())).toBeTruthy();
        // Complement for `Row` 1.
        expect(context.model.hasCage(Cage.ofSum(35).at(1, 2).at(1, 3).at(1, 4).at(1, 5).at(1, 6).at(1, 7).at(1, 8).new())).toBeTruthy();
        // Complement for `Row` 2.
        expect(context.model.hasCage(Cage.ofSum(31).at(2, 2).at(2, 3).at(2, 4).at(2, 7).at(2, 8).new())).toBeTruthy();
        // Complement for `Row` 3.
        expect(context.model.hasCage(Cage.ofSum(27).at(3, 2).at(3, 3).at(3, 6).at(3, 7).at(3, 8).new())).toBeTruthy();
        // Complement for `Row` 4.
        expect(context.model.hasCage(Cage.ofSum(27).at(4, 0).at(4, 3).at(4, 6).at(4, 7).at(4, 8).new())).toBeTruthy();
        // Complement for `Row` 5.
        expect(context.model.hasCage(Cage.ofSum(39).at(5, 0).at(5, 1).at(5, 2).at(5, 3).at(5, 4).at(5, 6).at(5, 7).at(5, 8).new())).toBeTruthy();
        // Complement for `Row` 6.
        expect(context.model.hasCage(Cage.ofSum(45).at(6, 0).at(6, 1).at(6, 2).at(6, 3).at(6, 4).at(6, 5).at(6, 6).at(6, 7).at(6, 8).new())).toBeTruthy();
        // Complement for `Row` 7.
        expect(context.model.hasCage(Cage.ofSum(27).at(7, 0).at(7, 4).at(7, 5).at(7, 6).at(7, 7).at(7, 8).new())).toBeTruthy();
        // Complement for `Row` 8.
        expect(context.model.hasCage(Cage.ofSum(18).at(8, 0).at(8, 5).at(8, 8).new())).toBeTruthy();
    });

    test('Applying strategy onto adjacent `Row`s (in groups of 3) within Daily Challenge (2022-10-22) by Sudoku.com', () => {
        // When:
        new FindComplementingCagesStrategy(context, {
            isApplyToRowAreas: true,
            isApplyToColumnAreas: false,
            isApplyToNonetAreas: false,
            minAdjacentRowsAndColumnsAreas: 3,
            maxAdjacentRowsAndColumnsAreas: 3
        }).execute();

        // Then:
        // There should be only 2 new `Cage`s in the model which have complements with <= 5 `Cell`s.
        expect(context.model.cageModelsMap.size).toBe(originalCageCount + 2);
        // Complement for `Row`s 0-2.
        expect(context.model.hasCage(Cage.ofSum(22).at(2, 2).at(2, 7).at(2, 8).new())).toBeTruthy();
        // Complement for `Row`s 4-6.
        expect(context.model.hasCage(Cage.ofSum(19).at(4, 6).at(6, 7).at(6, 8).new())).toBeTruthy();
    });

    test('Applying strategy onto single `Column`s within Daily Challenge (2022-10-22) by Sudoku.com', () => {
        // When:
        new FindComplementingCagesStrategy(context, {
            isApplyToRowAreas: false,
            isApplyToColumnAreas: true,
            isApplyToNonetAreas: false,
            minAdjacentRowsAndColumnsAreas: 1,
            maxAdjacentRowsAndColumnsAreas: 1
        }).execute();

        // Then:
        // There should be new `Cage`s in the model, as many as the amount of `Column`s.
        expect(context.model.cageModelsMap.size).toBe(originalCageCount + House.COUNT);
        // Complement for `Column` 0.
        expect(context.model.hasCage(Cage.ofSum(37).at(0, 0).at(1, 0).at(2, 0).at(3, 0).at(4, 0).at(5, 0).at(6, 0).new())).toBeTruthy();
        // Complement for `Column` 1.
        expect(context.model.hasCage(Cage.ofSum(45).at(0, 1).at(1, 1).at(2, 1).at(3, 1).at(4, 1).at(5, 1).at(6, 1).at(7, 1).at(8, 1).new())).toBeTruthy();
        // Complement for `Column` 2.
        expect(context.model.hasCage(Cage.ofSum(45).at(0, 2).at(1, 2).at(2, 2).at(3, 2).at(4, 2).at(5, 2).at(6, 2).at(7, 2).at(8, 2).new())).toBeTruthy();
        // Complement for `Column` 3.
        expect(context.model.hasCage(Cage.ofSum(29).at(0, 3).at(3, 3).at(6, 3).at(7, 3).at(8, 3).new())).toBeTruthy();
        // Complement for `Column` 4.
        expect(context.model.hasCage(Cage.ofSum(31).at(0, 4).at(3, 4).at(4, 4).at(5, 4).at(6, 4).at(7, 4).at(8, 4).new())).toBeTruthy();
        // Complement for `Column` 5.
        expect(context.model.hasCage(Cage.ofSum(39).at(0, 5).at(1, 5).at(2, 5).at(3, 5).at(4, 5).at(6, 5).at(7, 5).at(8, 5).new())).toBeTruthy();
        // Complement for `Column` 6.
        expect(context.model.hasCage(Cage.ofSum(45).at(0, 6).at(1, 6).at(2, 6).at(3, 6).at(4, 6).at(5, 6).at(6, 6).at(7, 6).at(8, 6).new())).toBeTruthy();
        // Complement for `Column` 7 with `Cell` at `(2, 7)` is deleted since it is sliced when processing `Column` 8.
        expect(context.model.hasCage(Cage.ofSum(15).at(0, 7).at(1, 7).at(3, 7).at(8, 7).new())).toBeTruthy();
        // Complement for `Column` 8.
        expect(context.model.hasCage(Cage.ofSum(9).at(2, 8).at(3, 8).new())).toBeTruthy();
    });

    test('Applying strategy onto adjacent `Column`s (in groups of 3) within Daily Challenge (2022-10-22) by Sudoku.com', () => {
        // When:
        new FindComplementingCagesStrategy(context, {
            isApplyToRowAreas: false,
            isApplyToColumnAreas: true,
            isApplyToNonetAreas: false,
            minAdjacentRowsAndColumnsAreas: 3,
            maxAdjacentRowsAndColumnsAreas: 3
        }).execute();

        // Then:
        // There should be only 1 new `Cage` in the model which has a complement with <= 5 `Cell`s.
        expect(context.model.cageModelsMap.size).toBe(originalCageCount + 1);
        // Complement for `Column` 6-8.
        expect(context.model.hasCage(Cage.ofSum(21).at(0, 6).at(2, 6).at(5, 6).at(6, 6).at(7, 6).new())).toBeTruthy();
    });

    test('Applying strategy onto `Nonet`s within Daily Challenge (2022-10-22) by Sudoku.com', () => {
        // When:
        new FindComplementingCagesStrategy(context, {
            isApplyToRowAreas: false,
            isApplyToColumnAreas: false,
            isApplyToNonetAreas: true,
            minAdjacentRowsAndColumnsAreas: 1,
            maxAdjacentRowsAndColumnsAreas: 1
        }).execute();

        // Then:
        // There should be new `Cage`s in the model, as many as the amount of `Nonet`s.
        expect(context.model.cageModelsMap.size).toBe(originalCageCount + House.COUNT);
        // Complement for `Nonet` 0.
        expect(context.model.hasCage(Cage.ofSum(18).at(0, 2).at(1, 2).at(2, 2).new())).toBeTruthy();
        // Complement for `Nonet` 1.
        expect(context.model.hasCage(Cage.ofSum(21).at(0, 3).at(0, 4).at(0, 5).at(1, 5).at(2, 5).new())).toBeTruthy();
        // Complement for `Nonet` 2.
        expect(context.model.hasCage(Cage.ofSum(24).at(0, 6).at(2, 6).at(2, 7).at(2, 8).new())).toBeTruthy();
        // Complement for `Nonet` 3.
        expect(context.model.hasCage(Cage.ofSum(26).at(3, 2).at(4, 0).at(5, 0).at(5, 1).at(5, 2).new())).toBeTruthy();
        // Complement for `Nonet` 4.
        expect(context.model.hasCage(Cage.ofSum(16).at(3, 3).at(5, 4).new())).toBeTruthy();
        // Complement for `Nonet` 5.
        expect(context.model.hasCage(Cage.ofSum(9).at(3, 8).at(5, 6).new())).toBeTruthy();
        // Complement for `Nonet` 6.
        expect(context.model.hasCage(Cage.ofSum(33).at(6, 0).at(6, 1).at(6, 2).at(7, 1).at(7, 2).new())).toBeTruthy();
        // Complement for `Nonet` 7.
        expect(context.model.hasCage(Cage.ofSum(35).at(6, 3).at(6, 4).at(6, 5).at(7, 3).at(7, 4).at(7, 5).at(8, 5).new())).toBeTruthy();
        // Complement for `Nonet` 8.
        expect(context.model.hasCage(Cage.ofSum(3).at(6, 6).at(7, 6).new())).toBeTruthy();
    });

    test('Collecting statistics for `Row`s within Daily Challenge (2022-10-22) by Sudoku.com (shallow coverage)', () => {
        // When:
        new FindComplementingCagesStrategy(context, {
            isApplyToRowAreas: true,
            isApplyToColumnAreas: false,
            isApplyToNonetAreas: false,
            minAdjacentRowsAndColumnsAreas: 1,
            maxAdjacentRowsAndColumnsAreas: 1,
            isCollectStats: true
        }).execute();

        // Then:
        expect(FindComplementingCagesStrategy.STATS.totalCagesFound).toBe(9);

        const zeroAdjacentHouseComplementsStats = FindComplementingCagesStrategy.STATS.data[0];
        expect(zeroAdjacentHouseComplementsStats.adjacentHouseCount).toBe(0);
        expect(zeroAdjacentHouseComplementsStats.totalCagesFound).toBe(0);
        expect(zeroAdjacentHouseComplementsStats.foundCagesByCellCount).toEqual([
            0, // 0 `Cell`s
            0, // 1 `Cell`
            0, // 2 `Cell`s
            0, // 3 `Cell`s
            0, // 4 `Cell`s
            0, // 5 `Cell`s
            0, // 6 `Cell`s
            0, // 7 `Cell`s
            0, // 8 `Cell`s
            0  // 9 `Cell`s
        ]);

        const individualHouseComplementsStats = FindComplementingCagesStrategy.STATS.data[1];
        expect(individualHouseComplementsStats.adjacentHouseCount).toBe(1);
        expect(individualHouseComplementsStats.totalCagesFound).toBe(9);
        expect(individualHouseComplementsStats.foundCagesByCellCount).toEqual([
            0, // 0 `Cell`s
            0, // 1 `Cell`
            0, // 2 `Cell`s
            1, // 3 `Cell`s
            0, // 4 `Cell`s
            3, // 5 `Cell`s
            1, // 6 `Cell`s
            2, // 7 `Cell`s
            1, // 8 `Cell`s
            1  // 9 `Cell`s
        ]);

        const multipleAdjacentHouseComplementsStats = FindComplementingCagesStrategy.STATS.data[2];
        expect(multipleAdjacentHouseComplementsStats.adjacentHouseCount).toBe(2);
        expect(multipleAdjacentHouseComplementsStats.totalCagesFound).toBe(0);
        expect(multipleAdjacentHouseComplementsStats.foundCagesByCellCount).toEqual([
            0, // 0 `Cell`s
            0, // 1 `Cell`
            0, // 2 `Cell`s
            0, // 3 `Cell`s
            0, // 4 `Cell`s
            0, // 5 `Cell`s
            0, // 6 `Cell`s
            0, // 7 `Cell`s
            0, // 8 `Cell`s
            0  // 9 `Cell`s
        ]);
    });

});
