import { joinArray, joinSet } from '../../../src/util/readableMessages';

describe('Readable messages util tests', () => {
    test('Join array', async () => {
        expect(joinArray(['a', 1, true])).toBe('a, 1, true');
    });

    test('Join set', async () => {
        expect(joinSet(new Set(['a', 1, true]))).toBe('a, 1, true');
    });
});
