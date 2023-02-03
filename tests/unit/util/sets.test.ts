import { Sets } from '../../../src/util/sets';

describe('Sets tests', () => {
    // test('Addition/removal of individual elements and collections', () => {
    //     const set = new Set<number>();

    //     expectSetWithValues(set, []);
    //     expect(() => set.first).toThrow(new RangeError('Can\'t get first element. MutableSet has no values'));

    //     set.add(1);
    //     set.add(2);
    //     expect(set.addCollection([ 1, 3, 4 ])).toBe(set);

    //     expectSetWithValues(set, [ 1, 2, 3, 4 ]);
    //     expect(set.first).toBe(1);
    //     expect(set.has(5)).toBeFalsy();

    //     set.delete(2);
    //     expect(set.deleteCollection([ 1, 4 ])).toBe(set);

    //     expectSetWithValues(set, [ 3 ]);
    //     expect(set.first).toBe(3);
    // });

    // test('Construction of MutableSet from `Iterable`', () => {
    //     const set = new Set([ 3, 2, 1 ]);

    //     expectSetWithValues(set, [ 3, 2, 1 ]);
    //     expect(set.first).toBe(3);
    // });

    // test('Construction of MutableSet using `of` static factory method', () => {
    //     const set = SetUtils.of(3, 2, 1);

    //     expectSetWithValues(set, [ 3, 2, 1 ]);
    //     expect(set.first).toBe(3);
    // });

    // test('Construction of empty MutableSet', () => {
    //     expectSetWithValues(new Set([]), []);
    //     expectSetWithValues(SetUtils.of(), []);
    // });

    test('Clearing', () => {
        const set = Sets.new(3, 2, 1);

        set.clear();
        expectSetWithValues(set, []);
        expect(() => Sets.firstValue(set)).toThrow(new RangeError('Can\'t get first element. Set has no values'));
    });

    const expectSetWithValues = <T>(set: Set<T>, values: ReadonlyArray<T>) => {
        expect(set.size).toBe(values.length);

        expect(Array.from(set)).toEqual(values);
        expect(Array.from(set.keys())).toEqual(values);
        expect(Array.from(set.values())).toEqual(values);
        expect(Array.from(set.entries())).toEqual(values.map(val => [ val, val ]));

        for (const el of values) {
            expect(set.has(el)).toBeTruthy();
        }

        const collectedViaForEach = new Array<T>();
        const collector = (val: T) => {
            collectedViaForEach.push(val);
        };
        set.forEach(collector);
        expect(collectedViaForEach).toEqual(values);

        const collectedViaForOf = new Array<T>();
        for (const val of set) {
            collectedViaForOf.push(val);
        }
        expect(collectedViaForOf).toEqual(values);
    };
});
