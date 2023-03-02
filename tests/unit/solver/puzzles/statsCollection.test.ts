import { Solver } from '../../../../src/solver/solver';
import { FindComplementingCagesStrategy } from '../../../../src/solver/strategies/tactics/findComplementingCagesStrategy';
import { puzzleSamples } from '../../puzzle/puzzleSamples';

describe('Stats collection', () => {
    test.skip('Collect `FindComplementingCagesStrategy` stats for all known `Puzzle`s', () => {
        const solver = new Solver();
        for (const puzzle of puzzleSamples.allPuzzles) {
            solver.solve(puzzle);
        }

        console.log(FindComplementingCagesStrategy.STATS.data);
        console.log(FindComplementingCagesStrategy.STATS.totalCagesFound);
    });
});
