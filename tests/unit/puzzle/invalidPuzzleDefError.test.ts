import { InvalidPuzzleDefError } from '../../../src/puzzle/invalidPuzzleDefError';

describe('InvalidPuzzleDefError tests', () => {
    test('Construction of InvalidPuzzleDefError storing message', () => {
        expect(new InvalidPuzzleDefError('invalid puzzle').message).toBe('invalid puzzle');
    });
});
