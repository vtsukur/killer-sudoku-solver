// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Cage } from '../../../../puzzle/cage';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Cell } from '../../../../puzzle/cell';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Column } from '../../../../puzzle/column';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Grid } from '../../../../puzzle/grid';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { House, HouseIndex } from '../../../../puzzle/house';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Nonet } from '../../../../puzzle/nonet';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Puzzle } from '../../../../puzzle/puzzle';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Row } from '../../../../puzzle/row';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Combo, HouseModelCagesCombinatorics } from '../../../math';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { HouseModel } from '../../../models/elements/houseModel';
import { Strategy } from '../../strategy';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FindComplementingCagesStrategy } from './findComplementingCagesStrategy';

/**
 * This {@link Strategy} for solving the Killer Sudoku {@link Puzzle}
 * analyses possible permutations of number {@link Combo}s for {@link Cage}s within each {@link House}
 * and initializes each {@link Cage} with respective {@link Combo}s.
 *
 * This {@link Strategy} follows key Killer Sudoku constraint,
 * which states that _a {@link House} has a nonrepeating set of {@link Cell}s with numbers from 1 to 9_.
 *
 * For example, let us consider a {@link Nonet} of index `0`
 * (topmost leftmost {@link Nonet} in the {@link Grid}) with the following {@link Cell}s:
 *
 * ```
 * // (row, column)
 * (0, 0), (0, 1), (0, 2)
 * (1, 0), (1, 1), (1, 2)
 * (2, 0), (2, 1), (2, 2)
 * ```
 *
 * Let us assume the following {@link Cage}s reside within this {@link Nonet}:
 *
 * ```
 * Cage 1. Sum: 15. Cells: (0, 0), (0, 1)
 * Cage 2. Sum: 8.  Cells: (0, 2)
 * Cage 3. Sum: 11. Cells: (1, 0), (1, 1), (1, 2)
 * Cage 4. Sum: 11. Cells: (2, 0), (2, 1), (2, 2)
 * ```
 *
 * These {@link Cage}s cover the entire {@link Nonet} and do *not* have shared {@link Cell}s,
 * so {@link Cell}s within these {@link Cage}s must have unique numbers from `1` to `9`.
 *
 * Since the positions of particular {@link Cell}s do *not* matter (only their count for each {@link Cage}),
 * let us simplify {@link Cage} definitions for {@link Nonet} of index `0` to the following form:
 *
 * ```
 * Cage 1. Sum: 15. Cells: 2
 * Cage 2. Sum: 8.  Cells: 1
 * Cage 3. Sum: 11. Cells: 3
 * Cage 4. Sum: 11. Cells: 3
 * ```
 *
 * These {@link Cage}s may have the following number {@link Combo}s:
 *
 * ```
 * Cage 1. Sum: 15. Cells: 2. Combinations: (6, 9), (7, 8)
 * Cage 2. Sum: 8.  Cells: 1. Combinations: (8)
 * Cage 3. Sum: 11. Cells: 3. Combinations: (1, 2, 8), (1, 3, 7), (1, 4, 6), (2, 3, 6), (2, 4, 5)
 * Cage 4. Sum: 11. Cells: 3. Combinations: (1, 2, 8), (1, 3, 7), (1, 4, 6), (2, 3, 6), (2, 4, 5)
 * ```
 *
 * It is trivial to observe that single-{@link Cell} `Cage 2` may have
 * only one {@link Combo} `(8)` and one number in the {@link Cell}, which is `8`.
 *
 * It means that {@link Combo}s for other {@link Cage}s should *not* have `8`:
 *
 * ```
 * Cage 1. Sum: 15. Cells: 2. Combinations: (6, 9)                                     // 1 `Combo` is removed
 * Cage 2. Sum: 8.  Cells: 1. Combinations: (8)
 * Cage 3. Sum: 11. Cells: 3. Combinations: (1, 3, 7), (1, 4, 6), (2, 3, 6), (2, 4, 5) // 1 `Combo` is removed
 * Cage 4. Sum: 11. Cells: 3. Combinations: (1, 3, 7), (1, 4, 6), (2, 3, 6), (2, 4, 5) // 1 `Combo` is removed
 * ```
 *
 * As a result, it is trivial to observe that `Cage 1` has only one valid {@link Combo} `(6, 9)`.
 * So numbers `6` and `9` should *not* appear in {@link Combo}s for other {@link Cage}s.
 * Specifically, it affects `Cage 3` and `Cage 4`:
 * ```
 * Cage 1. Sum: 15. Cells: 2. Combinations: (6, 9)
 * Cage 2. Sum: 8.  Cells: 1. Combinations: (8)
 * Cage 3. Sum: 11. Cells: 3. Combinations: (1, 3, 7), (2, 4, 5)
 * Cage 4. Sum: 11. Cells: 3. Combinations: (1, 3, 7), (2, 4, 5)
 * ```
 *
 * These hints are significant since they reduce the possible {@link Cell}s' numbers in the {@link Nonet}.
 *
 * In the same way, the {@link Strategy} applies to {@link Row}s and {@link Column}s.
 *
 * This {@link Strategy} requires each {@link HouseModel} to have
 * a defined set of {@link Cage}s that cover the entire {@link House} and do *not* have shared {@link Cell}s.
 * Execution of {@link FindComplementingCagesStrategy} before this {@link Strategy}
 * achieves precisely that.
 *
 * This type represents the _initialization_ {@link Strategy} applied at most once
 * at the beginning of solving process for a particular {@link Puzzle}.
 *
 * @public
 */
export class FindCombosForHouseCagesStrategy extends Strategy {

    /**
     * @see Strategy.execute
     */
    execute() {
        // For each `HouseModel` ...
        for (const houseM of this._model.houseModels) {
            //
            // ... Enumerating possible numbers within `Cage`s
            // which belong to the `HouseModel`s `House`.
            //
            const { actualSumCombosOfAllCages: actualSumCombos } = HouseModelCagesCombinatorics.for(houseM);

            // ... Updating `Combo`s for each `Cage` in the `HouseModel`s `House`.
            houseM.cageModels.forEach((cageM, index) => {
                cageM.reduceCombos(actualSumCombos[index], this._context.reduction);
            });
        }
    }

}
