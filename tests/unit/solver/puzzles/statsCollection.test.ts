import { Solver } from '../../../../src/solver/solver';
import { FindAndSliceComplementsForGridAreasStrategy } from '../../../../src/solver/strategies/tactics/findAndSliceComplementsForGridAreasStrategy';
import { puzzleSamples } from '../../puzzle/puzzleSamples';

describe('Stats collection', () => {
    test('Collect stats for `FindAndSliceComplementsForGridAreasStrategy`', () => {
        const solver = new Solver();
        for (const puzzle of puzzleSamples.allPuzzles) {
            solver.solve(puzzle);
        }

        console.log(FindAndSliceComplementsForGridAreasStrategy.STATS.data);
        console.log(FindAndSliceComplementsForGridAreasStrategy.STATS.totalCagesFound);
    });
});
