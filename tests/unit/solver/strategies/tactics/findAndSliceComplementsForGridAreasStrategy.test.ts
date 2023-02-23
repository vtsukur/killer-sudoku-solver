import { Puzzle } from '../../../../../src/puzzle/puzzle';
import { MasterModel } from '../../../../../src/solver/models/masterModel';
import { Context } from '../../../../../src/solver/strategies/context';
import { Strategy } from '../../../../../src/solver/strategies/strategy';
import { FindAndSliceComplementsForGridAreasStrategy } from '../../../../../src/solver/strategies/tactics/findAndSliceComplementsForGridAreasStrategy';
import { FindRedundantNonetSumsStrategy } from '../../../../../src/solver/strategies/tactics/findRedundantNonetSumsStrategy';
import { CageSlicer } from '../../../../../src/solver/transform/cageSlicer';
import { puzzleSamples } from '../../../puzzle/puzzleSamples';

describe('Unit tests for `FindAndSliceComplementsForGridAreasStrategy`', () => {
    test('Applying strategy to Daily Challenge (2022-10-22) by Sudoku.com', () => {
        const context = newContext(puzzleSamples.sudokuDotCom.dailyChallengeOf_2022_10_22);

        runSetUpStrategies(new FindRedundantNonetSumsStrategy(context));
        const strategy = new FindAndSliceComplementsForGridAreasStrategy(context);
        strategy.execute();
    });

    const newContext = (puzzle: Puzzle) => {
        const masterModel = new MasterModel(puzzle);
        const cageSlider = new CageSlicer(masterModel);
        return new Context(masterModel, cageSlider);
    };

    const runSetUpStrategies = (...strategies: ReadonlyArray<Strategy>) => {
        for (const strategy of strategies) {
            strategy.execute();
        }
    };
});
