import { MutableSet } from '../../../src/util/mutableSet';

describe('MutableSet tests', () => {
    test('Adding/removing individual elements and collections to/from the set', () => {
        const set = new MutableSet<number>();

        expectSetWithValues(set, []);
        expect(() => set.first).toThrow(new Error('Can\'t get first element: MutableSet has no values'));

        set.add(1);
        set.add(2);
        expect(set.addCollection([ 1, 3, 4 ])).toBe(set);

        expectSetWithValues(set, [ 1, 2, 3, 4 ]);
        expect(set.first).toBe(1);
        expect(set.has(5)).toBeFalsy();

        set.delete(2);
        expect(set.deleteCollection([ 1, 4 ])).toBe(set);

        expectSetWithValues(set, [ 3 ]);
        expect(set.first).toBe(3);
    });

    test('Constructing set from Iterable', () => {
        const set = MutableSet.of(3, 2, 1);

        expectSetWithValues(set, [ 3, 2, 1 ]);
        expect(set.first).toBe(3);
    });

    test('Constructing set from `rest` elements', () => {
        const set = new MutableSet([ 3, 2, 1 ]);

        expectSetWithValues(set, [ 3, 2, 1 ]);
        expect(set.first).toBe(3);
    });

    test('Clearing set', () => {
        const set = MutableSet.of(3, 2, 1);

        set.clear();
        expectSetWithValues(set, []);
        expect(() => set.first).toThrow(new Error('Can\'t get first element: MutableSet has no values'));
    });

    const expectSetWithValues = <T>(set: MutableSet<T>, values: ReadonlyArray<T>) => {
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
