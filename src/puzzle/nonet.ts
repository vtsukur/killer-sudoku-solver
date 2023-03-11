import { Cell, CellsMatrix } from './cell';
import { Grid } from './grid';

/**
 * Supportive class for Killer Sudoku `Nonet` (also called a `Box`)
 * which holds utility method that simplifies iteration over `Nonet` {@link Cell}s.
 *
 * @see https://en.wikipedia.org/wiki/Killer_sudoku#Terminology
 *
 * @public
 */
export class Nonet {

    /**
     * Amount of {@link Cell}s on `Nonet`'s side.
     */
    static readonly SIDE_CELL_COUNT = 3;

    /* istanbul ignore next */
    private constructor() {
        throw new Error('Non-contructible');
    }

    /**
     * {@link Cell}s for each {@link Nonet}
     * represented as a readonly array of {@link ReadonlyCells} indexed by {@link Nonet}.
     */
    static readonly CELLS: CellsMatrix = (() => {
        const val: Array<Array<Cell>> = Grid.SIDE_INDICES.map(() => []);
        for (const row of Grid.SIDE_INDICES) {
            for (const col of Grid.SIDE_INDICES) {
                val[Cell.GRID_OF_NONETS[row][col]].push(Cell.GRID[row][col]);
            }
        }
        return val;
    })();

}
