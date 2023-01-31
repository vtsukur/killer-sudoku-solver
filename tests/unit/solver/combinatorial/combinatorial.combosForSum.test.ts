import * as _ from 'lodash';
import { House } from '../../../../src/puzzle/house';
import { Numbers } from '../../../../src/puzzle/numbers';
import { combosForSum } from '../../../../src/solver/combinatorial/combinatorial';
import { Combo, ReadonlyCombos } from '../../../../src/solver/combinatorial/combo';

describe('Tests for the number combinations to form a sum', () => {
    test('Number combinations to form a sum out of 1 number', () => {
        rangeFromMinSumToX(Numbers.MAX).forEach(sum => {
            expect(combosForSum(sum, 1)).toEqual([ Combo.of(sum) ]);
        });
        rangeFromXToMaxSum(Numbers.MAX + 1).forEach(sum => {
            expect(combosForSum(sum, 1)).toEqual(NO_COMBOS);
        });
    });

    test('Number combinations to form a sum out of 2 unique numbers', () => {
        rangeFromMinSumToX(2).forEach(sum => {
            expect(combosForSum(sum, 2)).toEqual(NO_COMBOS);
        });
        expect(combosForSum(3, 2)).toEqual([ Combo.of(1, 2) ]);
        expect(combosForSum(4, 2)).toEqual([ Combo.of(1, 3) ]);
        expect(combosForSum(5, 2)).toEqual([ Combo.of(1, 4), Combo.of(2, 3) ]);
        expect(combosForSum(6, 2)).toEqual([ Combo.of(1, 5), Combo.of(2, 4) ]);
        expect(combosForSum(7, 2)).toEqual([
            Combo.of(1, 6), Combo.of(2, 5), Combo.of(3, 4)
        ]);
        expect(combosForSum(8, 2)).toEqual([
            Combo.of(1, 7), Combo.of(2, 6), Combo.of(3, 5)
        ]);
        expect(combosForSum(9, 2)).toEqual([
            Combo.of(1, 8), Combo.of(2, 7), Combo.of(3, 6), Combo.of(4, 5)
        ]);
        expect(combosForSum(10, 2)).toEqual([
            Combo.of(1, 9), Combo.of(2, 8), Combo.of(3, 7), Combo.of(4, 6)
        ]);
        expect(combosForSum(11, 2)).toEqual([
            Combo.of(2, 9), Combo.of(3, 8), Combo.of(4, 7), Combo.of(5, 6)
        ]);
        expect(combosForSum(12, 2)).toEqual([
            Combo.of(3, 9), Combo.of(4, 8), Combo.of(5, 7)
        ]);
        expect(combosForSum(13, 2)).toEqual([
            Combo.of(4, 9), Combo.of(5, 8), Combo.of(6, 7)
        ]);
        expect(combosForSum(14, 2)).toEqual([ Combo.of(5, 9), Combo.of(6, 8) ]);
        expect(combosForSum(15, 2)).toEqual([ Combo.of(6, 9), Combo.of(7, 8) ]);
        expect(combosForSum(16, 2)).toEqual([ Combo.of(7, 9) ]);
        expect(combosForSum(17, 2)).toEqual([ Combo.of(8, 9) ]);
        rangeFromXToMaxSum(18).forEach(sum => {
            expect(combosForSum(sum, 2)).toEqual(NO_COMBOS);
        });
    });

    test('Number combinations to form a sum out of 3 unique numbers', () => {
        rangeFromMinSumToX(5).forEach(sum => {
            expect(combosForSum(sum, 3)).toEqual(NO_COMBOS);
        });
        expect(combosForSum(6, 3)).toEqual([ Combo.of(1, 2, 3) ]);
        expect(combosForSum(7, 3)).toEqual([ Combo.of(1, 2, 4) ]);
        expect(combosForSum(8, 3)).toEqual([ Combo.of(1, 2, 5), Combo.of(1, 3, 4) ]);
        expect(combosForSum(9, 3)).toEqual([
            Combo.of(1, 2, 6), Combo.of(1, 3, 5),
            Combo.of(2, 3, 4)
        ]);
        expect(combosForSum(10, 3)).toEqual([
            Combo.of(1, 2, 7), Combo.of(1, 3, 6), Combo.of(1, 4, 5),
            Combo.of(2, 3, 5)
        ]);
        expect(combosForSum(11, 3)).toEqual([
            Combo.of(1, 2, 8), Combo.of(1, 3, 7), Combo.of(1, 4, 6),
            Combo.of(2, 3, 6), Combo.of(2, 4, 5)
        ]);
        expect(combosForSum(12, 3)).toEqual([
            Combo.of(1, 2, 9), Combo.of(1, 3, 8), Combo.of(1, 4, 7), Combo.of(1, 5, 6),
            Combo.of(2, 3, 7), Combo.of(2, 4, 6),
            Combo.of(3, 4, 5)
        ]);
        expect(combosForSum(13, 3)).toEqual([
            Combo.of(1, 3, 9), Combo.of(1, 4, 8), Combo.of(1, 5, 7),
            Combo.of(2, 3, 8), Combo.of(2, 4, 7), Combo.of(2, 5, 6),
            Combo.of(3, 4, 6)
        ]);
        expect(combosForSum(14, 3)).toEqual([
            Combo.of(1, 4, 9), Combo.of(1, 5, 8), Combo.of(1, 6, 7),
            Combo.of(2, 3, 9), Combo.of(2, 4, 8), Combo.of(2, 5, 7),
            Combo.of(3, 4, 7), Combo.of(3, 5, 6)
        ]);
        expect(combosForSum(15, 3)).toEqual([
            Combo.of(1, 5, 9), Combo.of(1, 6, 8),
            Combo.of(2, 4, 9), Combo.of(2, 5, 8), Combo.of(2, 6, 7),
            Combo.of(3, 4, 8), Combo.of(3, 5, 7),
            Combo.of(4, 5, 6)
        ]);
        expect(combosForSum(16, 3)).toEqual([
            Combo.of(1, 6, 9), Combo.of(1, 7, 8),
            Combo.of(2, 5, 9), Combo.of(2, 6, 8),
            Combo.of(3, 4, 9), Combo.of(3, 5, 8), Combo.of(3, 6, 7),
            Combo.of(4, 5, 7)
        ]);
        expect(combosForSum(17, 3)).toEqual([
            Combo.of(1, 7, 9),
            Combo.of(2, 6, 9), Combo.of(2, 7, 8),
            Combo.of(3, 5, 9), Combo.of(3, 6, 8),
            Combo.of(4, 5, 8), Combo.of(4, 6, 7)
        ]);
        expect(combosForSum(18, 3)).toEqual([
            Combo.of(1, 8, 9),
            Combo.of(2, 7, 9),
            Combo.of(3, 6, 9), Combo.of(3, 7, 8),
            Combo.of(4, 5, 9), Combo.of(4, 6, 8),
            Combo.of(5, 6, 7)
        ]);
        expect(combosForSum(19, 3)).toEqual([
            Combo.of(2, 8, 9),
            Combo.of(3, 7, 9),
            Combo.of(4, 6, 9), Combo.of(4, 7, 8),
            Combo.of(5, 6, 8)
        ]);
        expect(combosForSum(20, 3)).toEqual([
            Combo.of(3, 8, 9),
            Combo.of(4, 7, 9),
            Combo.of(5, 6, 9), Combo.of(5, 7, 8)
        ]);
        expect(combosForSum(21, 3)).toEqual([
            Combo.of(4, 8, 9),
            Combo.of(5, 7, 9),
            Combo.of(6, 7, 8)
        ]);
        expect(combosForSum(22, 3)).toEqual([ Combo.of(5, 8, 9), Combo.of(6, 7, 9) ]);
        expect(combosForSum(23, 3)).toEqual([ Combo.of(6, 8, 9) ]);
        expect(combosForSum(24, 3)).toEqual([ Combo.of(7, 8, 9) ]);
        rangeFromXToMaxSum(25).forEach(sum => {
            expect(combosForSum(sum, 3)).toEqual(NO_COMBOS);
        });
    });

    test('Number combinations to form a sum out of 4 unique numbers', () => {
        rangeFromMinSumToX(9).forEach(sum => {
            expect(combosForSum(sum, 4)).toEqual(NO_COMBOS);
        });
        expect(combosForSum(10, 4)).toEqual([ Combo.of(1, 2, 3, 4) ]);
        expect(combosForSum(11, 4)).toEqual([ Combo.of(1, 2, 3, 5) ]);
        expect(combosForSum(12, 4)).toEqual([ Combo.of(1, 2, 3, 6), Combo.of(1, 2, 4, 5) ]);
        expect(combosForSum(13, 4)).toEqual([
            Combo.of(1, 2, 3, 7), Combo.of(1, 2, 4, 6),
            Combo.of(1, 3, 4, 5)
        ]);
        expect(combosForSum(14, 4)).toEqual([
            Combo.of(1, 2, 3, 8), Combo.of(1, 2, 4, 7), Combo.of(1, 2, 5, 6),
            Combo.of(1, 3, 4, 6),
            Combo.of(2, 3, 4, 5)
        ]);
        expect(combosForSum(15, 4)).toEqual([
            Combo.of(1, 2, 3, 9), Combo.of(1, 2, 4, 8), Combo.of(1, 2, 5, 7),
            Combo.of(1, 3, 4, 7), Combo.of(1, 3, 5, 6),
            Combo.of(2, 3, 4, 6)
        ]);
        expect(combosForSum(16, 4)).toEqual([
            Combo.of(1, 2, 4, 9), Combo.of(1, 2, 5, 8), Combo.of(1, 2, 6, 7),
            Combo.of(1, 3, 4, 8), Combo.of(1, 3, 5, 7),
            Combo.of(1, 4, 5, 6),
            Combo.of(2, 3, 4, 7), Combo.of(2, 3, 5, 6)
        ]);
        expect(combosForSum(17, 4)).toEqual([
            Combo.of(1, 2, 5, 9), Combo.of(1, 2, 6, 8),
            Combo.of(1, 3, 4, 9), Combo.of(1, 3, 5, 8), Combo.of(1, 3, 6, 7),
            Combo.of(1, 4, 5, 7),
            Combo.of(2, 3, 4, 8), Combo.of(2, 3, 5, 7),
            Combo.of(2, 4, 5, 6)
        ]);
        expect(combosForSum(18, 4)).toEqual([
            Combo.of(1, 2, 6, 9), Combo.of(1, 2, 7, 8),
            Combo.of(1, 3, 5, 9), Combo.of(1, 3, 6, 8),
            Combo.of(1, 4, 5, 8), Combo.of(1, 4, 6, 7),
            Combo.of(2, 3, 4, 9), Combo.of(2, 3, 5, 8), Combo.of(2, 3, 6, 7),
            Combo.of(2, 4, 5, 7),
            Combo.of(3, 4, 5, 6)
        ]);
        expect(combosForSum(19, 4)).toEqual([
            Combo.of(1, 2, 7, 9),
            Combo.of(1, 3, 6, 9), Combo.of(1, 3, 7, 8),
            Combo.of(1, 4, 5, 9), Combo.of(1, 4, 6, 8),
            Combo.of(1, 5, 6, 7),
            Combo.of(2, 3, 5, 9), Combo.of(2, 3, 6, 8),
            Combo.of(2, 4, 5, 8), Combo.of(2, 4, 6, 7),
            Combo.of(3, 4, 5, 7)
        ]);
        expect(combosForSum(20, 4)).toEqual([
            Combo.of(1, 2, 8, 9),
            Combo.of(1, 3, 7, 9),
            Combo.of(1, 4, 6, 9), Combo.of(1, 4, 7, 8),
            Combo.of(1, 5, 6, 8),
            Combo.of(2, 3, 6, 9), Combo.of(2, 3, 7, 8),
            Combo.of(2, 4, 5, 9), Combo.of(2, 4, 6, 8),
            Combo.of(2, 5, 6, 7),
            Combo.of(3, 4, 5, 8), Combo.of(3, 4, 6, 7)
        ]);
        expect(combosForSum(21, 4)).toEqual([
            Combo.of(1, 3, 8, 9),
            Combo.of(1, 4, 7, 9),
            Combo.of(1, 5, 6, 9), Combo.of(1, 5, 7, 8),
            Combo.of(2, 3, 7, 9),
            Combo.of(2, 4, 6, 9), Combo.of(2, 4, 7, 8),
            Combo.of(2, 5, 6, 8),
            Combo.of(3, 4, 5, 9), Combo.of(3, 4, 6, 8),
            Combo.of(3, 5, 6, 7)
        ]);
        expect(combosForSum(22, 4)).toEqual([
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
        expect(combosForSum(23, 4)).toEqual([
            Combo.of(1, 5, 8, 9),
            Combo.of(1, 6, 7, 9),
            Combo.of(2, 4, 8, 9),
            Combo.of(2, 5, 7, 9),
            Combo.of(2, 6, 7, 8),
            Combo.of(3, 4, 7, 9),
            Combo.of(3, 5, 6, 9), Combo.of(3, 5, 7, 8),
            Combo.of(4, 5, 6, 8)
        ]);
        expect(combosForSum(24, 4)).toEqual([
            Combo.of(1, 6, 8, 9),
            Combo.of(2, 5, 8, 9),
            Combo.of(2, 6, 7, 9),
            Combo.of(3, 4, 8, 9),
            Combo.of(3, 5, 7, 9),
            Combo.of(3, 6, 7, 8),
            Combo.of(4, 5, 6, 9), Combo.of(4, 5, 7, 8)
        ]);
        expect(combosForSum(25, 4)).toEqual([
            Combo.of(1, 7, 8, 9),
            Combo.of(2, 6, 8, 9),
            Combo.of(3, 5, 8, 9),
            Combo.of(3, 6, 7, 9),
            Combo.of(4, 5, 7, 9),
            Combo.of(4, 6, 7, 8)
        ]);
        expect(combosForSum(26, 4)).toEqual([
            Combo.of(2, 7, 8, 9),
            Combo.of(3, 6, 8, 9),
            Combo.of(4, 5, 8, 9),
            Combo.of(4, 6, 7, 9),
            Combo.of(5, 6, 7, 8)
        ]);
        expect(combosForSum(27, 4)).toEqual([
            Combo.of(3, 7, 8, 9),
            Combo.of(4, 6, 8, 9),
            Combo.of(5, 6, 7, 9)
        ]);
        expect(combosForSum(28, 4)).toEqual([ Combo.of(4, 7, 8, 9), Combo.of(5, 6, 8, 9) ]);
        expect(combosForSum(29, 4)).toEqual([ Combo.of(5, 7, 8, 9) ]);
        expect(combosForSum(30, 4)).toEqual([ Combo.of(6, 7, 8, 9) ]);
        rangeFromXToMaxSum(31).forEach(sum => {
            expect(combosForSum(sum, 4)).toEqual(NO_COMBOS);
        });
    });

    test('Number combinations to form a sum out of 5 unique numbers', () => {
        rangeFromMinSumToX(14).forEach(sum => {
            expect(combosForSum(sum, 5)).toEqual(NO_COMBOS);
        });
        expect(combosForSum(15, 5)).toEqual([ Combo.of(1, 2, 3, 4, 5) ]);
        expect(combosForSum(16, 5)).toEqual([ Combo.of(1, 2, 3, 4, 6) ]);
        expect(combosForSum(17, 5)).toEqual([ Combo.of(1, 2, 3, 4, 7), Combo.of(1, 2, 3, 5, 6) ]);
        expect(combosForSum(18, 5)).toEqual([
            Combo.of(1, 2, 3, 4, 8), Combo.of(1, 2, 3, 5, 7),
            Combo.of(1, 2, 4, 5, 6)
        ]);
        expect(combosForSum(19, 5)).toEqual([
            Combo.of(1, 2, 3, 4, 9), Combo.of(1, 2, 3, 5, 8), Combo.of(1, 2, 3, 6, 7),
            Combo.of(1, 2, 4, 5, 7),
            Combo.of(1, 3, 4, 5, 6)
        ]);
        expect(combosForSum(20, 5)).toEqual([
            Combo.of(1, 2, 3, 5, 9), Combo.of(1, 2, 3, 6, 8),
            Combo.of(1, 2, 4, 5, 8), Combo.of(1, 2, 4, 6, 7),
            Combo.of(1, 3, 4, 5, 7),
            Combo.of(2, 3, 4, 5, 6)
        ]);
        expect(combosForSum(21, 5)).toEqual([
            Combo.of(1, 2, 3, 6, 9), Combo.of(1, 2, 3, 7, 8),
            Combo.of(1, 2, 4, 5, 9), Combo.of(1, 2, 4, 6, 8),
            Combo.of(1, 2, 5, 6, 7),
            Combo.of(1, 3, 4, 5, 8), Combo.of(1, 3, 4, 6, 7),
            Combo.of(2, 3, 4, 5, 7)
        ]);
        expect(combosForSum(22, 5)).toEqual([
            Combo.of(1, 2, 3, 7, 9),
            Combo.of(1, 2, 4, 6, 9), Combo.of(1, 2, 4, 7, 8),
            Combo.of(1, 2, 5, 6, 8),
            Combo.of(1, 3, 4, 5, 9), Combo.of(1, 3, 4, 6, 8),
            Combo.of(1, 3, 5, 6, 7),
            Combo.of(2, 3, 4, 5, 8), Combo.of(2, 3, 4, 6, 7)
        ]);
        expect(combosForSum(23, 5)).toEqual([
            Combo.of(1, 2, 3, 8, 9),
            Combo.of(1, 2, 4, 7, 9),
            Combo.of(1, 2, 5, 6, 9), Combo.of(1, 2, 5, 7, 8),
            Combo.of(1, 3, 4, 6, 9), Combo.of(1, 3, 4, 7, 8),
            Combo.of(1, 3, 5, 6, 8),
            Combo.of(1, 4, 5, 6, 7),
            Combo.of(2, 3, 4, 5, 9), Combo.of(2, 3, 4, 6, 8),
            Combo.of(2, 3, 5, 6, 7)
        ]);
        expect(combosForSum(24, 5)).toEqual([
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
        expect(combosForSum(25, 5)).toEqual([
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
        expect(combosForSum(26, 5)).toEqual([
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
        expect(combosForSum(27, 5)).toEqual([
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
        expect(combosForSum(28, 5)).toEqual([
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
        expect(combosForSum(29, 5)).toEqual([
            Combo.of(1, 4, 7, 8, 9),
            Combo.of(1, 5, 6, 8, 9),
            Combo.of(2, 3, 7, 8, 9),
            Combo.of(2, 4, 6, 8, 9),
            Combo.of(2, 5, 6, 7, 9),
            Combo.of(3, 4, 5, 8, 9),
            Combo.of(3, 4, 6, 7, 9),
            Combo.of(3, 5, 6, 7, 8)
        ]);
        expect(combosForSum(30, 5)).toEqual([
            Combo.of(1, 5, 7, 8, 9),
            Combo.of(2, 4, 7, 8, 9),
            Combo.of(2, 5, 6, 8, 9),
            Combo.of(3, 4, 6, 8, 9),
            Combo.of(3, 5, 6, 7, 9),
            Combo.of(4, 5, 6, 7, 8)
        ]);
        expect(combosForSum(31, 5)).toEqual([
            Combo.of(1, 6, 7, 8, 9),
            Combo.of(2, 5, 7, 8, 9),
            Combo.of(3, 4, 7, 8, 9),
            Combo.of(3, 5, 6, 8, 9),
            Combo.of(4, 5, 6, 7, 9)
        ]);
        expect(combosForSum(32, 5)).toEqual([
            Combo.of(2, 6, 7, 8, 9),
            Combo.of(3, 5, 7, 8, 9),
            Combo.of(4, 5, 6, 8, 9)
        ]);
        expect(combosForSum(33, 5)).toEqual([ Combo.of(3, 6, 7, 8, 9), Combo.of(4, 5, 7, 8, 9) ]);
        expect(combosForSum(34, 5)).toEqual([ Combo.of(4, 6, 7, 8, 9) ]);
        expect(combosForSum(35, 5)).toEqual([ Combo.of(5, 6, 7, 8, 9) ]);
        rangeFromXToMaxSum(36).forEach(sum => {
            expect(combosForSum(sum, 5)).toEqual(NO_COMBOS);
        });
    });

    test('Number combinations to form a sum out of 6 unique numbers', () => {
        rangeFromMinSumToX(20).forEach(sum => {
            expect(combosForSum(sum, 6)).toEqual(NO_COMBOS);
        });
        expect(combosForSum(21, 6)).toEqual([ Combo.of(1, 2, 3, 4, 5, 6) ]);
        expect(combosForSum(22, 6)).toEqual([ Combo.of(1, 2, 3, 4, 5, 7) ]);
        expect(combosForSum(23, 6)).toEqual([ Combo.of(1, 2, 3, 4, 5, 8), Combo.of(1, 2, 3, 4, 6, 7) ]);
        expect(combosForSum(24, 6)).toEqual([
            Combo.of(1, 2, 3, 4, 5, 9), Combo.of(1, 2, 3, 4, 6, 8), Combo.of(1, 2, 3, 5, 6, 7)
        ]);
        expect(combosForSum(25, 6)).toEqual([
            Combo.of(1, 2, 3, 4, 6, 9), Combo.of(1, 2, 3, 4, 7, 8), Combo.of(1, 2, 3, 5, 6, 8),
            Combo.of(1, 2, 4, 5, 6, 7)
        ]);
        expect(combosForSum(26, 6)).toEqual([
            Combo.of(1, 2, 3, 4, 7, 9), Combo.of(1, 2, 3, 5, 6, 9), Combo.of(1, 2, 3, 5, 7, 8),
            Combo.of(1, 2, 4, 5, 6, 8), Combo.of(1, 3, 4, 5, 6, 7)
        ]);
        expect(combosForSum(27, 6)).toEqual([
            Combo.of(1, 2, 3, 4, 8, 9), Combo.of(1, 2, 3, 5, 7, 9), Combo.of(1, 2, 3, 6, 7, 8),
            Combo.of(1, 2, 4, 5, 6, 9), Combo.of(1, 2, 4, 5, 7, 8),
            Combo.of(1, 3, 4, 5, 6, 8),
            Combo.of(2, 3, 4, 5, 6, 7)
        ]);
        expect(combosForSum(28, 6)).toEqual([
            Combo.of(1, 2, 3, 5, 8, 9), Combo.of(1, 2, 3, 6, 7, 9),
            Combo.of(1, 2, 4, 5, 7, 9), Combo.of(1, 2, 4, 6, 7, 8),
            Combo.of(1, 3, 4, 5, 6, 9), Combo.of(1, 3, 4, 5, 7, 8),
            Combo.of(2, 3, 4, 5, 6, 8)
        ]);
        expect(combosForSum(29, 6)).toEqual([
            Combo.of(1, 2, 3, 6, 8, 9),
            Combo.of(1, 2, 4, 5, 8, 9), Combo.of(1, 2, 4, 6, 7, 9),
            Combo.of(1, 2, 5, 6, 7, 8),
            Combo.of(1, 3, 4, 5, 7, 9), Combo.of(1, 3, 4, 6, 7, 8),
            Combo.of(2, 3, 4, 5, 6, 9), Combo.of(2, 3, 4, 5, 7, 8)
        ]);
        expect(combosForSum(30, 6)).toEqual([
            Combo.of(1, 2, 3, 7, 8, 9),
            Combo.of(1, 2, 4, 6, 8, 9),
            Combo.of(1, 2, 5, 6, 7, 9),
            Combo.of(1, 3, 4, 5, 8, 9), Combo.of(1, 3, 4, 6, 7, 9),
            Combo.of(1, 3, 5, 6, 7, 8),
            Combo.of(2, 3, 4, 5, 7, 9), Combo.of(2, 3, 4, 6, 7, 8)
        ]);
        expect(combosForSum(31, 6)).toEqual([
            Combo.of(1, 2, 4, 7, 8, 9),
            Combo.of(1, 2, 5, 6, 8, 9),
            Combo.of(1, 3, 4, 6, 8, 9),
            Combo.of(1, 3, 5, 6, 7, 9),
            Combo.of(1, 4, 5, 6, 7, 8),
            Combo.of(2, 3, 4, 5, 8, 9), Combo.of(2, 3, 4, 6, 7, 9),
            Combo.of(2, 3, 5, 6, 7, 8)
        ]);
        expect(combosForSum(32, 6)).toEqual([
            Combo.of(1, 2, 5, 7, 8, 9),
            Combo.of(1, 3, 4, 7, 8, 9),
            Combo.of(1, 3, 5, 6, 8, 9),
            Combo.of(1, 4, 5, 6, 7, 9),
            Combo.of(2, 3, 4, 6, 8, 9),
            Combo.of(2, 3, 5, 6, 7, 9),
            Combo.of(2, 4, 5, 6, 7, 8)
        ]);
        expect(combosForSum(33, 6)).toEqual([
            Combo.of(1, 2, 6, 7, 8, 9),
            Combo.of(1, 3, 5, 7, 8, 9),
            Combo.of(1, 4, 5, 6, 8, 9),
            Combo.of(2, 3, 4, 7, 8, 9),
            Combo.of(2, 3, 5, 6, 8, 9),
            Combo.of(2, 4, 5, 6, 7, 9),
            Combo.of(3, 4, 5, 6, 7, 8)
        ]);
        expect(combosForSum(34, 6)).toEqual([
            Combo.of(1, 3, 6, 7, 8, 9),
            Combo.of(1, 4, 5, 7, 8, 9),
            Combo.of(2, 3, 5, 7, 8, 9),
            Combo.of(2, 4, 5, 6, 8, 9),
            Combo.of(3, 4, 5, 6, 7, 9)
        ]);
        expect(combosForSum(35, 6)).toEqual([
            Combo.of(1, 4, 6, 7, 8, 9),
            Combo.of(2, 3, 6, 7, 8, 9),
            Combo.of(2, 4, 5, 7, 8, 9),
            Combo.of(3, 4, 5, 6, 8, 9)
        ]);
        expect(combosForSum(36, 6)).toEqual([
            Combo.of(1, 5, 6, 7, 8, 9),
            Combo.of(2, 4, 6, 7, 8, 9),
            Combo.of(3, 4, 5, 7, 8, 9)
        ]);
        expect(combosForSum(37, 6)).toEqual([ Combo.of(2, 5, 6, 7, 8, 9), Combo.of(3, 4, 6, 7, 8, 9) ]);
        expect(combosForSum(38, 6)).toEqual([ Combo.of(3, 5, 6, 7, 8, 9) ]);
        expect(combosForSum(39, 6)).toEqual([ Combo.of(4, 5, 6, 7, 8, 9) ]);
        rangeFromXToMaxSum(40).forEach(sum => {
            expect(combosForSum(sum, 6)).toEqual(NO_COMBOS);
        });
    });

    test('Number combinations to form a sum out of 7 unique numbers', () => {
        rangeFromMinSumToX(27).forEach(sum => {
            expect(combosForSum(sum, 7)).toEqual(NO_COMBOS);
        });
        expect(combosForSum(28, 7)).toEqual([ Combo.of(1, 2, 3, 4, 5, 6, 7) ]);
        expect(combosForSum(29, 7)).toEqual([ Combo.of(1, 2, 3, 4, 5, 6, 8) ]);
        expect(combosForSum(30, 7)).toEqual([ Combo.of(1, 2, 3, 4, 5, 6, 9), Combo.of(1, 2, 3, 4, 5, 7, 8) ]);
        expect(combosForSum(31, 7)).toEqual([ Combo.of(1, 2, 3, 4, 5, 7, 9), Combo.of(1, 2, 3, 4, 6, 7, 8) ]);
        expect(combosForSum(32, 7)).toEqual([
            Combo.of(1, 2, 3, 4, 5, 8, 9), Combo.of(1, 2, 3, 4, 6, 7, 9), Combo.of(1, 2, 3, 5, 6, 7, 8)
        ]);
        expect(combosForSum(33, 7)).toEqual([
            Combo.of(1, 2, 3, 4, 6, 8, 9), Combo.of(1, 2, 3, 5, 6, 7, 9),
            Combo.of(1, 2, 4, 5, 6, 7, 8)
        ]);
        expect(combosForSum(34, 7)).toEqual([
            Combo.of(1, 2, 3, 4, 7, 8, 9), Combo.of(1, 2, 3, 5, 6, 8, 9),
            Combo.of(1, 2, 4, 5, 6, 7, 9),
            Combo.of(1, 3, 4, 5, 6, 7, 8)
        ]);
        expect(combosForSum(35, 7)).toEqual([
            Combo.of(1, 2, 3, 5, 7, 8, 9),
            Combo.of(1, 2, 4, 5, 6, 8, 9),
            Combo.of(1, 3, 4, 5, 6, 7, 9),
            Combo.of(2, 3, 4, 5, 6, 7, 8)
        ]);
        expect(combosForSum(36, 7)).toEqual([
            Combo.of(1, 2, 3, 6, 7, 8, 9),
            Combo.of(1, 2, 4, 5, 7, 8, 9),
            Combo.of(1, 3, 4, 5, 6, 8, 9),
            Combo.of(2, 3, 4, 5, 6, 7, 9)
        ]);
        expect(combosForSum(36, 7)).toEqual([
            Combo.of(1, 2, 3, 6, 7, 8, 9),
            Combo.of(1, 2, 4, 5, 7, 8, 9),
            Combo.of(1, 3, 4, 5, 6, 8, 9),
            Combo.of(2, 3, 4, 5, 6, 7, 9)
        ]);
        expect(combosForSum(37, 7)).toEqual([
            Combo.of(1, 2, 4, 6, 7, 8, 9),
            Combo.of(1, 3, 4, 5, 7, 8, 9),
            Combo.of(2, 3, 4, 5, 6, 8, 9)
        ]);
        expect(combosForSum(38, 7)).toEqual([
            Combo.of(1, 2, 5, 6, 7, 8, 9),
            Combo.of(1, 3, 4, 6, 7, 8, 9),
            Combo.of(2, 3, 4, 5, 7, 8, 9)
        ]);
        expect(combosForSum(39, 7)).toEqual([ Combo.of(1, 3, 5, 6, 7, 8, 9), Combo.of(2, 3, 4, 6, 7, 8, 9) ]);
        expect(combosForSum(40, 7)).toEqual([ Combo.of(1, 4, 5, 6, 7, 8, 9), Combo.of(2, 3, 5, 6, 7, 8, 9) ]);
        expect(combosForSum(41, 7)).toEqual([ Combo.of(2, 4, 5, 6, 7, 8, 9) ]);
        expect(combosForSum(42, 7)).toEqual([ Combo.of(3, 4, 5, 6, 7, 8, 9) ]);
        rangeFromXToMaxSum(43).forEach(sum => {
            expect(combosForSum(sum, 7)).toEqual(NO_COMBOS);
        });
    });

    test('Number combinations to form a sum out of 8 unique numbers', () => {
        rangeFromMinSumToX(35).forEach(sum => {
            expect(combosForSum(sum, 8)).toEqual(NO_COMBOS);
        });
        expect(combosForSum(36, 8)).toEqual([ Combo.of(1, 2, 3, 4, 5, 6, 7, 8) ]);
        expect(combosForSum(37, 8)).toEqual([ Combo.of(1, 2, 3, 4, 5, 6, 7, 9) ]);
        expect(combosForSum(38, 8)).toEqual([ Combo.of(1, 2, 3, 4, 5, 6, 8, 9) ]);
        expect(combosForSum(39, 8)).toEqual([ Combo.of(1, 2, 3, 4, 5, 7, 8, 9) ]);
        expect(combosForSum(40, 8)).toEqual([ Combo.of(1, 2, 3, 4, 6, 7, 8, 9) ]);
        expect(combosForSum(41, 8)).toEqual([ Combo.of(1, 2, 3, 5, 6, 7, 8, 9) ]);
        expect(combosForSum(42, 8)).toEqual([ Combo.of(1, 2, 4, 5, 6, 7, 8, 9) ]);
        expect(combosForSum(43, 8)).toEqual([ Combo.of(1, 3, 4, 5, 6, 7, 8, 9) ]);
        expect(combosForSum(44, 8)).toEqual([ Combo.of(2, 3, 4, 5, 6, 7, 8, 9) ]);
        expect(combosForSum(45, 8)).toEqual(NO_COMBOS);
    });

    test('Number combinations to form a sum out of 9 unique numbers', () => {
        rangeFromMinSumToX(44).forEach(sum => {
            expect(combosForSum(sum, 9)).toEqual(NO_COMBOS);
        });
        expect(combosForSum(45, 9)).toEqual([ Combo.of(1, 2, 3, 4, 5, 6, 7, 8, 9) ]);
    });

    test('Invalid sum with value outside of range: <1', () => {
        expect(() => combosForSum(0, 2)).toThrow('Invalid sum. Value outside of range. Expected to be within [1, 45]. Actual: 0');
    });

    test('Invalid sum with value outside of range: >45', () => {
        expect(() => combosForSum(46, 9)).toThrow('Invalid sum. Value outside of range. Expected to be within [1, 45]. Actual: 46');
    });

    test('Invalid number count with value outside of range: <1', () => {
        expect(() => combosForSum(3, 0)).toThrow('Invalid number count. Value outside of range. Expected to be within [1, 9]. Actual: 0');
    });

    test('Invalid number count with value outside of range: >9', () => {
        expect(() => combosForSum(45, 10)).toThrow('Invalid number count. Value outside of range. Expected to be within [1, 9]. Actual: 10');
    });

    const rangeFromMinSumToX = (x: number) => {
        return _.range(Numbers.MIN, x + 1);
    };

    const rangeFromXToMaxSum = (x: number) => {
        return _.range(x, House.SUM + 1);
    };

    const NO_COMBOS: ReadonlyCombos = [];
});
