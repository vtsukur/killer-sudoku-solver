import { Combo } from '../../../../src/solver/math';
import { SudokuNumsSet } from '../../../../src/solver/sets';

describe('`Combo` tests', () => {

    test('Referencing `Combo`s by number\'s bits', () => {
        const TOTAL_INDICES_COUNT = 1024;

        expect(Combo.BY_NUMS_BITS.length).toBe(TOTAL_INDICES_COUNT);

        let i = 0;
        while (i < TOTAL_INDICES_COUNT) {
            const combo = Combo.BY_NUMS_BITS[i];

            if (i === 0 || i & 1) {
                expect(combo).toBe(undefined);
            } else {
                const expectedNums = new Array<number>();
                for (const num of SudokuNumsSet.NUM_RANGE) {
                    if (i & (1 << num)) {
                        expectedNums.push(num);
                    }
                }

                expect(combo.nums).toEqual(expectedNums);
                expect(combo.numsBits).toBe(i);
            }

            ++i;
        }
    });

    test('Construction of Combo using `of` static factory method', () => {
        const combo = Combo.of(1, 6, 9);
        expect(combo.numsSet.hasAll(SudokuNumsSet.of(1, 6, 9))).toBeTruthy();
        expect(combo.numsSet.doesNotHaveAny(SudokuNumsSet.of(2, 5))).toBeTruthy();
        expect(combo.numsSet.doesNotHaveAny(SudokuNumsSet.of(1, 5, 6))).toBeFalsy();
        expectComboWithValues(combo, [ 1, 6, 9 ]);
    });

    test('Accessing number fields for Combo with 1 element', () => {
        const combo = Combo.ofOne(1);
        expect(combo.number1).toBe(1);
        expect(combo.nthNumber(0)).toBe(1);
        expect(combo.number2).toBe(0);
        expect(() => combo.nthNumber(1)).toThrow(new RangeError('Number of index 1 cannot be accessed. Combo has 1 element(s)'));
        expect(combo.number3).toBe(0);
        expect(() => combo.nthNumber(2)).toThrow(new RangeError('Number of index 2 cannot be accessed. Combo has 1 element(s)'));
    });

    test('Accessing number fields for Combo with 2 elements', () => {
        const combo = Combo.of(1, 6);
        expect(combo.number1).toBe(1);
        expect(combo.nthNumber(0)).toBe(1);
        expect(combo.number2).toBe(6);
        expect(combo.nthNumber(1)).toBe(6);
        expect(combo.number3).toBe(0);
        expect(() => combo.nthNumber(2)).toThrow(new RangeError('Number of index 2 cannot be accessed. Combo has 2 element(s)'));
    });

    test('Accessing number fields for Combo with 3 elements', () => {
        const combo = Combo.of(1, 6, 9);
        expect(combo.number1).toBe(1);
        expect(combo.nthNumber(0)).toBe(1);
        expect(combo.number2).toBe(6);
        expect(combo.nthNumber(1)).toBe(6);
        expect(combo.number3).toBe(9);
        expect(combo.nthNumber(2)).toBe(9);
        expect(() => combo.nthNumber(3)).toThrow(new RangeError('Number of index 3 cannot be accessed. Combo has 3 element(s)'));
    });

    test('Construction of empty Combo is *not* allowed', () => {
        expect(() => Combo.of()).toThrow(new RangeError('Combo should have at least 1 number'));
    });

    test('Reduction of Combo with removal of the number', () => {
        const combo = Combo.of(1, 6, 9);
        const reducedCombo = combo.reduce(6);
        expect(reducedCombo).toEqual(Combo.of(1, 9));
        expect(reducedCombo).not.toBe(combo);
        expectComboWithValues(combo, [ 1, 6, 9 ]);
    });

    test('Reduction of Combo without removal of the number', () => {
        const combo = Combo.of(1, 6, 9);
        const reducedCombo = combo.reduce(8);
        expect(reducedCombo).toEqual(combo);
    });

    const expectComboWithValues = (combo: Combo, values: ReadonlyArray<number>) => {
        expect(Array.from(combo)).toEqual(values);

        for (const val of values) {
            expect(combo.has(val)).toBeTruthy();
        }

        const collectedViaForOf = new Array<number>();
        for (const val of combo) {
            collectedViaForOf.push(val);
        }
        expect(collectedViaForOf).toEqual(values);
    };
});
