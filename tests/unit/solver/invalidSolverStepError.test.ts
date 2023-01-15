import { InvalidSolverStepError } from '../../../src/solver/invalidSolverStateError';

describe('InvalidSolverStepError tests', () => {
    test('Construction of InvalidSolverStepError storing message', () => {
        expect(new InvalidSolverStepError('problem running solver').message).toBe('problem running solver');
    });
});
