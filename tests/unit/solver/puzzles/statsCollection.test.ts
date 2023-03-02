import { Solver } from '../../../../src/solver/solver';
import { FindComplementCagesStrategy } from '../../../../src/solver/strategies/tactics/findComplementCagesStrategy';
import { puzzleSamples } from '../../puzzle/puzzleSamples';

describe('Stats collection', () => {
    test.skip('Collect `FindComplementCagesStrategy` stats for all known `Puzzle`s', () => {
        const solver = new Solver();
        for (const puzzle of puzzleSamples.allPuzzles) {
            solver.solve(puzzle);
        }

        console.log(FindComplementCagesStrategy.STATS.data);
        console.log(FindComplementCagesStrategy.STATS.totalCagesFound);
    });
});
