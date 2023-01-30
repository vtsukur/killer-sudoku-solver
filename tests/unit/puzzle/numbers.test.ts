import { Numbers } from '../../../src/puzzle/numbers';

describe('Numbers tests', () => {
    test('Maximum number in the Cell is 9', () => {
        expect(Numbers.MAX).toEqual(9);
    });
});
