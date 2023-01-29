import { InvalidSolverStateError } from '../../../src/solver/invalidSolverStateError';

describe('InvalidSolverStepError tests', () => {
    test('Construction of InvalidSolverStepError storing message', () => {
        expect(new InvalidSolverStateError('problem running solver').message).toBe('problem running solver');
    });
});
