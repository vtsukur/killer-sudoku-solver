import { InstructToReduceAllCagesStrategy } from '../../../../../src/solver/strategies/tactics/instructToReduceAllCagesStrategy';
import { puzzleSamples } from '../../../puzzle/puzzleSamples';
import { newContext } from './init/builders';

describe('Unit tests for `InstructToReduceAllCagesStrategy`', () => {

    test('Applying `Strategy`', () => {
        // Given:
        const context = newContext(puzzleSamples.sudokuDotCom.dailyChallengeOf_2022_11_01);
        expect(context.hasCageModelsToReduce).toBeFalsy();

        // When:
        new InstructToReduceAllCagesStrategy(context).execute();

        // Then:
        expect(context.hasCageModelsToReduce).toBeTruthy();
        expect(context.cageModelsToReduce).toEqual(new Set(context.model.cageModelsMap.values()));
    });

});
