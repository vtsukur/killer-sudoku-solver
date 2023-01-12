import { joinForReadability } from '../../../src/util/readableMessages';

describe('Readable messages util tests', () => {
    test('Join array for readability', async () => {
        expect(joinForReadability(['a', 1, true])).toBe('a, 1, true');
    });
});
