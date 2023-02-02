import { joinArray, joinSet } from '../../../src/util/readableMessages';
import { RichSet } from '../../../src/util/richSet';

describe('Readable messages util tests', () => {
    test('Join array', () => {
        expect(joinArray([ 'a', 1, true ])).toBe('a, 1, true');
    });

    test('Join set', () => {
        expect(joinSet(new RichSet([ 'a', 1, true ]))).toBe('a, 1, true');
    });
});
