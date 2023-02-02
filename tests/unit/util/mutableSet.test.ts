import { MutableSet } from '../../../src/util/mutableSet';

describe('MutableSet tests', () => {
    test('Addition/removal of individual elements and collections', () => {
        const set = new MutableSet<number>();

        expectSetWithValues(set, []);
        expect(() => set.first).toThrow(new RangeError('Can\'t get first element. MutableSet has no values'));

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

    test('Construction of MutableSet from `Iterable`', () => {
        const set = new MutableSet([ 3, 2, 1 ]);

        expectSetWithValues(set, [ 3, 2, 1 ]);
        expect(set.first).toBe(3);
    });

    test('Construction of MutableSet using `of` static factory method', () => {
        const set = MutableSet.of(3, 2, 1);

        expectSetWithValues(set, [ 3, 2, 1 ]);
        expect(set.first).toBe(3);
    });

    test('Construction of empty MutableSet', () => {
        expectSetWithValues(new MutableSet([]), []);
        expectSetWithValues(MutableSet.of(), []);
    });

    test('Clearing', () => {
        const set = MutableSet.of(3, 2, 1);

        set.clear();
        expectSetWithValues(set, []);
        expect(() => set.first).toThrow(new RangeError('Can\'t get first element. MutableSet has no values'));
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
