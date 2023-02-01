import { CombinatorialError } from '../../../../src/solver/combinatorial';

describe('CombinatorialError tests', () => {
    test('Construction of CombinatorialError storing message', () => {
        expect(new CombinatorialError('invalid sum or num count').message).toBe('invalid sum or num count');
    });
});
