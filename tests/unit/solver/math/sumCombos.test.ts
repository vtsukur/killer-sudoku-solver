import * as _ from 'lodash';
import { House } from '../../../../src/puzzle/house';
import { Combo, ReadonlyCombos, SumCombos } from '../../../../src/solver/math';
import { SudokuNumsSet } from '../../../../src/solver/sets';

describe('Tests for `SumCombos`', () => {

    const combosFnVal = (sum: number, numCount: number) => {
        return SumCombos.enumerate(sum, numCount).val;
    };

    test('Number combinations to form a sum out of 1 number', () => {
        rangeFromMinSumToX(SudokuNumsSet.MAX_NUM).forEach(sum => {
            expect(combosFnVal(sum, 1)).toEqual([ Combo.of(sum) ]);
        });
        rangeFromXToMaxSum(SudokuNumsSet.MAX_NUM + 1).forEach(sum => {
            expect(combosFnVal(sum, 1)).toEqual(NO_COMBOS);
        });
    });

    test('Number combinations to form a sum out of 2 unique numbers', () => {
        rangeFromMinSumToX(2).forEach(sum => {
            expect(combosFnVal(sum, 2)).toEqual(NO_COMBOS);
        });
        expect(combosFnVal(3, 2)).toEqual([ Combo.of(1, 2) ]);
        expect(combosFnVal(4, 2)).toEqual([ Combo.of(1, 3) ]);
        expect(combosFnVal(5, 2)).toEqual([ Combo.of(1, 4), Combo.of(2, 3) ]);
        expect(combosFnVal(6, 2)).toEqual([ Combo.of(1, 5), Combo.of(2, 4) ]);
        expect(combosFnVal(7, 2)).toEqual([
            Combo.of(1, 6), Combo.of(2, 5), Combo.of(3, 4)
        ]);
        expect(combosFnVal(8, 2)).toEqual([
            Combo.of(1, 7), Combo.of(2, 6), Combo.of(3, 5)
        ]);
        expect(combosFnVal(9, 2)).toEqual([
            Combo.of(1, 8), Combo.of(2, 7), Combo.of(3, 6), Combo.of(4, 5)
        ]);
        expect(combosFnVal(10, 2)).toEqual([
            Combo.of(1, 9), Combo.of(2, 8), Combo.of(3, 7), Combo.of(4, 6)
        ]);
        expect(combosFnVal(11, 2)).toEqual([
            Combo.of(2, 9), Combo.of(3, 8), Combo.of(4, 7), Combo.of(5, 6)
        ]);
        expect(combosFnVal(12, 2)).toEqual([
            Combo.of(3, 9), Combo.of(4, 8), Combo.of(5, 7)
        ]);
        expect(combosFnVal(13, 2)).toEqual([
            Combo.of(4, 9), Combo.of(5, 8), Combo.of(6, 7)
        ]);
        expect(combosFnVal(14, 2)).toEqual([ Combo.of(5, 9), Combo.of(6, 8) ]);
        expect(combosFnVal(15, 2)).toEqual([ Combo.of(6, 9), Combo.of(7, 8) ]);
        expect(combosFnVal(16, 2)).toEqual([ Combo.of(7, 9) ]);
        expect(combosFnVal(17, 2)).toEqual([ Combo.of(8, 9) ]);
        rangeFromXToMaxSum(18).forEach(sum => {
            expect(combosFnVal(sum, 2)).toEqual(NO_COMBOS);
        });
    });

    test('Number combinations to form a sum out of 3 unique numbers', () => {
        rangeFromMinSumToX(5).forEach(sum => {
            expect(combosFnVal(sum, 3)).toEqual(NO_COMBOS);
        });
        expect(combosFnVal(6, 3)).toEqual([ Combo.of(1, 2, 3) ]);
        expect(combosFnVal(7, 3)).toEqual([ Combo.of(1, 2, 4) ]);
        expect(combosFnVal(8, 3)).toEqual([ Combo.of(1, 2, 5), Combo.of(1, 3, 4) ]);
        expect(combosFnVal(9, 3)).toEqual([
            Combo.of(1, 2, 6), Combo.of(1, 3, 5),
            Combo.of(2, 3, 4)
        ]);
        expect(combosFnVal(10, 3)).toEqual([
            Combo.of(1, 2, 7), Combo.of(1, 3, 6), Combo.of(1, 4, 5),
            Combo.of(2, 3, 5)
        ]);
        expect(combosFnVal(11, 3)).toEqual([
            Combo.of(1, 2, 8), Combo.of(1, 3, 7), Combo.of(1, 4, 6),
            Combo.of(2, 3, 6), Combo.of(2, 4, 5)
        ]);
        expect(combosFnVal(12, 3)).toEqual([
            Combo.of(1, 2, 9), Combo.of(1, 3, 8), Combo.of(1, 4, 7), Combo.of(1, 5, 6),
            Combo.of(2, 3, 7), Combo.of(2, 4, 6),
            Combo.of(3, 4, 5)
        ]);
        expect(combosFnVal(13, 3)).toEqual([
            Combo.of(1, 3, 9), Combo.of(1, 4, 8), Combo.of(1, 5, 7),
            Combo.of(2, 3, 8), Combo.of(2, 4, 7), Combo.of(2, 5, 6),
            Combo.of(3, 4, 6)
        ]);
        expect(combosFnVal(14, 3)).toEqual([
            Combo.of(1, 4, 9), Combo.of(1, 5, 8), Combo.of(1, 6, 7),
            Combo.of(2, 3, 9), Combo.of(2, 4, 8), Combo.of(2, 5, 7),
            Combo.of(3, 4, 7), Combo.of(3, 5, 6)
        ]);
        expect(combosFnVal(15, 3)).toEqual([
            Combo.of(1, 5, 9), Combo.of(1, 6, 8),
            Combo.of(2, 4, 9), Combo.of(2, 5, 8), Combo.of(2, 6, 7),
            Combo.of(3, 4, 8), Combo.of(3, 5, 7),
            Combo.of(4, 5, 6)
        ]);
        expect(combosFnVal(16, 3)).toEqual([
            Combo.of(1, 6, 9), Combo.of(1, 7, 8),
            Combo.of(2, 5, 9), Combo.of(2, 6, 8),
            Combo.of(3, 4, 9), Combo.of(3, 5, 8), Combo.of(3, 6, 7),
            Combo.of(4, 5, 7)
        ]);
        expect(combosFnVal(17, 3)).toEqual([
            Combo.of(1, 7, 9),
            Combo.of(2, 6, 9), Combo.of(2, 7, 8),
            Combo.of(3, 5, 9), Combo.of(3, 6, 8),
            Combo.of(4, 5, 8), Combo.of(4, 6, 7)
        ]);
        expect(combosFnVal(18, 3)).toEqual([
            Combo.of(1, 8, 9),
            Combo.of(2, 7, 9),
            Combo.of(3, 6, 9), Combo.of(3, 7, 8),
            Combo.of(4, 5, 9), Combo.of(4, 6, 8),
            Combo.of(5, 6, 7)
        ]);
        expect(combosFnVal(19, 3)).toEqual([
            Combo.of(2, 8, 9),
            Combo.of(3, 7, 9),
            Combo.of(4, 6, 9), Combo.of(4, 7, 8),
            Combo.of(5, 6, 8)
        ]);
        expect(combosFnVal(20, 3)).toEqual([
            Combo.of(3, 8, 9),
            Combo.of(4, 7, 9),
            Combo.of(5, 6, 9), Combo.of(5, 7, 8)
        ]);
        expect(combosFnVal(21, 3)).toEqual([
            Combo.of(4, 8, 9),
            Combo.of(5, 7, 9),
            Combo.of(6, 7, 8)
        ]);
        expect(combosFnVal(22, 3)).toEqual([ Combo.of(5, 8, 9), Combo.of(6, 7, 9) ]);
        expect(combosFnVal(23, 3)).toEqual([ Combo.of(6, 8, 9) ]);
        expect(combosFnVal(24, 3)).toEqual([ Combo.of(7, 8, 9) ]);
        rangeFromXToMaxSum(25).forEach(sum => {
            expect(combosFnVal(sum, 3)).toEqual(NO_COMBOS);
        });
    });

    test('Number combinations to form a sum out of 4 unique numbers', () => {
        rangeFromMinSumToX(9).forEach(sum => {
            expect(combosFnVal(sum, 4)).toEqual(NO_COMBOS);
        });
        expect(combosFnVal(10, 4)).toEqual([ Combo.of(1, 2, 3, 4) ]);
        expect(combosFnVal(11, 4)).toEqual([ Combo.of(1, 2, 3, 5) ]);
        expect(combosFnVal(12, 4)).toEqual([ Combo.of(1, 2, 3, 6), Combo.of(1, 2, 4, 5) ]);
        expect(combosFnVal(13, 4)).toEqual([
            Combo.of(1, 2, 3, 7), Combo.of(1, 2, 4, 6),
            Combo.of(1, 3, 4, 5)
        ]);
        expect(combosFnVal(14, 4)).toEqual([
            Combo.of(1, 2, 3, 8), Combo.of(1, 2, 4, 7), Combo.of(1, 2, 5, 6),
            Combo.of(1, 3, 4, 6),
            Combo.of(2, 3, 4, 5)
        ]);
        expect(combosFnVal(15, 4)).toEqual([
            Combo.of(1, 2, 3, 9), Combo.of(1, 2, 4, 8), Combo.of(1, 2, 5, 7),
            Combo.of(1, 3, 4, 7), Combo.of(1, 3, 5, 6),
            Combo.of(2, 3, 4, 6)
        ]);
        expect(combosFnVal(16, 4)).toEqual([
            Combo.of(1, 2, 4, 9), Combo.of(1, 2, 5, 8), Combo.of(1, 2, 6, 7),
            Combo.of(1, 3, 4, 8), Combo.of(1, 3, 5, 7),
            Combo.of(1, 4, 5, 6),
            Combo.of(2, 3, 4, 7), Combo.of(2, 3, 5, 6)
        ]);
        expect(combosFnVal(17, 4)).toEqual([
            Combo.of(1, 2, 5, 9), Combo.of(1, 2, 6, 8),
            Combo.of(1, 3, 4, 9), Combo.of(1, 3, 5, 8), Combo.of(1, 3, 6, 7),
            Combo.of(1, 4, 5, 7),
            Combo.of(2, 3, 4, 8), Combo.of(2, 3, 5, 7),
            Combo.of(2, 4, 5, 6)
        ]);
        expect(combosFnVal(18, 4)).toEqual([
            Combo.of(1, 2, 6, 9), Combo.of(1, 2, 7, 8),
            Combo.of(1, 3, 5, 9), Combo.of(1, 3, 6, 8),
            Combo.of(1, 4, 5, 8), Combo.of(1, 4, 6, 7),
            Combo.of(2, 3, 4, 9), Combo.of(2, 3, 5, 8), Combo.of(2, 3, 6, 7),
            Combo.of(2, 4, 5, 7),
            Combo.of(3, 4, 5, 6)
        ]);
        expect(combosFnVal(19, 4)).toEqual([
            Combo.of(1, 2, 7, 9),
            Combo.of(1, 3, 6, 9), Combo.of(1, 3, 7, 8),
            Combo.of(1, 4, 5, 9), Combo.of(1, 4, 6, 8),
            Combo.of(1, 5, 6, 7),
            Combo.of(2, 3, 5, 9), Combo.of(2, 3, 6, 8),
            Combo.of(2, 4, 5, 8), Combo.of(2, 4, 6, 7),
            Combo.of(3, 4, 5, 7)
        ]);
        expect(combosFnVal(20, 4)).toEqual([
            Combo.of(1, 2, 8, 9),
            Combo.of(1, 3, 7, 9),
            Combo.of(1, 4, 6, 9), Combo.of(1, 4, 7, 8),
            Combo.of(1, 5, 6, 8),
            Combo.of(2, 3, 6, 9), Combo.of(2, 3, 7, 8),
            Combo.of(2, 4, 5, 9), Combo.of(2, 4, 6, 8),
            Combo.of(2, 5, 6, 7),
            Combo.of(3, 4, 5, 8), Combo.of(3, 4, 6, 7)
        ]);
        expect(combosFnVal(21, 4)).toEqual([
            Combo.of(1, 3, 8, 9),
            Combo.of(1, 4, 7, 9),
            Combo.of(1, 5, 6, 9), Combo.of(1, 5, 7, 8),
            Combo.of(2, 3, 7, 9),
            Combo.of(2, 4, 6, 9), Combo.of(2, 4, 7, 8),
            Combo.of(2, 5, 6, 8),
            Combo.of(3, 4, 5, 9), Combo.of(3, 4, 6, 8),
            Combo.of(3, 5, 6, 7)
        ]);
        expect(combosFnVal(22, 4)).toEqual([
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
        expect(combosFnVal(23, 4)).toEqual([
            Combo.of(1, 5, 8, 9),
            Combo.of(1, 6, 7, 9),
            Combo.of(2, 4, 8, 9),
            Combo.of(2, 5, 7, 9),
            Combo.of(2, 6, 7, 8),
            Combo.of(3, 4, 7, 9),
            Combo.of(3, 5, 6, 9), Combo.of(3, 5, 7, 8),
            Combo.of(4, 5, 6, 8)
        ]);
        expect(combosFnVal(24, 4)).toEqual([
            Combo.of(1, 6, 8, 9),
            Combo.of(2, 5, 8, 9),
            Combo.of(2, 6, 7, 9),
            Combo.of(3, 4, 8, 9),
            Combo.of(3, 5, 7, 9),
            Combo.of(3, 6, 7, 8),
            Combo.of(4, 5, 6, 9), Combo.of(4, 5, 7, 8)
        ]);
        expect(combosFnVal(25, 4)).toEqual([
            Combo.of(1, 7, 8, 9),
            Combo.of(2, 6, 8, 9),
            Combo.of(3, 5, 8, 9),
            Combo.of(3, 6, 7, 9),
            Combo.of(4, 5, 7, 9),
            Combo.of(4, 6, 7, 8)
        ]);
        expect(combosFnVal(26, 4)).toEqual([
            Combo.of(2, 7, 8, 9),
            Combo.of(3, 6, 8, 9),
            Combo.of(4, 5, 8, 9),
            Combo.of(4, 6, 7, 9),
            Combo.of(5, 6, 7, 8)
        ]);
        expect(combosFnVal(27, 4)).toEqual([
            Combo.of(3, 7, 8, 9),
            Combo.of(4, 6, 8, 9),
            Combo.of(5, 6, 7, 9)
        ]);
        expect(combosFnVal(28, 4)).toEqual([ Combo.of(4, 7, 8, 9), Combo.of(5, 6, 8, 9) ]);
        expect(combosFnVal(29, 4)).toEqual([ Combo.of(5, 7, 8, 9) ]);
        expect(combosFnVal(30, 4)).toEqual([ Combo.of(6, 7, 8, 9) ]);
        rangeFromXToMaxSum(31).forEach(sum => {
            expect(combosFnVal(sum, 4)).toEqual(NO_COMBOS);
        });
    });

    test('Number combinations to form a sum out of 5 unique numbers', () => {
        rangeFromMinSumToX(14).forEach(sum => {
            expect(combosFnVal(sum, 5)).toEqual(NO_COMBOS);
        });
        expect(combosFnVal(15, 5)).toEqual([ Combo.of(1, 2, 3, 4, 5) ]);
        expect(combosFnVal(16, 5)).toEqual([ Combo.of(1, 2, 3, 4, 6) ]);
        expect(combosFnVal(17, 5)).toEqual([ Combo.of(1, 2, 3, 4, 7), Combo.of(1, 2, 3, 5, 6) ]);
        expect(combosFnVal(18, 5)).toEqual([
            Combo.of(1, 2, 3, 4, 8), Combo.of(1, 2, 3, 5, 7),
            Combo.of(1, 2, 4, 5, 6)
        ]);
        expect(combosFnVal(19, 5)).toEqual([
            Combo.of(1, 2, 3, 4, 9), Combo.of(1, 2, 3, 5, 8), Combo.of(1, 2, 3, 6, 7),
            Combo.of(1, 2, 4, 5, 7),
            Combo.of(1, 3, 4, 5, 6)
        ]);
        expect(combosFnVal(20, 5)).toEqual([
            Combo.of(1, 2, 3, 5, 9), Combo.of(1, 2, 3, 6, 8),
            Combo.of(1, 2, 4, 5, 8), Combo.of(1, 2, 4, 6, 7),
            Combo.of(1, 3, 4, 5, 7),
            Combo.of(2, 3, 4, 5, 6)
        ]);
        expect(combosFnVal(21, 5)).toEqual([
            Combo.of(1, 2, 3, 6, 9), Combo.of(1, 2, 3, 7, 8),
            Combo.of(1, 2, 4, 5, 9), Combo.of(1, 2, 4, 6, 8),
            Combo.of(1, 2, 5, 6, 7),
            Combo.of(1, 3, 4, 5, 8), Combo.of(1, 3, 4, 6, 7),
            Combo.of(2, 3, 4, 5, 7)
        ]);
        expect(combosFnVal(22, 5)).toEqual([
            Combo.of(1, 2, 3, 7, 9),
            Combo.of(1, 2, 4, 6, 9), Combo.of(1, 2, 4, 7, 8),
            Combo.of(1, 2, 5, 6, 8),
            Combo.of(1, 3, 4, 5, 9), Combo.of(1, 3, 4, 6, 8),
            Combo.of(1, 3, 5, 6, 7),
            Combo.of(2, 3, 4, 5, 8), Combo.of(2, 3, 4, 6, 7)
        ]);
        expect(combosFnVal(23, 5)).toEqual([
            Combo.of(1, 2, 3, 8, 9),
            Combo.of(1, 2, 4, 7, 9),
            Combo.of(1, 2, 5, 6, 9), Combo.of(1, 2, 5, 7, 8),
            Combo.of(1, 3, 4, 6, 9), Combo.of(1, 3, 4, 7, 8),
            Combo.of(1, 3, 5, 6, 8),
            Combo.of(1, 4, 5, 6, 7),
            Combo.of(2, 3, 4, 5, 9), Combo.of(2, 3, 4, 6, 8),
            Combo.of(2, 3, 5, 6, 7)
        ]);
        expect(combosFnVal(24, 5)).toEqual([
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
        expect(combosFnVal(25, 5)).toEqual([
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
        expect(combosFnVal(26, 5)).toEqual([
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
        expect(combosFnVal(27, 5)).toEqual([
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
        expect(combosFnVal(28, 5)).toEqual([
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
        expect(combosFnVal(29, 5)).toEqual([
            Combo.of(1, 4, 7, 8, 9),
            Combo.of(1, 5, 6, 8, 9),
            Combo.of(2, 3, 7, 8, 9),
            Combo.of(2, 4, 6, 8, 9),
            Combo.of(2, 5, 6, 7, 9),
            Combo.of(3, 4, 5, 8, 9),
            Combo.of(3, 4, 6, 7, 9),
            Combo.of(3, 5, 6, 7, 8)
        ]);
        expect(combosFnVal(30, 5)).toEqual([
            Combo.of(1, 5, 7, 8, 9),
            Combo.of(2, 4, 7, 8, 9),
            Combo.of(2, 5, 6, 8, 9),
            Combo.of(3, 4, 6, 8, 9),
            Combo.of(3, 5, 6, 7, 9),
            Combo.of(4, 5, 6, 7, 8)
        ]);
        expect(combosFnVal(31, 5)).toEqual([
            Combo.of(1, 6, 7, 8, 9),
            Combo.of(2, 5, 7, 8, 9),
            Combo.of(3, 4, 7, 8, 9),
            Combo.of(3, 5, 6, 8, 9),
            Combo.of(4, 5, 6, 7, 9)
        ]);
        expect(combosFnVal(32, 5)).toEqual([
            Combo.of(2, 6, 7, 8, 9),
            Combo.of(3, 5, 7, 8, 9),
            Combo.of(4, 5, 6, 8, 9)
        ]);
        expect(combosFnVal(33, 5)).toEqual([ Combo.of(3, 6, 7, 8, 9), Combo.of(4, 5, 7, 8, 9) ]);
        expect(combosFnVal(34, 5)).toEqual([ Combo.of(4, 6, 7, 8, 9) ]);
        expect(combosFnVal(35, 5)).toEqual([ Combo.of(5, 6, 7, 8, 9) ]);
        rangeFromXToMaxSum(36).forEach(sum => {
            expect(combosFnVal(sum, 5)).toEqual(NO_COMBOS);
        });
    });

    test('Number combinations to form a sum out of 6 unique numbers', () => {
        rangeFromMinSumToX(20).forEach(sum => {
            expect(combosFnVal(sum, 6)).toEqual(NO_COMBOS);
        });
        expect(combosFnVal(21, 6)).toEqual([ Combo.of(1, 2, 3, 4, 5, 6) ]);
        expect(combosFnVal(22, 6)).toEqual([ Combo.of(1, 2, 3, 4, 5, 7) ]);
        expect(combosFnVal(23, 6)).toEqual([ Combo.of(1, 2, 3, 4, 5, 8), Combo.of(1, 2, 3, 4, 6, 7) ]);
        expect(combosFnVal(24, 6)).toEqual([
            Combo.of(1, 2, 3, 4, 5, 9), Combo.of(1, 2, 3, 4, 6, 8), Combo.of(1, 2, 3, 5, 6, 7)
        ]);
        expect(combosFnVal(25, 6)).toEqual([
            Combo.of(1, 2, 3, 4, 6, 9), Combo.of(1, 2, 3, 4, 7, 8), Combo.of(1, 2, 3, 5, 6, 8),
            Combo.of(1, 2, 4, 5, 6, 7)
        ]);
        expect(combosFnVal(26, 6)).toEqual([
            Combo.of(1, 2, 3, 4, 7, 9), Combo.of(1, 2, 3, 5, 6, 9), Combo.of(1, 2, 3, 5, 7, 8),
            Combo.of(1, 2, 4, 5, 6, 8), Combo.of(1, 3, 4, 5, 6, 7)
        ]);
        expect(combosFnVal(27, 6)).toEqual([
            Combo.of(1, 2, 3, 4, 8, 9), Combo.of(1, 2, 3, 5, 7, 9), Combo.of(1, 2, 3, 6, 7, 8),
            Combo.of(1, 2, 4, 5, 6, 9), Combo.of(1, 2, 4, 5, 7, 8),
            Combo.of(1, 3, 4, 5, 6, 8),
            Combo.of(2, 3, 4, 5, 6, 7)
        ]);
        expect(combosFnVal(28, 6)).toEqual([
            Combo.of(1, 2, 3, 5, 8, 9), Combo.of(1, 2, 3, 6, 7, 9),
            Combo.of(1, 2, 4, 5, 7, 9), Combo.of(1, 2, 4, 6, 7, 8),
            Combo.of(1, 3, 4, 5, 6, 9), Combo.of(1, 3, 4, 5, 7, 8),
            Combo.of(2, 3, 4, 5, 6, 8)
        ]);
        expect(combosFnVal(29, 6)).toEqual([
            Combo.of(1, 2, 3, 6, 8, 9),
            Combo.of(1, 2, 4, 5, 8, 9), Combo.of(1, 2, 4, 6, 7, 9),
            Combo.of(1, 2, 5, 6, 7, 8),
            Combo.of(1, 3, 4, 5, 7, 9), Combo.of(1, 3, 4, 6, 7, 8),
            Combo.of(2, 3, 4, 5, 6, 9), Combo.of(2, 3, 4, 5, 7, 8)
        ]);
        expect(combosFnVal(30, 6)).toEqual([
            Combo.of(1, 2, 3, 7, 8, 9),
            Combo.of(1, 2, 4, 6, 8, 9),
            Combo.of(1, 2, 5, 6, 7, 9),
            Combo.of(1, 3, 4, 5, 8, 9), Combo.of(1, 3, 4, 6, 7, 9),
            Combo.of(1, 3, 5, 6, 7, 8),
            Combo.of(2, 3, 4, 5, 7, 9), Combo.of(2, 3, 4, 6, 7, 8)
        ]);
        expect(combosFnVal(31, 6)).toEqual([
            Combo.of(1, 2, 4, 7, 8, 9),
            Combo.of(1, 2, 5, 6, 8, 9),
            Combo.of(1, 3, 4, 6, 8, 9),
            Combo.of(1, 3, 5, 6, 7, 9),
            Combo.of(1, 4, 5, 6, 7, 8),
            Combo.of(2, 3, 4, 5, 8, 9), Combo.of(2, 3, 4, 6, 7, 9),
            Combo.of(2, 3, 5, 6, 7, 8)
        ]);
        expect(combosFnVal(32, 6)).toEqual([
            Combo.of(1, 2, 5, 7, 8, 9),
            Combo.of(1, 3, 4, 7, 8, 9),
            Combo.of(1, 3, 5, 6, 8, 9),
            Combo.of(1, 4, 5, 6, 7, 9),
            Combo.of(2, 3, 4, 6, 8, 9),
            Combo.of(2, 3, 5, 6, 7, 9),
            Combo.of(2, 4, 5, 6, 7, 8)
        ]);
        expect(combosFnVal(33, 6)).toEqual([
            Combo.of(1, 2, 6, 7, 8, 9),
            Combo.of(1, 3, 5, 7, 8, 9),
            Combo.of(1, 4, 5, 6, 8, 9),
            Combo.of(2, 3, 4, 7, 8, 9),
            Combo.of(2, 3, 5, 6, 8, 9),
            Combo.of(2, 4, 5, 6, 7, 9),
            Combo.of(3, 4, 5, 6, 7, 8)
        ]);
        expect(combosFnVal(34, 6)).toEqual([
            Combo.of(1, 3, 6, 7, 8, 9),
            Combo.of(1, 4, 5, 7, 8, 9),
            Combo.of(2, 3, 5, 7, 8, 9),
            Combo.of(2, 4, 5, 6, 8, 9),
            Combo.of(3, 4, 5, 6, 7, 9)
        ]);
        expect(combosFnVal(35, 6)).toEqual([
            Combo.of(1, 4, 6, 7, 8, 9),
            Combo.of(2, 3, 6, 7, 8, 9),
            Combo.of(2, 4, 5, 7, 8, 9),
            Combo.of(3, 4, 5, 6, 8, 9)
        ]);
        expect(combosFnVal(36, 6)).toEqual([
            Combo.of(1, 5, 6, 7, 8, 9),
            Combo.of(2, 4, 6, 7, 8, 9),
            Combo.of(3, 4, 5, 7, 8, 9)
        ]);
        expect(combosFnVal(37, 6)).toEqual([ Combo.of(2, 5, 6, 7, 8, 9), Combo.of(3, 4, 6, 7, 8, 9) ]);
        expect(combosFnVal(38, 6)).toEqual([ Combo.of(3, 5, 6, 7, 8, 9) ]);
        expect(combosFnVal(39, 6)).toEqual([ Combo.of(4, 5, 6, 7, 8, 9) ]);
        rangeFromXToMaxSum(40).forEach(sum => {
            expect(combosFnVal(sum, 6)).toEqual(NO_COMBOS);
        });
    });

    test('Number combinations to form a sum out of 7 unique numbers', () => {
        rangeFromMinSumToX(27).forEach(sum => {
            expect(combosFnVal(sum, 7)).toEqual(NO_COMBOS);
        });
        expect(combosFnVal(28, 7)).toEqual([ Combo.of(1, 2, 3, 4, 5, 6, 7) ]);
        expect(combosFnVal(29, 7)).toEqual([ Combo.of(1, 2, 3, 4, 5, 6, 8) ]);
        expect(combosFnVal(30, 7)).toEqual([ Combo.of(1, 2, 3, 4, 5, 6, 9), Combo.of(1, 2, 3, 4, 5, 7, 8) ]);
        expect(combosFnVal(31, 7)).toEqual([ Combo.of(1, 2, 3, 4, 5, 7, 9), Combo.of(1, 2, 3, 4, 6, 7, 8) ]);
        expect(combosFnVal(32, 7)).toEqual([
            Combo.of(1, 2, 3, 4, 5, 8, 9), Combo.of(1, 2, 3, 4, 6, 7, 9), Combo.of(1, 2, 3, 5, 6, 7, 8)
        ]);
        expect(combosFnVal(33, 7)).toEqual([
            Combo.of(1, 2, 3, 4, 6, 8, 9), Combo.of(1, 2, 3, 5, 6, 7, 9),
            Combo.of(1, 2, 4, 5, 6, 7, 8)
        ]);
        expect(combosFnVal(34, 7)).toEqual([
            Combo.of(1, 2, 3, 4, 7, 8, 9), Combo.of(1, 2, 3, 5, 6, 8, 9),
            Combo.of(1, 2, 4, 5, 6, 7, 9),
            Combo.of(1, 3, 4, 5, 6, 7, 8)
        ]);
        expect(combosFnVal(35, 7)).toEqual([
            Combo.of(1, 2, 3, 5, 7, 8, 9),
            Combo.of(1, 2, 4, 5, 6, 8, 9),
            Combo.of(1, 3, 4, 5, 6, 7, 9),
            Combo.of(2, 3, 4, 5, 6, 7, 8)
        ]);
        expect(combosFnVal(36, 7)).toEqual([
            Combo.of(1, 2, 3, 6, 7, 8, 9),
            Combo.of(1, 2, 4, 5, 7, 8, 9),
            Combo.of(1, 3, 4, 5, 6, 8, 9),
            Combo.of(2, 3, 4, 5, 6, 7, 9)
        ]);
        expect(combosFnVal(36, 7)).toEqual([
            Combo.of(1, 2, 3, 6, 7, 8, 9),
            Combo.of(1, 2, 4, 5, 7, 8, 9),
            Combo.of(1, 3, 4, 5, 6, 8, 9),
            Combo.of(2, 3, 4, 5, 6, 7, 9)
        ]);
        expect(combosFnVal(37, 7)).toEqual([
            Combo.of(1, 2, 4, 6, 7, 8, 9),
            Combo.of(1, 3, 4, 5, 7, 8, 9),
            Combo.of(2, 3, 4, 5, 6, 8, 9)
        ]);
        expect(combosFnVal(38, 7)).toEqual([
            Combo.of(1, 2, 5, 6, 7, 8, 9),
            Combo.of(1, 3, 4, 6, 7, 8, 9),
            Combo.of(2, 3, 4, 5, 7, 8, 9)
        ]);
        expect(combosFnVal(39, 7)).toEqual([ Combo.of(1, 3, 5, 6, 7, 8, 9), Combo.of(2, 3, 4, 6, 7, 8, 9) ]);
        expect(combosFnVal(40, 7)).toEqual([ Combo.of(1, 4, 5, 6, 7, 8, 9), Combo.of(2, 3, 5, 6, 7, 8, 9) ]);
        expect(combosFnVal(41, 7)).toEqual([ Combo.of(2, 4, 5, 6, 7, 8, 9) ]);
        expect(combosFnVal(42, 7)).toEqual([ Combo.of(3, 4, 5, 6, 7, 8, 9) ]);
        rangeFromXToMaxSum(43).forEach(sum => {
            expect(combosFnVal(sum, 7)).toEqual(NO_COMBOS);
        });
    });

    test('Number combinations to form a sum out of 8 unique numbers', () => {
        rangeFromMinSumToX(35).forEach(sum => {
            expect(combosFnVal(sum, 8)).toEqual(NO_COMBOS);
        });
        expect(combosFnVal(36, 8)).toEqual([ Combo.of(1, 2, 3, 4, 5, 6, 7, 8) ]);
        expect(combosFnVal(37, 8)).toEqual([ Combo.of(1, 2, 3, 4, 5, 6, 7, 9) ]);
        expect(combosFnVal(38, 8)).toEqual([ Combo.of(1, 2, 3, 4, 5, 6, 8, 9) ]);
        expect(combosFnVal(39, 8)).toEqual([ Combo.of(1, 2, 3, 4, 5, 7, 8, 9) ]);
        expect(combosFnVal(40, 8)).toEqual([ Combo.of(1, 2, 3, 4, 6, 7, 8, 9) ]);
        expect(combosFnVal(41, 8)).toEqual([ Combo.of(1, 2, 3, 5, 6, 7, 8, 9) ]);
        expect(combosFnVal(42, 8)).toEqual([ Combo.of(1, 2, 4, 5, 6, 7, 8, 9) ]);
        expect(combosFnVal(43, 8)).toEqual([ Combo.of(1, 3, 4, 5, 6, 7, 8, 9) ]);
        expect(combosFnVal(44, 8)).toEqual([ Combo.of(2, 3, 4, 5, 6, 7, 8, 9) ]);
        expect(combosFnVal(45, 8)).toEqual(NO_COMBOS);
    });

    test('Number combinations to form a sum out of 9 unique numbers', () => {
        rangeFromMinSumToX(44).forEach(sum => {
            expect(combosFnVal(sum, 9)).toEqual(NO_COMBOS);
        });
        expect(combosFnVal(45, 9)).toEqual([ Combo.of(1, 2, 3, 4, 5, 6, 7, 8, 9) ]);
    });

    test('Invalid sum with value outside of range: <1', () => {
        expect(() => combosFnVal(0, 2)).toThrow('Invalid sum. Value outside of range. Expected to be within [1, 45]. Actual: 0');
    });

    test('Invalid sum with value outside of range: >45', () => {
        expect(() => combosFnVal(46, 9)).toThrow('Invalid sum. Value outside of range. Expected to be within [1, 45]. Actual: 46');
    });

    test('Invalid number count with value outside of range: <1', () => {
        expect(() => combosFnVal(3, 0)).toThrow('Invalid number count. Value outside of range. Expected to be within [1, 9]. Actual: 0');
    });

    test('Invalid number count with value outside of range: >9', () => {
        expect(() => combosFnVal(45, 10)).toThrow('Invalid number count. Value outside of range. Expected to be within [1, 9]. Actual: 10');
    });

    const rangeFromMinSumToX = (x: number) => {
        return _.range(SudokuNumsSet.MIN_NUM, x + 1);
    };

    const rangeFromXToMaxSum = (x: number) => {
        return _.range(x, House.SUM + 1);
    };

    const NO_COMBOS: ReadonlyCombos = [];
});
