import { Sets } from '../../../src/util/sets';

describe('Sets tests', () => {
    test('Construction of Set using `new` static factory method', () => {
        expect(Sets.new(3, 2, 1)).toEqual(new Set([ 3, 2, 1 ]));
    });

    test('Adding `Iterable` values to the Set', () => {
        const set = new Set<number>();

        set.add(1);
        expect(Sets.U(set, [ 2, 3 ])).toBe(set);
        Sets.U(set, [ 4, 5 ]);

        expect(set).toEqual(new Set([ 1, 2, 3, 4, 5 ]));
    });

    test('Removing `Iterable` values from the Set', () => {
        const set = new Set<number>([ 1, 2, 3, 4, 5 ]);

        expect(Sets._(set, [ 2, 3 ])).toBe(set);

        expect(set).toEqual(new Set([ 1, 4, 5 ]));
    });

    test('Getting first value from the non-empty Set', () => {
        expect(Sets.firstValue(new Set<number>([ 1, 2, 3, 4, 5 ]))).toBe(1);
    });

    test('Getting first value from the empty Set', () => {
        expect(() => Sets.firstValue(new Set())).toThrow(new RangeError('Can\'t get first value. Set has no values'));
    });
});
