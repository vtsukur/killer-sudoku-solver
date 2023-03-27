import { Puzzle } from '../puzzle/puzzle';
import { Solution } from '../puzzle/solution';
import { MasterModel } from './models/masterModel';
import { Context } from './strategies/context';
import { MasterStrategy } from './strategies/masterStrategy';
import { NumsReduction } from './strategies/numsReduction';

/**
 * `Solver` for Killer Sudoku `Puzzle`.
 *
 * @public
 */
export class Solver {

    /**
     * Solves the given Killer Sudoku `Puzzle`.
     *
     * @param puzzle - Problem definition for Killer Sudoku `Puzzle` described by {@link Cage}s.
     *
     * @returns Solution for Killer Sudoku `Puzzle` in the form of numbers matrix (array of arrays) indexed by row and then by column.
     *
     * @throws {InvalidSolverStateError} if `Solver` is stuck in a state that treats `Puzzle` as unsolvable.
     */
    solve(puzzle: Puzzle) {
        const reduction = new NumsReduction();
        const model = new MasterModel(puzzle);
        const ctx = new Context(model, reduction);
        model.initialReduce();
        ctx.resetReduction(new NumsReduction());
        new MasterStrategy(ctx).execute();
        return new Solution(model.solution);
    }

}
