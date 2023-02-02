import { MutableSet } from '../../../src/util/mutableSet';
import { joinArray, joinSet } from '../../../src/util/readableMessages';

describe('Readable messages util tests', () => {
    test('Join array', () => {
        expect(joinArray([ 'a', 1, true ])).toBe('a, 1, true');
    });

    test('Join set', () => {
        expect(joinSet(new MutableSet([ 'a', 1, true ]))).toBe('a, 1, true');
    });
});
