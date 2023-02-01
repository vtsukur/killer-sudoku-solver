import * as _ from 'lodash';
import { House } from '../../../../src/puzzle/house';
import { Numbers } from '../../../../src/puzzle/numbers';
import { Combo, ReadonlyCombos, combosForSum } from '../../../../src/solver/combinatorial';
import { computeComboForSum } from '../../../../src/solver/combinatorial/combosForSum';

describe('Tests for the unique number combinations to form a sum', () => {
    [
        combosForSum,
        computeComboForSum
    ].forEach(combosFn => {
        test(`[${combosFn.name}] Number combinations to form a sum out of 1 number`, () => {
            rangeFromMinSumToX(Numbers.MAX).forEach(sum => {
                expect(combosFn(sum, 1)).toEqual([ Combo.of(sum) ]);
            });
            rangeFromXToMaxSum(Numbers.MAX + 1).forEach(sum => {
                expect(combosFn(sum, 1)).toEqual(NO_COMBOS);
            });
        });

        test(`[${combosFn.name}] Number combinations to form a sum out of 2 unique numbers`, () => {
            rangeFromMinSumToX(2).forEach(sum => {
                expect(combosFn(sum, 2)).toEqual(NO_COMBOS);
            });
            expect(combosFn(3, 2)).toEqual([ Combo.of(1, 2) ]);
            expect(combosFn(4, 2)).toEqual([ Combo.of(1, 3) ]);
            expect(combosFn(5, 2)).toEqual([ Combo.of(1, 4), Combo.of(2, 3) ]);
            expect(combosFn(6, 2)).toEqual([ Combo.of(1, 5), Combo.of(2, 4) ]);
            expect(combosFn(7, 2)).toEqual([
                Combo.of(1, 6), Combo.of(2, 5), Combo.of(3, 4)
            ]);
            expect(combosFn(8, 2)).toEqual([
                Combo.of(1, 7), Combo.of(2, 6), Combo.of(3, 5)
            ]);
            expect(combosFn(9, 2)).toEqual([
                Combo.of(1, 8), Combo.of(2, 7), Combo.of(3, 6), Combo.of(4, 5)
            ]);
            expect(combosFn(10, 2)).toEqual([
                Combo.of(1, 9), Combo.of(2, 8), Combo.of(3, 7), Combo.of(4, 6)
            ]);
            expect(combosFn(11, 2)).toEqual([
                Combo.of(2, 9), Combo.of(3, 8), Combo.of(4, 7), Combo.of(5, 6)
            ]);
            expect(combosFn(12, 2)).toEqual([
                Combo.of(3, 9), Combo.of(4, 8), Combo.of(5, 7)
            ]);
            expect(combosFn(13, 2)).toEqual([
                Combo.of(4, 9), Combo.of(5, 8), Combo.of(6, 7)
            ]);
            expect(combosFn(14, 2)).toEqual([ Combo.of(5, 9), Combo.of(6, 8) ]);
            expect(combosFn(15, 2)).toEqual([ Combo.of(6, 9), Combo.of(7, 8) ]);
            expect(combosFn(16, 2)).toEqual([ Combo.of(7, 9) ]);
            expect(combosFn(17, 2)).toEqual([ Combo.of(8, 9) ]);
            rangeFromXToMaxSum(18).forEach(sum => {
                expect(combosFn(sum, 2)).toEqual(NO_COMBOS);
            });
        });

        test(`[${combosFn.name}] Number combinations to form a sum out of 3 unique numbers`, () => {
            rangeFromMinSumToX(5).forEach(sum => {
                expect(combosFn(sum, 3)).toEqual(NO_COMBOS);
            });
            expect(combosFn(6, 3)).toEqual([ Combo.of(1, 2, 3) ]);
            expect(combosFn(7, 3)).toEqual([ Combo.of(1, 2, 4) ]);
            expect(combosFn(8, 3)).toEqual([ Combo.of(1, 2, 5), Combo.of(1, 3, 4) ]);
            expect(combosFn(9, 3)).toEqual([
                Combo.of(1, 2, 6), Combo.of(1, 3, 5),
                Combo.of(2, 3, 4)
            ]);
            expect(combosFn(10, 3)).toEqual([
                Combo.of(1, 2, 7), Combo.of(1, 3, 6), Combo.of(1, 4, 5),
                Combo.of(2, 3, 5)
            ]);
            expect(combosFn(11, 3)).toEqual([
                Combo.of(1, 2, 8), Combo.of(1, 3, 7), Combo.of(1, 4, 6),
                Combo.of(2, 3, 6), Combo.of(2, 4, 5)
            ]);
            expect(combosFn(12, 3)).toEqual([
                Combo.of(1, 2, 9), Combo.of(1, 3, 8), Combo.of(1, 4, 7), Combo.of(1, 5, 6),
                Combo.of(2, 3, 7), Combo.of(2, 4, 6),
                Combo.of(3, 4, 5)
            ]);
            expect(combosFn(13, 3)).toEqual([
                Combo.of(1, 3, 9), Combo.of(1, 4, 8), Combo.of(1, 5, 7),
                Combo.of(2, 3, 8), Combo.of(2, 4, 7), Combo.of(2, 5, 6),
                Combo.of(3, 4, 6)
            ]);
            expect(combosFn(14, 3)).toEqual([
                Combo.of(1, 4, 9), Combo.of(1, 5, 8), Combo.of(1, 6, 7),
                Combo.of(2, 3, 9), Combo.of(2, 4, 8), Combo.of(2, 5, 7),
                Combo.of(3, 4, 7), Combo.of(3, 5, 6)
            ]);
            expect(combosFn(15, 3)).toEqual([
                Combo.of(1, 5, 9), Combo.of(1, 6, 8),
                Combo.of(2, 4, 9), Combo.of(2, 5, 8), Combo.of(2, 6, 7),
                Combo.of(3, 4, 8), Combo.of(3, 5, 7),
                Combo.of(4, 5, 6)
            ]);
            expect(combosFn(16, 3)).toEqual([
                Combo.of(1, 6, 9), Combo.of(1, 7, 8),
                Combo.of(2, 5, 9), Combo.of(2, 6, 8),
                Combo.of(3, 4, 9), Combo.of(3, 5, 8), Combo.of(3, 6, 7),
                Combo.of(4, 5, 7)
            ]);
            expect(combosFn(17, 3)).toEqual([
                Combo.of(1, 7, 9),
                Combo.of(2, 6, 9), Combo.of(2, 7, 8),
                Combo.of(3, 5, 9), Combo.of(3, 6, 8),
                Combo.of(4, 5, 8), Combo.of(4, 6, 7)
            ]);
            expect(combosFn(18, 3)).toEqual([
                Combo.of(1, 8, 9),
                Combo.of(2, 7, 9),
                Combo.of(3, 6, 9), Combo.of(3, 7, 8),
                Combo.of(4, 5, 9), Combo.of(4, 6, 8),
                Combo.of(5, 6, 7)
            ]);
            expect(combosFn(19, 3)).toEqual([
                Combo.of(2, 8, 9),
                Combo.of(3, 7, 9),
                Combo.of(4, 6, 9), Combo.of(4, 7, 8),
                Combo.of(5, 6, 8)
            ]);
            expect(combosFn(20, 3)).toEqual([
                Combo.of(3, 8, 9),
                Combo.of(4, 7, 9),
                Combo.of(5, 6, 9), Combo.of(5, 7, 8)
            ]);
            expect(combosFn(21, 3)).toEqual([
                Combo.of(4, 8, 9),
                Combo.of(5, 7, 9),
                Combo.of(6, 7, 8)
            ]);
            expect(combosFn(22, 3)).toEqual([ Combo.of(5, 8, 9), Combo.of(6, 7, 9) ]);
            expect(combosFn(23, 3)).toEqual([ Combo.of(6, 8, 9) ]);
            expect(combosFn(24, 3)).toEqual([ Combo.of(7, 8, 9) ]);
            rangeFromXToMaxSum(25).forEach(sum => {
                expect(combosFn(sum, 3)).toEqual(NO_COMBOS);
            });
        });

        test(`[${combosFn.name}] Number combinations to form a sum out of 4 unique numbers`, () => {
            rangeFromMinSumToX(9).forEach(sum => {
                expect(combosFn(sum, 4)).toEqual(NO_COMBOS);
            });
            expect(combosFn(10, 4)).toEqual([ Combo.of(1, 2, 3, 4) ]);
            expect(combosFn(11, 4)).toEqual([ Combo.of(1, 2, 3, 5) ]);
            expect(combosFn(12, 4)).toEqual([ Combo.of(1, 2, 3, 6), Combo.of(1, 2, 4, 5) ]);
            expect(combosFn(13, 4)).toEqual([
                Combo.of(1, 2, 3, 7), Combo.of(1, 2, 4, 6),
                Combo.of(1, 3, 4, 5)
            ]);
            expect(combosFn(14, 4)).toEqual([
                Combo.of(1, 2, 3, 8), Combo.of(1, 2, 4, 7), Combo.of(1, 2, 5, 6),
                Combo.of(1, 3, 4, 6),
                Combo.of(2, 3, 4, 5)
            ]);
            expect(combosFn(15, 4)).toEqual([
                Combo.of(1, 2, 3, 9), Combo.of(1, 2, 4, 8), Combo.of(1, 2, 5, 7),
                Combo.of(1, 3, 4, 7), Combo.of(1, 3, 5, 6),
                Combo.of(2, 3, 4, 6)
            ]);
            expect(combosFn(16, 4)).toEqual([
                Combo.of(1, 2, 4, 9), Combo.of(1, 2, 5, 8), Combo.of(1, 2, 6, 7),
                Combo.of(1, 3, 4, 8), Combo.of(1, 3, 5, 7),
                Combo.of(1, 4, 5, 6),
                Combo.of(2, 3, 4, 7), Combo.of(2, 3, 5, 6)
            ]);
            expect(combosFn(17, 4)).toEqual([
                Combo.of(1, 2, 5, 9), Combo.of(1, 2, 6, 8),
                Combo.of(1, 3, 4, 9), Combo.of(1, 3, 5, 8), Combo.of(1, 3, 6, 7),
                Combo.of(1, 4, 5, 7),
                Combo.of(2, 3, 4, 8), Combo.of(2, 3, 5, 7),
                Combo.of(2, 4, 5, 6)
            ]);
            expect(combosFn(18, 4)).toEqual([
                Combo.of(1, 2, 6, 9), Combo.of(1, 2, 7, 8),
                Combo.of(1, 3, 5, 9), Combo.of(1, 3, 6, 8),
                Combo.of(1, 4, 5, 8), Combo.of(1, 4, 6, 7),
                Combo.of(2, 3, 4, 9), Combo.of(2, 3, 5, 8), Combo.of(2, 3, 6, 7),
                Combo.of(2, 4, 5, 7),
                Combo.of(3, 4, 5, 6)
            ]);
            expect(combosFn(19, 4)).toEqual([
                Combo.of(1, 2, 7, 9),
                Combo.of(1, 3, 6, 9), Combo.of(1, 3, 7, 8),
                Combo.of(1, 4, 5, 9), Combo.of(1, 4, 6, 8),
                Combo.of(1, 5, 6, 7),
                Combo.of(2, 3, 5, 9), Combo.of(2, 3, 6, 8),
                Combo.of(2, 4, 5, 8), Combo.of(2, 4, 6, 7),
                Combo.of(3, 4, 5, 7)
            ]);
            expect(combosFn(20, 4)).toEqual([
                Combo.of(1, 2, 8, 9),
                Combo.of(1, 3, 7, 9),
                Combo.of(1, 4, 6, 9), Combo.of(1, 4, 7, 8),
                Combo.of(1, 5, 6, 8),
                Combo.of(2, 3, 6, 9), Combo.of(2, 3, 7, 8),
                Combo.of(2, 4, 5, 9), Combo.of(2, 4, 6, 8),
                Combo.of(2, 5, 6, 7),
                Combo.of(3, 4, 5, 8), Combo.of(3, 4, 6, 7)
            ]);
            expect(combosFn(21, 4)).toEqual([
                Combo.of(1, 3, 8, 9),
                Combo.of(1, 4, 7, 9),
                Combo.of(1, 5, 6, 9), Combo.of(1, 5, 7, 8),
                Combo.of(2, 3, 7, 9),
                Combo.of(2, 4, 6, 9), Combo.of(2, 4, 7, 8),
                Combo.of(2, 5, 6, 8),
                Combo.of(3, 4, 5, 9), Combo.of(3, 4, 6, 8),
                Combo.of(3, 5, 6, 7)
            ]);
            expect(combosFn(22, 4)).toEqual([
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
            expect(combosFn(23, 4)).toEqual([
                Combo.of(1, 5, 8, 9),
                Combo.of(1, 6, 7, 9),
                Combo.of(2, 4, 8, 9),
                Combo.of(2, 5, 7, 9),
                Combo.of(2, 6, 7, 8),
                Combo.of(3, 4, 7, 9),
                Combo.of(3, 5, 6, 9), Combo.of(3, 5, 7, 8),
                Combo.of(4, 5, 6, 8)
            ]);
            expect(combosFn(24, 4)).toEqual([
                Combo.of(1, 6, 8, 9),
                Combo.of(2, 5, 8, 9),
                Combo.of(2, 6, 7, 9),
                Combo.of(3, 4, 8, 9),
                Combo.of(3, 5, 7, 9),
                Combo.of(3, 6, 7, 8),
                Combo.of(4, 5, 6, 9), Combo.of(4, 5, 7, 8)
            ]);
            expect(combosFn(25, 4)).toEqual([
                Combo.of(1, 7, 8, 9),
                Combo.of(2, 6, 8, 9),
                Combo.of(3, 5, 8, 9),
                Combo.of(3, 6, 7, 9),
                Combo.of(4, 5, 7, 9),
                Combo.of(4, 6, 7, 8)
            ]);
            expect(combosFn(26, 4)).toEqual([
                Combo.of(2, 7, 8, 9),
                Combo.of(3, 6, 8, 9),
                Combo.of(4, 5, 8, 9),
                Combo.of(4, 6, 7, 9),
                Combo.of(5, 6, 7, 8)
            ]);
            expect(combosFn(27, 4)).toEqual([
                Combo.of(3, 7, 8, 9),
                Combo.of(4, 6, 8, 9),
                Combo.of(5, 6, 7, 9)
            ]);
            expect(combosFn(28, 4)).toEqual([ Combo.of(4, 7, 8, 9), Combo.of(5, 6, 8, 9) ]);
            expect(combosFn(29, 4)).toEqual([ Combo.of(5, 7, 8, 9) ]);
            expect(combosFn(30, 4)).toEqual([ Combo.of(6, 7, 8, 9) ]);
            rangeFromXToMaxSum(31).forEach(sum => {
                expect(combosFn(sum, 4)).toEqual(NO_COMBOS);
            });
        });

        test(`[${combosFn.name}] Number combinations to form a sum out of 5 unique numbers`, () => {
            rangeFromMinSumToX(14).forEach(sum => {
                expect(combosFn(sum, 5)).toEqual(NO_COMBOS);
            });
            expect(combosFn(15, 5)).toEqual([ Combo.of(1, 2, 3, 4, 5) ]);
            expect(combosFn(16, 5)).toEqual([ Combo.of(1, 2, 3, 4, 6) ]);
            expect(combosFn(17, 5)).toEqual([ Combo.of(1, 2, 3, 4, 7), Combo.of(1, 2, 3, 5, 6) ]);
            expect(combosFn(18, 5)).toEqual([
                Combo.of(1, 2, 3, 4, 8), Combo.of(1, 2, 3, 5, 7),
                Combo.of(1, 2, 4, 5, 6)
            ]);
            expect(combosFn(19, 5)).toEqual([
                Combo.of(1, 2, 3, 4, 9), Combo.of(1, 2, 3, 5, 8), Combo.of(1, 2, 3, 6, 7),
                Combo.of(1, 2, 4, 5, 7),
                Combo.of(1, 3, 4, 5, 6)
            ]);
            expect(combosFn(20, 5)).toEqual([
                Combo.of(1, 2, 3, 5, 9), Combo.of(1, 2, 3, 6, 8),
                Combo.of(1, 2, 4, 5, 8), Combo.of(1, 2, 4, 6, 7),
                Combo.of(1, 3, 4, 5, 7),
                Combo.of(2, 3, 4, 5, 6)
            ]);
            expect(combosFn(21, 5)).toEqual([
                Combo.of(1, 2, 3, 6, 9), Combo.of(1, 2, 3, 7, 8),
                Combo.of(1, 2, 4, 5, 9), Combo.of(1, 2, 4, 6, 8),
                Combo.of(1, 2, 5, 6, 7),
                Combo.of(1, 3, 4, 5, 8), Combo.of(1, 3, 4, 6, 7),
                Combo.of(2, 3, 4, 5, 7)
            ]);
            expect(combosFn(22, 5)).toEqual([
                Combo.of(1, 2, 3, 7, 9),
                Combo.of(1, 2, 4, 6, 9), Combo.of(1, 2, 4, 7, 8),
                Combo.of(1, 2, 5, 6, 8),
                Combo.of(1, 3, 4, 5, 9), Combo.of(1, 3, 4, 6, 8),
                Combo.of(1, 3, 5, 6, 7),
                Combo.of(2, 3, 4, 5, 8), Combo.of(2, 3, 4, 6, 7)
            ]);
            expect(combosFn(23, 5)).toEqual([
                Combo.of(1, 2, 3, 8, 9),
                Combo.of(1, 2, 4, 7, 9),
                Combo.of(1, 2, 5, 6, 9), Combo.of(1, 2, 5, 7, 8),
                Combo.of(1, 3, 4, 6, 9), Combo.of(1, 3, 4, 7, 8),
                Combo.of(1, 3, 5, 6, 8),
                Combo.of(1, 4, 5, 6, 7),
                Combo.of(2, 3, 4, 5, 9), Combo.of(2, 3, 4, 6, 8),
                Combo.of(2, 3, 5, 6, 7)
            ]);
            expect(combosFn(24, 5)).toEqual([
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
            expect(combosFn(25, 5)).toEqual([
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
            expect(combosFn(26, 5)).toEqual([
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
            expect(combosFn(27, 5)).toEqual([
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
            expect(combosFn(28, 5)).toEqual([
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
            expect(combosFn(29, 5)).toEqual([
                Combo.of(1, 4, 7, 8, 9),
                Combo.of(1, 5, 6, 8, 9),
                Combo.of(2, 3, 7, 8, 9),
                Combo.of(2, 4, 6, 8, 9),
                Combo.of(2, 5, 6, 7, 9),
                Combo.of(3, 4, 5, 8, 9),
                Combo.of(3, 4, 6, 7, 9),
                Combo.of(3, 5, 6, 7, 8)
            ]);
            expect(combosFn(30, 5)).toEqual([
                Combo.of(1, 5, 7, 8, 9),
                Combo.of(2, 4, 7, 8, 9),
                Combo.of(2, 5, 6, 8, 9),
                Combo.of(3, 4, 6, 8, 9),
                Combo.of(3, 5, 6, 7, 9),
                Combo.of(4, 5, 6, 7, 8)
            ]);
            expect(combosFn(31, 5)).toEqual([
                Combo.of(1, 6, 7, 8, 9),
                Combo.of(2, 5, 7, 8, 9),
                Combo.of(3, 4, 7, 8, 9),
                Combo.of(3, 5, 6, 8, 9),
                Combo.of(4, 5, 6, 7, 9)
            ]);
            expect(combosFn(32, 5)).toEqual([
                Combo.of(2, 6, 7, 8, 9),
                Combo.of(3, 5, 7, 8, 9),
                Combo.of(4, 5, 6, 8, 9)
            ]);
            expect(combosFn(33, 5)).toEqual([ Combo.of(3, 6, 7, 8, 9), Combo.of(4, 5, 7, 8, 9) ]);
            expect(combosFn(34, 5)).toEqual([ Combo.of(4, 6, 7, 8, 9) ]);
            expect(combosFn(35, 5)).toEqual([ Combo.of(5, 6, 7, 8, 9) ]);
            rangeFromXToMaxSum(36).forEach(sum => {
                expect(combosFn(sum, 5)).toEqual(NO_COMBOS);
            });
        });

        test(`[${combosFn.name}] Number combinations to form a sum out of 6 unique numbers`, () => {
            rangeFromMinSumToX(20).forEach(sum => {
                expect(combosFn(sum, 6)).toEqual(NO_COMBOS);
            });
            expect(combosFn(21, 6)).toEqual([ Combo.of(1, 2, 3, 4, 5, 6) ]);
            expect(combosFn(22, 6)).toEqual([ Combo.of(1, 2, 3, 4, 5, 7) ]);
            expect(combosFn(23, 6)).toEqual([ Combo.of(1, 2, 3, 4, 5, 8), Combo.of(1, 2, 3, 4, 6, 7) ]);
            expect(combosFn(24, 6)).toEqual([
                Combo.of(1, 2, 3, 4, 5, 9), Combo.of(1, 2, 3, 4, 6, 8), Combo.of(1, 2, 3, 5, 6, 7)
            ]);
            expect(combosFn(25, 6)).toEqual([
                Combo.of(1, 2, 3, 4, 6, 9), Combo.of(1, 2, 3, 4, 7, 8), Combo.of(1, 2, 3, 5, 6, 8),
                Combo.of(1, 2, 4, 5, 6, 7)
            ]);
            expect(combosFn(26, 6)).toEqual([
                Combo.of(1, 2, 3, 4, 7, 9), Combo.of(1, 2, 3, 5, 6, 9), Combo.of(1, 2, 3, 5, 7, 8),
                Combo.of(1, 2, 4, 5, 6, 8), Combo.of(1, 3, 4, 5, 6, 7)
            ]);
            expect(combosFn(27, 6)).toEqual([
                Combo.of(1, 2, 3, 4, 8, 9), Combo.of(1, 2, 3, 5, 7, 9), Combo.of(1, 2, 3, 6, 7, 8),
                Combo.of(1, 2, 4, 5, 6, 9), Combo.of(1, 2, 4, 5, 7, 8),
                Combo.of(1, 3, 4, 5, 6, 8),
                Combo.of(2, 3, 4, 5, 6, 7)
            ]);
            expect(combosFn(28, 6)).toEqual([
                Combo.of(1, 2, 3, 5, 8, 9), Combo.of(1, 2, 3, 6, 7, 9),
                Combo.of(1, 2, 4, 5, 7, 9), Combo.of(1, 2, 4, 6, 7, 8),
                Combo.of(1, 3, 4, 5, 6, 9), Combo.of(1, 3, 4, 5, 7, 8),
                Combo.of(2, 3, 4, 5, 6, 8)
            ]);
            expect(combosFn(29, 6)).toEqual([
                Combo.of(1, 2, 3, 6, 8, 9),
                Combo.of(1, 2, 4, 5, 8, 9), Combo.of(1, 2, 4, 6, 7, 9),
                Combo.of(1, 2, 5, 6, 7, 8),
                Combo.of(1, 3, 4, 5, 7, 9), Combo.of(1, 3, 4, 6, 7, 8),
                Combo.of(2, 3, 4, 5, 6, 9), Combo.of(2, 3, 4, 5, 7, 8)
            ]);
            expect(combosFn(30, 6)).toEqual([
                Combo.of(1, 2, 3, 7, 8, 9),
                Combo.of(1, 2, 4, 6, 8, 9),
                Combo.of(1, 2, 5, 6, 7, 9),
                Combo.of(1, 3, 4, 5, 8, 9), Combo.of(1, 3, 4, 6, 7, 9),
                Combo.of(1, 3, 5, 6, 7, 8),
                Combo.of(2, 3, 4, 5, 7, 9), Combo.of(2, 3, 4, 6, 7, 8)
            ]);
            expect(combosFn(31, 6)).toEqual([
                Combo.of(1, 2, 4, 7, 8, 9),
                Combo.of(1, 2, 5, 6, 8, 9),
                Combo.of(1, 3, 4, 6, 8, 9),
                Combo.of(1, 3, 5, 6, 7, 9),
                Combo.of(1, 4, 5, 6, 7, 8),
                Combo.of(2, 3, 4, 5, 8, 9), Combo.of(2, 3, 4, 6, 7, 9),
                Combo.of(2, 3, 5, 6, 7, 8)
            ]);
            expect(combosFn(32, 6)).toEqual([
                Combo.of(1, 2, 5, 7, 8, 9),
                Combo.of(1, 3, 4, 7, 8, 9),
                Combo.of(1, 3, 5, 6, 8, 9),
                Combo.of(1, 4, 5, 6, 7, 9),
                Combo.of(2, 3, 4, 6, 8, 9),
                Combo.of(2, 3, 5, 6, 7, 9),
                Combo.of(2, 4, 5, 6, 7, 8)
            ]);
            expect(combosFn(33, 6)).toEqual([
                Combo.of(1, 2, 6, 7, 8, 9),
                Combo.of(1, 3, 5, 7, 8, 9),
                Combo.of(1, 4, 5, 6, 8, 9),
                Combo.of(2, 3, 4, 7, 8, 9),
                Combo.of(2, 3, 5, 6, 8, 9),
                Combo.of(2, 4, 5, 6, 7, 9),
                Combo.of(3, 4, 5, 6, 7, 8)
            ]);
            expect(combosFn(34, 6)).toEqual([
                Combo.of(1, 3, 6, 7, 8, 9),
                Combo.of(1, 4, 5, 7, 8, 9),
                Combo.of(2, 3, 5, 7, 8, 9),
                Combo.of(2, 4, 5, 6, 8, 9),
                Combo.of(3, 4, 5, 6, 7, 9)
            ]);
            expect(combosFn(35, 6)).toEqual([
                Combo.of(1, 4, 6, 7, 8, 9),
                Combo.of(2, 3, 6, 7, 8, 9),
                Combo.of(2, 4, 5, 7, 8, 9),
                Combo.of(3, 4, 5, 6, 8, 9)
            ]);
            expect(combosFn(36, 6)).toEqual([
                Combo.of(1, 5, 6, 7, 8, 9),
                Combo.of(2, 4, 6, 7, 8, 9),
                Combo.of(3, 4, 5, 7, 8, 9)
            ]);
            expect(combosFn(37, 6)).toEqual([ Combo.of(2, 5, 6, 7, 8, 9), Combo.of(3, 4, 6, 7, 8, 9) ]);
            expect(combosFn(38, 6)).toEqual([ Combo.of(3, 5, 6, 7, 8, 9) ]);
            expect(combosFn(39, 6)).toEqual([ Combo.of(4, 5, 6, 7, 8, 9) ]);
            rangeFromXToMaxSum(40).forEach(sum => {
                expect(combosFn(sum, 6)).toEqual(NO_COMBOS);
            });
        });

        test(`[${combosFn.name}] Number combinations to form a sum out of 7 unique numbers`, () => {
            rangeFromMinSumToX(27).forEach(sum => {
                expect(combosFn(sum, 7)).toEqual(NO_COMBOS);
            });
            expect(combosFn(28, 7)).toEqual([ Combo.of(1, 2, 3, 4, 5, 6, 7) ]);
            expect(combosFn(29, 7)).toEqual([ Combo.of(1, 2, 3, 4, 5, 6, 8) ]);
            expect(combosFn(30, 7)).toEqual([ Combo.of(1, 2, 3, 4, 5, 6, 9), Combo.of(1, 2, 3, 4, 5, 7, 8) ]);
            expect(combosFn(31, 7)).toEqual([ Combo.of(1, 2, 3, 4, 5, 7, 9), Combo.of(1, 2, 3, 4, 6, 7, 8) ]);
            expect(combosFn(32, 7)).toEqual([
                Combo.of(1, 2, 3, 4, 5, 8, 9), Combo.of(1, 2, 3, 4, 6, 7, 9), Combo.of(1, 2, 3, 5, 6, 7, 8)
            ]);
            expect(combosFn(33, 7)).toEqual([
                Combo.of(1, 2, 3, 4, 6, 8, 9), Combo.of(1, 2, 3, 5, 6, 7, 9),
                Combo.of(1, 2, 4, 5, 6, 7, 8)
            ]);
            expect(combosFn(34, 7)).toEqual([
                Combo.of(1, 2, 3, 4, 7, 8, 9), Combo.of(1, 2, 3, 5, 6, 8, 9),
                Combo.of(1, 2, 4, 5, 6, 7, 9),
                Combo.of(1, 3, 4, 5, 6, 7, 8)
            ]);
            expect(combosFn(35, 7)).toEqual([
                Combo.of(1, 2, 3, 5, 7, 8, 9),
                Combo.of(1, 2, 4, 5, 6, 8, 9),
                Combo.of(1, 3, 4, 5, 6, 7, 9),
                Combo.of(2, 3, 4, 5, 6, 7, 8)
            ]);
            expect(combosFn(36, 7)).toEqual([
                Combo.of(1, 2, 3, 6, 7, 8, 9),
                Combo.of(1, 2, 4, 5, 7, 8, 9),
                Combo.of(1, 3, 4, 5, 6, 8, 9),
                Combo.of(2, 3, 4, 5, 6, 7, 9)
            ]);
            expect(combosFn(36, 7)).toEqual([
                Combo.of(1, 2, 3, 6, 7, 8, 9),
                Combo.of(1, 2, 4, 5, 7, 8, 9),
                Combo.of(1, 3, 4, 5, 6, 8, 9),
                Combo.of(2, 3, 4, 5, 6, 7, 9)
            ]);
            expect(combosFn(37, 7)).toEqual([
                Combo.of(1, 2, 4, 6, 7, 8, 9),
                Combo.of(1, 3, 4, 5, 7, 8, 9),
                Combo.of(2, 3, 4, 5, 6, 8, 9)
            ]);
            expect(combosFn(38, 7)).toEqual([
                Combo.of(1, 2, 5, 6, 7, 8, 9),
                Combo.of(1, 3, 4, 6, 7, 8, 9),
                Combo.of(2, 3, 4, 5, 7, 8, 9)
            ]);
            expect(combosFn(39, 7)).toEqual([ Combo.of(1, 3, 5, 6, 7, 8, 9), Combo.of(2, 3, 4, 6, 7, 8, 9) ]);
            expect(combosFn(40, 7)).toEqual([ Combo.of(1, 4, 5, 6, 7, 8, 9), Combo.of(2, 3, 5, 6, 7, 8, 9) ]);
            expect(combosFn(41, 7)).toEqual([ Combo.of(2, 4, 5, 6, 7, 8, 9) ]);
            expect(combosFn(42, 7)).toEqual([ Combo.of(3, 4, 5, 6, 7, 8, 9) ]);
            rangeFromXToMaxSum(43).forEach(sum => {
                expect(combosFn(sum, 7)).toEqual(NO_COMBOS);
            });
        });

        test(`[${combosFn.name}] Number combinations to form a sum out of 8 unique numbers`, () => {
            rangeFromMinSumToX(35).forEach(sum => {
                expect(combosFn(sum, 8)).toEqual(NO_COMBOS);
            });
            expect(combosFn(36, 8)).toEqual([ Combo.of(1, 2, 3, 4, 5, 6, 7, 8) ]);
            expect(combosFn(37, 8)).toEqual([ Combo.of(1, 2, 3, 4, 5, 6, 7, 9) ]);
            expect(combosFn(38, 8)).toEqual([ Combo.of(1, 2, 3, 4, 5, 6, 8, 9) ]);
            expect(combosFn(39, 8)).toEqual([ Combo.of(1, 2, 3, 4, 5, 7, 8, 9) ]);
            expect(combosFn(40, 8)).toEqual([ Combo.of(1, 2, 3, 4, 6, 7, 8, 9) ]);
            expect(combosFn(41, 8)).toEqual([ Combo.of(1, 2, 3, 5, 6, 7, 8, 9) ]);
            expect(combosFn(42, 8)).toEqual([ Combo.of(1, 2, 4, 5, 6, 7, 8, 9) ]);
            expect(combosFn(43, 8)).toEqual([ Combo.of(1, 3, 4, 5, 6, 7, 8, 9) ]);
            expect(combosFn(44, 8)).toEqual([ Combo.of(2, 3, 4, 5, 6, 7, 8, 9) ]);
            expect(combosFn(45, 8)).toEqual(NO_COMBOS);
        });

        test(`[${combosFn.name}] Number combinations to form a sum out of 9 unique numbers`, () => {
            rangeFromMinSumToX(44).forEach(sum => {
                expect(combosFn(sum, 9)).toEqual(NO_COMBOS);
            });
            expect(combosFn(45, 9)).toEqual([ Combo.of(1, 2, 3, 4, 5, 6, 7, 8, 9) ]);
        });

        test(`[${combosFn.name}] Invalid sum with value outside of range: <1`, () => {
            expect(() => combosFn(0, 2)).toThrow('Invalid sum. Value outside of range. Expected to be within [1, 45]. Actual: 0');
        });

        test(`[${combosFn.name}] Invalid sum with value outside of range: >45`, () => {
            expect(() => combosFn(46, 9)).toThrow('Invalid sum. Value outside of range. Expected to be within [1, 45]. Actual: 46');
        });

        test(`[${combosFn.name}] Invalid number count with value outside of range: <1`, () => {
            expect(() => combosFn(3, 0)).toThrow('Invalid number count. Value outside of range. Expected to be within [1, 9]. Actual: 0');
        });

        test(`[${combosFn.name}] Invalid number count with value outside of range: >9`, () => {
            expect(() => combosFn(45, 10)).toThrow('Invalid number count. Value outside of range. Expected to be within [1, 9]. Actual: 10');
        });
    });

    const rangeFromMinSumToX = (x: number) => {
        return _.range(Numbers.MIN, x + 1);
    };

    const rangeFromXToMaxSum = (x: number) => {
        return _.range(x, House.SUM + 1);
    };

    const NO_COMBOS: ReadonlyCombos = [];
});
