import * as _ from 'lodash';
import { House } from '../../../../src/puzzle/house';
import { Combo, ReadonlyCombos, SumCombinatorics } from '../../../../src/solver/math';
import { SudokuNumsSet } from '../../../../src/solver/sets';

describe('Tests for `SumCombinatorics`', () => {

    const combos = (sum: number, numCount: number) => {
        return SumCombinatorics.BY_COUNT_BY_SUM[numCount][sum].val;
    };

    test('Number combinations to form a sum out of 1 number', () => {
        rangeFromMinSumToX(SudokuNumsSet.MAX_NUM).forEach(sum => {
            expect(combos(sum, 1)).toEqual([ Combo.ofOne(sum) ]);
        });
        rangeFromXToMaxSum(SudokuNumsSet.MAX_NUM_RANGE_INCSLUSIVE_UPPER_BOUND).forEach(sum => {
            expect(combos(sum, 1)).toEqual(NO_COMBOS);
        });
    });

    test('Number combinations to form a sum out of 2 unique numbers', () => {
        rangeFromMinSumToX(2).forEach(sum => {
            expect(combos(sum, 2)).toEqual(NO_COMBOS);
        });
        expect(combos(3, 2)).toEqual([ Combo.of(1, 2) ]);
        expect(combos(4, 2)).toEqual([ Combo.of(1, 3) ]);
        expect(combos(5, 2)).toEqual([ Combo.of(1, 4), Combo.of(2, 3) ]);
        expect(combos(6, 2)).toEqual([ Combo.of(1, 5), Combo.of(2, 4) ]);
        expect(combos(7, 2)).toEqual([
            Combo.of(1, 6), Combo.of(2, 5), Combo.of(3, 4)
        ]);
        expect(combos(8, 2)).toEqual([
            Combo.of(1, 7), Combo.of(2, 6), Combo.of(3, 5)
        ]);
        expect(combos(9, 2)).toEqual([
            Combo.of(1, 8), Combo.of(2, 7), Combo.of(3, 6), Combo.of(4, 5)
        ]);
        expect(combos(10, 2)).toEqual([
            Combo.of(1, 9), Combo.of(2, 8), Combo.of(3, 7), Combo.of(4, 6)
        ]);
        expect(combos(11, 2)).toEqual([
            Combo.of(2, 9), Combo.of(3, 8), Combo.of(4, 7), Combo.of(5, 6)
        ]);
        expect(combos(12, 2)).toEqual([
            Combo.of(3, 9), Combo.of(4, 8), Combo.of(5, 7)
        ]);
        expect(combos(13, 2)).toEqual([
            Combo.of(4, 9), Combo.of(5, 8), Combo.of(6, 7)
        ]);
        expect(combos(14, 2)).toEqual([ Combo.of(5, 9), Combo.of(6, 8) ]);
        expect(combos(15, 2)).toEqual([ Combo.of(6, 9), Combo.of(7, 8) ]);
        expect(combos(16, 2)).toEqual([ Combo.of(7, 9) ]);
        expect(combos(17, 2)).toEqual([ Combo.of(8, 9) ]);
        rangeFromXToMaxSum(18).forEach(sum => {
            expect(combos(sum, 2)).toEqual(NO_COMBOS);
        });
    });

    test('Number combinations to form a sum out of 3 unique numbers', () => {
        rangeFromMinSumToX(5).forEach(sum => {
            expect(combos(sum, 3)).toEqual(NO_COMBOS);
        });
        expect(combos(6, 3)).toEqual([ Combo.of(1, 2, 3) ]);
        expect(combos(7, 3)).toEqual([ Combo.of(1, 2, 4) ]);
        expect(combos(8, 3)).toEqual([ Combo.of(1, 2, 5), Combo.of(1, 3, 4) ]);
        expect(combos(9, 3)).toEqual([
            Combo.of(1, 2, 6), Combo.of(1, 3, 5),
            Combo.of(2, 3, 4)
        ]);
        expect(combos(10, 3)).toEqual([
            Combo.of(1, 2, 7), Combo.of(1, 3, 6), Combo.of(1, 4, 5),
            Combo.of(2, 3, 5)
        ]);
        expect(combos(11, 3)).toEqual([
            Combo.of(1, 2, 8), Combo.of(1, 3, 7), Combo.of(1, 4, 6),
            Combo.of(2, 3, 6), Combo.of(2, 4, 5)
        ]);
        expect(combos(12, 3)).toEqual([
            Combo.of(1, 2, 9), Combo.of(1, 3, 8), Combo.of(1, 4, 7), Combo.of(1, 5, 6),
            Combo.of(2, 3, 7), Combo.of(2, 4, 6),
            Combo.of(3, 4, 5)
        ]);
        expect(combos(13, 3)).toEqual([
            Combo.of(1, 3, 9), Combo.of(1, 4, 8), Combo.of(1, 5, 7),
            Combo.of(2, 3, 8), Combo.of(2, 4, 7), Combo.of(2, 5, 6),
            Combo.of(3, 4, 6)
        ]);
        expect(combos(14, 3)).toEqual([
            Combo.of(1, 4, 9), Combo.of(1, 5, 8), Combo.of(1, 6, 7),
            Combo.of(2, 3, 9), Combo.of(2, 4, 8), Combo.of(2, 5, 7),
            Combo.of(3, 4, 7), Combo.of(3, 5, 6)
        ]);
        expect(combos(15, 3)).toEqual([
            Combo.of(1, 5, 9), Combo.of(1, 6, 8),
            Combo.of(2, 4, 9), Combo.of(2, 5, 8), Combo.of(2, 6, 7),
            Combo.of(3, 4, 8), Combo.of(3, 5, 7),
            Combo.of(4, 5, 6)
        ]);
        expect(combos(16, 3)).toEqual([
            Combo.of(1, 6, 9), Combo.of(1, 7, 8),
            Combo.of(2, 5, 9), Combo.of(2, 6, 8),
            Combo.of(3, 4, 9), Combo.of(3, 5, 8), Combo.of(3, 6, 7),
            Combo.of(4, 5, 7)
        ]);
        expect(combos(17, 3)).toEqual([
            Combo.of(1, 7, 9),
            Combo.of(2, 6, 9), Combo.of(2, 7, 8),
            Combo.of(3, 5, 9), Combo.of(3, 6, 8),
            Combo.of(4, 5, 8), Combo.of(4, 6, 7)
        ]);
        expect(combos(18, 3)).toEqual([
            Combo.of(1, 8, 9),
            Combo.of(2, 7, 9),
            Combo.of(3, 6, 9), Combo.of(3, 7, 8),
            Combo.of(4, 5, 9), Combo.of(4, 6, 8),
            Combo.of(5, 6, 7)
        ]);
        expect(combos(19, 3)).toEqual([
            Combo.of(2, 8, 9),
            Combo.of(3, 7, 9),
            Combo.of(4, 6, 9), Combo.of(4, 7, 8),
            Combo.of(5, 6, 8)
        ]);
        expect(combos(20, 3)).toEqual([
            Combo.of(3, 8, 9),
            Combo.of(4, 7, 9),
            Combo.of(5, 6, 9), Combo.of(5, 7, 8)
        ]);
        expect(combos(21, 3)).toEqual([
            Combo.of(4, 8, 9),
            Combo.of(5, 7, 9),
            Combo.of(6, 7, 8)
        ]);
        expect(combos(22, 3)).toEqual([ Combo.of(5, 8, 9), Combo.of(6, 7, 9) ]);
        expect(combos(23, 3)).toEqual([ Combo.of(6, 8, 9) ]);
        expect(combos(24, 3)).toEqual([ Combo.of(7, 8, 9) ]);
        rangeFromXToMaxSum(25).forEach(sum => {
            expect(combos(sum, 3)).toEqual(NO_COMBOS);
        });
    });

    test('Number combinations to form a sum out of 4 unique numbers', () => {
        rangeFromMinSumToX(9).forEach(sum => {
            expect(combos(sum, 4)).toEqual(NO_COMBOS);
        });
        expect(combos(10, 4)).toEqual([ Combo.of(1, 2, 3, 4) ]);
        expect(combos(11, 4)).toEqual([ Combo.of(1, 2, 3, 5) ]);
        expect(combos(12, 4)).toEqual([ Combo.of(1, 2, 3, 6), Combo.of(1, 2, 4, 5) ]);
        expect(combos(13, 4)).toEqual([
            Combo.of(1, 2, 3, 7), Combo.of(1, 2, 4, 6),
            Combo.of(1, 3, 4, 5)
        ]);
        expect(combos(14, 4)).toEqual([
            Combo.of(1, 2, 3, 8), Combo.of(1, 2, 4, 7), Combo.of(1, 2, 5, 6),
            Combo.of(1, 3, 4, 6),
            Combo.of(2, 3, 4, 5)
        ]);
        expect(combos(15, 4)).toEqual([
            Combo.of(1, 2, 3, 9), Combo.of(1, 2, 4, 8), Combo.of(1, 2, 5, 7),
            Combo.of(1, 3, 4, 7), Combo.of(1, 3, 5, 6),
            Combo.of(2, 3, 4, 6)
        ]);
        expect(combos(16, 4)).toEqual([
            Combo.of(1, 2, 4, 9), Combo.of(1, 2, 5, 8), Combo.of(1, 2, 6, 7),
            Combo.of(1, 3, 4, 8), Combo.of(1, 3, 5, 7),
            Combo.of(1, 4, 5, 6),
            Combo.of(2, 3, 4, 7), Combo.of(2, 3, 5, 6)
        ]);
        expect(combos(17, 4)).toEqual([
            Combo.of(1, 2, 5, 9), Combo.of(1, 2, 6, 8),
            Combo.of(1, 3, 4, 9), Combo.of(1, 3, 5, 8), Combo.of(1, 3, 6, 7),
            Combo.of(1, 4, 5, 7),
            Combo.of(2, 3, 4, 8), Combo.of(2, 3, 5, 7),
            Combo.of(2, 4, 5, 6)
        ]);
        expect(combos(18, 4)).toEqual([
            Combo.of(1, 2, 6, 9), Combo.of(1, 2, 7, 8),
            Combo.of(1, 3, 5, 9), Combo.of(1, 3, 6, 8),
            Combo.of(1, 4, 5, 8), Combo.of(1, 4, 6, 7),
            Combo.of(2, 3, 4, 9), Combo.of(2, 3, 5, 8), Combo.of(2, 3, 6, 7),
            Combo.of(2, 4, 5, 7),
            Combo.of(3, 4, 5, 6)
        ]);
        expect(combos(19, 4)).toEqual([
            Combo.of(1, 2, 7, 9),
            Combo.of(1, 3, 6, 9), Combo.of(1, 3, 7, 8),
            Combo.of(1, 4, 5, 9), Combo.of(1, 4, 6, 8),
            Combo.of(1, 5, 6, 7),
            Combo.of(2, 3, 5, 9), Combo.of(2, 3, 6, 8),
            Combo.of(2, 4, 5, 8), Combo.of(2, 4, 6, 7),
            Combo.of(3, 4, 5, 7)
        ]);
        expect(combos(20, 4)).toEqual([
            Combo.of(1, 2, 8, 9),
            Combo.of(1, 3, 7, 9),
            Combo.of(1, 4, 6, 9), Combo.of(1, 4, 7, 8),
            Combo.of(1, 5, 6, 8),
            Combo.of(2, 3, 6, 9), Combo.of(2, 3, 7, 8),
            Combo.of(2, 4, 5, 9), Combo.of(2, 4, 6, 8),
            Combo.of(2, 5, 6, 7),
            Combo.of(3, 4, 5, 8), Combo.of(3, 4, 6, 7)
        ]);
        expect(combos(21, 4)).toEqual([
            Combo.of(1, 3, 8, 9),
            Combo.of(1, 4, 7, 9),
            Combo.of(1, 5, 6, 9), Combo.of(1, 5, 7, 8),
            Combo.of(2, 3, 7, 9),
            Combo.of(2, 4, 6, 9), Combo.of(2, 4, 7, 8),
            Combo.of(2, 5, 6, 8),
            Combo.of(3, 4, 5, 9), Combo.of(3, 4, 6, 8),
            Combo.of(3, 5, 6, 7)
        ]);
        expect(combos(22, 4)).toEqual([
            Combo.of(1, 4, 8, 9),
            Combo.of(1, 5, 7, 9),
            Combo.of(1, 6, 7, 8),
            Combo.of(2, 3, 8, 9),
            Combo.of(2, 4, 7, 9),
            Combo.of(2, 5, 6, 9), Combo.of(2, 5, 7, 8),
            Combo.of(3, 4, 6, 9), Combo.of(3, 4, 7, 8),
            Combo.of(3, 5, 6, 8),
            Combo.of(4, 5, 6, 7)
        ]);
        expect(combos(23, 4)).toEqual([
            Combo.of(1, 5, 8, 9),
            Combo.of(1, 6, 7, 9),
            Combo.of(2, 4, 8, 9),
            Combo.of(2, 5, 7, 9),
            Combo.of(2, 6, 7, 8),
            Combo.of(3, 4, 7, 9),
            Combo.of(3, 5, 6, 9), Combo.of(3, 5, 7, 8),
            Combo.of(4, 5, 6, 8)
        ]);
        expect(combos(24, 4)).toEqual([
            Combo.of(1, 6, 8, 9),
            Combo.of(2, 5, 8, 9),
            Combo.of(2, 6, 7, 9),
            Combo.of(3, 4, 8, 9),
            Combo.of(3, 5, 7, 9),
            Combo.of(3, 6, 7, 8),
            Combo.of(4, 5, 6, 9), Combo.of(4, 5, 7, 8)
        ]);
        expect(combos(25, 4)).toEqual([
            Combo.of(1, 7, 8, 9),
            Combo.of(2, 6, 8, 9),
            Combo.of(3, 5, 8, 9),
            Combo.of(3, 6, 7, 9),
            Combo.of(4, 5, 7, 9),
            Combo.of(4, 6, 7, 8)
        ]);
        expect(combos(26, 4)).toEqual([
            Combo.of(2, 7, 8, 9),
            Combo.of(3, 6, 8, 9),
            Combo.of(4, 5, 8, 9),
            Combo.of(4, 6, 7, 9),
            Combo.of(5, 6, 7, 8)
        ]);
        expect(combos(27, 4)).toEqual([
            Combo.of(3, 7, 8, 9),
            Combo.of(4, 6, 8, 9),
            Combo.of(5, 6, 7, 9)
        ]);
        expect(combos(28, 4)).toEqual([ Combo.of(4, 7, 8, 9), Combo.of(5, 6, 8, 9) ]);
        expect(combos(29, 4)).toEqual([ Combo.of(5, 7, 8, 9) ]);
        expect(combos(30, 4)).toEqual([ Combo.of(6, 7, 8, 9) ]);
        rangeFromXToMaxSum(31).forEach(sum => {
            expect(combos(sum, 4)).toEqual(NO_COMBOS);
        });
    });

    test('Number combinations to form a sum out of 5 unique numbers', () => {
        rangeFromMinSumToX(14).forEach(sum => {
            expect(combos(sum, 5)).toEqual(NO_COMBOS);
        });
        expect(combos(15, 5)).toEqual([ Combo.of(1, 2, 3, 4, 5) ]);
        expect(combos(16, 5)).toEqual([ Combo.of(1, 2, 3, 4, 6) ]);
        expect(combos(17, 5)).toEqual([ Combo.of(1, 2, 3, 4, 7), Combo.of(1, 2, 3, 5, 6) ]);
        expect(combos(18, 5)).toEqual([
            Combo.of(1, 2, 3, 4, 8), Combo.of(1, 2, 3, 5, 7),
            Combo.of(1, 2, 4, 5, 6)
        ]);
        expect(combos(19, 5)).toEqual([
            Combo.of(1, 2, 3, 4, 9), Combo.of(1, 2, 3, 5, 8), Combo.of(1, 2, 3, 6, 7),
            Combo.of(1, 2, 4, 5, 7),
            Combo.of(1, 3, 4, 5, 6)
        ]);
        expect(combos(20, 5)).toEqual([
            Combo.of(1, 2, 3, 5, 9), Combo.of(1, 2, 3, 6, 8),
            Combo.of(1, 2, 4, 5, 8), Combo.of(1, 2, 4, 6, 7),
            Combo.of(1, 3, 4, 5, 7),
            Combo.of(2, 3, 4, 5, 6)
        ]);
        expect(combos(21, 5)).toEqual([
            Combo.of(1, 2, 3, 6, 9), Combo.of(1, 2, 3, 7, 8),
            Combo.of(1, 2, 4, 5, 9), Combo.of(1, 2, 4, 6, 8),
            Combo.of(1, 2, 5, 6, 7),
            Combo.of(1, 3, 4, 5, 8), Combo.of(1, 3, 4, 6, 7),
            Combo.of(2, 3, 4, 5, 7)
        ]);
        expect(combos(22, 5)).toEqual([
            Combo.of(1, 2, 3, 7, 9),
            Combo.of(1, 2, 4, 6, 9), Combo.of(1, 2, 4, 7, 8),
            Combo.of(1, 2, 5, 6, 8),
            Combo.of(1, 3, 4, 5, 9), Combo.of(1, 3, 4, 6, 8),
            Combo.of(1, 3, 5, 6, 7),
            Combo.of(2, 3, 4, 5, 8), Combo.of(2, 3, 4, 6, 7)
        ]);
        expect(combos(23, 5)).toEqual([
            Combo.of(1, 2, 3, 8, 9),
            Combo.of(1, 2, 4, 7, 9),
            Combo.of(1, 2, 5, 6, 9), Combo.of(1, 2, 5, 7, 8),
            Combo.of(1, 3, 4, 6, 9), Combo.of(1, 3, 4, 7, 8),
            Combo.of(1, 3, 5, 6, 8),
            Combo.of(1, 4, 5, 6, 7),
            Combo.of(2, 3, 4, 5, 9), Combo.of(2, 3, 4, 6, 8),
            Combo.of(2, 3, 5, 6, 7)
        ]);
        expect(combos(24, 5)).toEqual([
            Combo.of(1, 2, 4, 8, 9),
            Combo.of(1, 2, 5, 7, 9),
            Combo.of(1, 2, 6, 7, 8),
            Combo.of(1, 3, 4, 7, 9),
            Combo.of(1, 3, 5, 6, 9), Combo.of(1, 3, 5, 7, 8),
            Combo.of(1, 4, 5, 6, 8),
            Combo.of(2, 3, 4, 6, 9), Combo.of(2, 3, 4, 7, 8),
            Combo.of(2, 3, 5, 6, 8),
            Combo.of(2, 4, 5, 6, 7)
        ]);
        expect(combos(25, 5)).toEqual([
            Combo.of(1, 2, 5, 8, 9),
            Combo.of(1, 2, 6, 7, 9),
            Combo.of(1, 3, 4, 8, 9),
            Combo.of(1, 3, 5, 7, 9),
            Combo.of(1, 3, 6, 7, 8),
            Combo.of(1, 4, 5, 6, 9), Combo.of(1, 4, 5, 7, 8),
            Combo.of(2, 3, 4, 7, 9),
            Combo.of(2, 3, 5, 6, 9), Combo.of(2, 3, 5, 7, 8),
            Combo.of(2, 4, 5, 6, 8),
            Combo.of(3, 4, 5, 6, 7)
        ]);
        expect(combos(26, 5)).toEqual([
            Combo.of(1, 2, 6, 8, 9),
            Combo.of(1, 3, 5, 8, 9),
            Combo.of(1, 3, 6, 7, 9),
            Combo.of(1, 4, 5, 7, 9),
            Combo.of(1, 4, 6, 7, 8),
            Combo.of(2, 3, 4, 8, 9),
            Combo.of(2, 3, 5, 7, 9),
            Combo.of(2, 3, 6, 7, 8),
            Combo.of(2, 4, 5, 6, 9), Combo.of(2, 4, 5, 7, 8),
            Combo.of(3, 4, 5, 6, 8)
        ]);
        expect(combos(27, 5)).toEqual([
            Combo.of(1, 2, 7, 8, 9),
            Combo.of(1, 3, 6, 8, 9),
            Combo.of(1, 4, 5, 8, 9),
            Combo.of(1, 4, 6, 7, 9),
            Combo.of(1, 5, 6, 7, 8),
            Combo.of(2, 3, 5, 8, 9),
            Combo.of(2, 3, 6, 7, 9),
            Combo.of(2, 4, 5, 7, 9),
            Combo.of(2, 4, 6, 7, 8),
            Combo.of(3, 4, 5, 6, 9), Combo.of(3, 4, 5, 7, 8)
        ]);
        expect(combos(28, 5)).toEqual([
            Combo.of(1, 3, 7, 8, 9),
            Combo.of(1, 4, 6, 8, 9),
            Combo.of(1, 5, 6, 7, 9),
            Combo.of(2, 3, 6, 8, 9),
            Combo.of(2, 4, 5, 8, 9),
            Combo.of(2, 4, 6, 7, 9),
            Combo.of(2, 5, 6, 7, 8),
            Combo.of(3, 4, 5, 7, 9),
            Combo.of(3, 4, 6, 7, 8)
        ]);
        expect(combos(29, 5)).toEqual([
            Combo.of(1, 4, 7, 8, 9),
            Combo.of(1, 5, 6, 8, 9),
            Combo.of(2, 3, 7, 8, 9),
            Combo.of(2, 4, 6, 8, 9),
            Combo.of(2, 5, 6, 7, 9),
            Combo.of(3, 4, 5, 8, 9),
            Combo.of(3, 4, 6, 7, 9),
            Combo.of(3, 5, 6, 7, 8)
        ]);
        expect(combos(30, 5)).toEqual([
            Combo.of(1, 5, 7, 8, 9),
            Combo.of(2, 4, 7, 8, 9),
            Combo.of(2, 5, 6, 8, 9),
            Combo.of(3, 4, 6, 8, 9),
            Combo.of(3, 5, 6, 7, 9),
            Combo.of(4, 5, 6, 7, 8)
        ]);
        expect(combos(31, 5)).toEqual([
            Combo.of(1, 6, 7, 8, 9),
            Combo.of(2, 5, 7, 8, 9),
            Combo.of(3, 4, 7, 8, 9),
            Combo.of(3, 5, 6, 8, 9),
            Combo.of(4, 5, 6, 7, 9)
        ]);
        expect(combos(32, 5)).toEqual([
            Combo.of(2, 6, 7, 8, 9),
            Combo.of(3, 5, 7, 8, 9),
            Combo.of(4, 5, 6, 8, 9)
        ]);
        expect(combos(33, 5)).toEqual([ Combo.of(3, 6, 7, 8, 9), Combo.of(4, 5, 7, 8, 9) ]);
        expect(combos(34, 5)).toEqual([ Combo.of(4, 6, 7, 8, 9) ]);
        expect(combos(35, 5)).toEqual([ Combo.of(5, 6, 7, 8, 9) ]);
        rangeFromXToMaxSum(36).forEach(sum => {
            expect(combos(sum, 5)).toEqual(NO_COMBOS);
        });
    });

    test('Number combinations to form a sum out of 6 unique numbers', () => {
        rangeFromMinSumToX(20).forEach(sum => {
            expect(combos(sum, 6)).toEqual(NO_COMBOS);
        });
        expect(combos(21, 6)).toEqual([ Combo.of(1, 2, 3, 4, 5, 6) ]);
        expect(combos(22, 6)).toEqual([ Combo.of(1, 2, 3, 4, 5, 7) ]);
        expect(combos(23, 6)).toEqual([ Combo.of(1, 2, 3, 4, 5, 8), Combo.of(1, 2, 3, 4, 6, 7) ]);
        expect(combos(24, 6)).toEqual([
            Combo.of(1, 2, 3, 4, 5, 9), Combo.of(1, 2, 3, 4, 6, 8), Combo.of(1, 2, 3, 5, 6, 7)
        ]);
        expect(combos(25, 6)).toEqual([
            Combo.of(1, 2, 3, 4, 6, 9), Combo.of(1, 2, 3, 4, 7, 8), Combo.of(1, 2, 3, 5, 6, 8),
            Combo.of(1, 2, 4, 5, 6, 7)
        ]);
        expect(combos(26, 6)).toEqual([
            Combo.of(1, 2, 3, 4, 7, 9), Combo.of(1, 2, 3, 5, 6, 9), Combo.of(1, 2, 3, 5, 7, 8),
            Combo.of(1, 2, 4, 5, 6, 8), Combo.of(1, 3, 4, 5, 6, 7)
        ]);
        expect(combos(27, 6)).toEqual([
            Combo.of(1, 2, 3, 4, 8, 9), Combo.of(1, 2, 3, 5, 7, 9), Combo.of(1, 2, 3, 6, 7, 8),
            Combo.of(1, 2, 4, 5, 6, 9), Combo.of(1, 2, 4, 5, 7, 8),
            Combo.of(1, 3, 4, 5, 6, 8),
            Combo.of(2, 3, 4, 5, 6, 7)
        ]);
        expect(combos(28, 6)).toEqual([
            Combo.of(1, 2, 3, 5, 8, 9), Combo.of(1, 2, 3, 6, 7, 9),
            Combo.of(1, 2, 4, 5, 7, 9), Combo.of(1, 2, 4, 6, 7, 8),
            Combo.of(1, 3, 4, 5, 6, 9), Combo.of(1, 3, 4, 5, 7, 8),
            Combo.of(2, 3, 4, 5, 6, 8)
        ]);
        expect(combos(29, 6)).toEqual([
            Combo.of(1, 2, 3, 6, 8, 9),
            Combo.of(1, 2, 4, 5, 8, 9), Combo.of(1, 2, 4, 6, 7, 9),
            Combo.of(1, 2, 5, 6, 7, 8),
            Combo.of(1, 3, 4, 5, 7, 9), Combo.of(1, 3, 4, 6, 7, 8),
            Combo.of(2, 3, 4, 5, 6, 9), Combo.of(2, 3, 4, 5, 7, 8)
        ]);
        expect(combos(30, 6)).toEqual([
            Combo.of(1, 2, 3, 7, 8, 9),
            Combo.of(1, 2, 4, 6, 8, 9),
            Combo.of(1, 2, 5, 6, 7, 9),
            Combo.of(1, 3, 4, 5, 8, 9), Combo.of(1, 3, 4, 6, 7, 9),
            Combo.of(1, 3, 5, 6, 7, 8),
            Combo.of(2, 3, 4, 5, 7, 9), Combo.of(2, 3, 4, 6, 7, 8)
        ]);
        expect(combos(31, 6)).toEqual([
            Combo.of(1, 2, 4, 7, 8, 9),
            Combo.of(1, 2, 5, 6, 8, 9),
            Combo.of(1, 3, 4, 6, 8, 9),
            Combo.of(1, 3, 5, 6, 7, 9),
            Combo.of(1, 4, 5, 6, 7, 8),
            Combo.of(2, 3, 4, 5, 8, 9), Combo.of(2, 3, 4, 6, 7, 9),
            Combo.of(2, 3, 5, 6, 7, 8)
        ]);
        expect(combos(32, 6)).toEqual([
            Combo.of(1, 2, 5, 7, 8, 9),
            Combo.of(1, 3, 4, 7, 8, 9),
            Combo.of(1, 3, 5, 6, 8, 9),
            Combo.of(1, 4, 5, 6, 7, 9),
            Combo.of(2, 3, 4, 6, 8, 9),
            Combo.of(2, 3, 5, 6, 7, 9),
            Combo.of(2, 4, 5, 6, 7, 8)
        ]);
        expect(combos(33, 6)).toEqual([
            Combo.of(1, 2, 6, 7, 8, 9),
            Combo.of(1, 3, 5, 7, 8, 9),
            Combo.of(1, 4, 5, 6, 8, 9),
            Combo.of(2, 3, 4, 7, 8, 9),
            Combo.of(2, 3, 5, 6, 8, 9),
            Combo.of(2, 4, 5, 6, 7, 9),
            Combo.of(3, 4, 5, 6, 7, 8)
        ]);
        expect(combos(34, 6)).toEqual([
            Combo.of(1, 3, 6, 7, 8, 9),
            Combo.of(1, 4, 5, 7, 8, 9),
            Combo.of(2, 3, 5, 7, 8, 9),
            Combo.of(2, 4, 5, 6, 8, 9),
            Combo.of(3, 4, 5, 6, 7, 9)
        ]);
        expect(combos(35, 6)).toEqual([
            Combo.of(1, 4, 6, 7, 8, 9),
            Combo.of(2, 3, 6, 7, 8, 9),
            Combo.of(2, 4, 5, 7, 8, 9),
            Combo.of(3, 4, 5, 6, 8, 9)
        ]);
        expect(combos(36, 6)).toEqual([
            Combo.of(1, 5, 6, 7, 8, 9),
            Combo.of(2, 4, 6, 7, 8, 9),
            Combo.of(3, 4, 5, 7, 8, 9)
        ]);
        expect(combos(37, 6)).toEqual([ Combo.of(2, 5, 6, 7, 8, 9), Combo.of(3, 4, 6, 7, 8, 9) ]);
        expect(combos(38, 6)).toEqual([ Combo.of(3, 5, 6, 7, 8, 9) ]);
        expect(combos(39, 6)).toEqual([ Combo.of(4, 5, 6, 7, 8, 9) ]);
        rangeFromXToMaxSum(40).forEach(sum => {
            expect(combos(sum, 6)).toEqual(NO_COMBOS);
        });
    });

    test('Number combinations to form a sum out of 7 unique numbers', () => {
        rangeFromMinSumToX(27).forEach(sum => {
            expect(combos(sum, 7)).toEqual(NO_COMBOS);
        });
        expect(combos(28, 7)).toEqual([ Combo.of(1, 2, 3, 4, 5, 6, 7) ]);
        expect(combos(29, 7)).toEqual([ Combo.of(1, 2, 3, 4, 5, 6, 8) ]);
        expect(combos(30, 7)).toEqual([ Combo.of(1, 2, 3, 4, 5, 6, 9), Combo.of(1, 2, 3, 4, 5, 7, 8) ]);
        expect(combos(31, 7)).toEqual([ Combo.of(1, 2, 3, 4, 5, 7, 9), Combo.of(1, 2, 3, 4, 6, 7, 8) ]);
        expect(combos(32, 7)).toEqual([
            Combo.of(1, 2, 3, 4, 5, 8, 9), Combo.of(1, 2, 3, 4, 6, 7, 9), Combo.of(1, 2, 3, 5, 6, 7, 8)
        ]);
        expect(combos(33, 7)).toEqual([
            Combo.of(1, 2, 3, 4, 6, 8, 9), Combo.of(1, 2, 3, 5, 6, 7, 9),
            Combo.of(1, 2, 4, 5, 6, 7, 8)
        ]);
        expect(combos(34, 7)).toEqual([
            Combo.of(1, 2, 3, 4, 7, 8, 9), Combo.of(1, 2, 3, 5, 6, 8, 9),
            Combo.of(1, 2, 4, 5, 6, 7, 9),
            Combo.of(1, 3, 4, 5, 6, 7, 8)
        ]);
        expect(combos(35, 7)).toEqual([
            Combo.of(1, 2, 3, 5, 7, 8, 9),
            Combo.of(1, 2, 4, 5, 6, 8, 9),
            Combo.of(1, 3, 4, 5, 6, 7, 9),
            Combo.of(2, 3, 4, 5, 6, 7, 8)
        ]);
        expect(combos(36, 7)).toEqual([
            Combo.of(1, 2, 3, 6, 7, 8, 9),
            Combo.of(1, 2, 4, 5, 7, 8, 9),
            Combo.of(1, 3, 4, 5, 6, 8, 9),
            Combo.of(2, 3, 4, 5, 6, 7, 9)
        ]);
        expect(combos(36, 7)).toEqual([
            Combo.of(1, 2, 3, 6, 7, 8, 9),
            Combo.of(1, 2, 4, 5, 7, 8, 9),
            Combo.of(1, 3, 4, 5, 6, 8, 9),
            Combo.of(2, 3, 4, 5, 6, 7, 9)
        ]);
        expect(combos(37, 7)).toEqual([
            Combo.of(1, 2, 4, 6, 7, 8, 9),
            Combo.of(1, 3, 4, 5, 7, 8, 9),
            Combo.of(2, 3, 4, 5, 6, 8, 9)
        ]);
        expect(combos(38, 7)).toEqual([
            Combo.of(1, 2, 5, 6, 7, 8, 9),
            Combo.of(1, 3, 4, 6, 7, 8, 9),
            Combo.of(2, 3, 4, 5, 7, 8, 9)
        ]);
        expect(combos(39, 7)).toEqual([ Combo.of(1, 3, 5, 6, 7, 8, 9), Combo.of(2, 3, 4, 6, 7, 8, 9) ]);
        expect(combos(40, 7)).toEqual([ Combo.of(1, 4, 5, 6, 7, 8, 9), Combo.of(2, 3, 5, 6, 7, 8, 9) ]);
        expect(combos(41, 7)).toEqual([ Combo.of(2, 4, 5, 6, 7, 8, 9) ]);
        expect(combos(42, 7)).toEqual([ Combo.of(3, 4, 5, 6, 7, 8, 9) ]);
        rangeFromXToMaxSum(43).forEach(sum => {
            expect(combos(sum, 7)).toEqual(NO_COMBOS);
        });
    });

    test('Number combinations to form a sum out of 8 unique numbers', () => {
        rangeFromMinSumToX(35).forEach(sum => {
            expect(combos(sum, 8)).toEqual(NO_COMBOS);
        });
        expect(combos(36, 8)).toEqual([ Combo.of(1, 2, 3, 4, 5, 6, 7, 8) ]);
        expect(combos(37, 8)).toEqual([ Combo.of(1, 2, 3, 4, 5, 6, 7, 9) ]);
        expect(combos(38, 8)).toEqual([ Combo.of(1, 2, 3, 4, 5, 6, 8, 9) ]);
        expect(combos(39, 8)).toEqual([ Combo.of(1, 2, 3, 4, 5, 7, 8, 9) ]);
        expect(combos(40, 8)).toEqual([ Combo.of(1, 2, 3, 4, 6, 7, 8, 9) ]);
        expect(combos(41, 8)).toEqual([ Combo.of(1, 2, 3, 5, 6, 7, 8, 9) ]);
        expect(combos(42, 8)).toEqual([ Combo.of(1, 2, 4, 5, 6, 7, 8, 9) ]);
        expect(combos(43, 8)).toEqual([ Combo.of(1, 3, 4, 5, 6, 7, 8, 9) ]);
        expect(combos(44, 8)).toEqual([ Combo.of(2, 3, 4, 5, 6, 7, 8, 9) ]);
        expect(combos(45, 8)).toEqual(NO_COMBOS);
    });

    test('Number combinations to form a sum out of 9 unique numbers', () => {
        rangeFromMinSumToX(44).forEach(sum => {
            expect(combos(sum, 9)).toEqual(NO_COMBOS);
        });
        expect(combos(45, 9)).toEqual([ Combo.of(1, 2, 3, 4, 5, 6, 7, 8, 9) ]);
    });

    const rangeFromMinSumToX = (x: number) => {
        return _.range(SudokuNumsSet.MIN_NUM, x + 1);
    };

    const rangeFromXToMaxSum = (x: number) => {
        return _.range(x, House.SUM_RANGE_INCSLUSIVE_UPPER_BOUND);
    };

    const NO_COMBOS: ReadonlyCombos = [];
});
