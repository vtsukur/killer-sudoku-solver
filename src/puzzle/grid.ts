import { GridMatrix } from './gridMatrix';
import { House } from './house';

/**
 * Supportive class for Killer Sudoku `Grid`
 * which holds useful constants that describe mathematical properties of any `Grid`
 * as well as utility methods that simplify iteration over `Grid` {@link Cell}s,
 * {@link CellRowAndColumn}s and creation of supplementary ranges and matrices with `Grid`'s size.
 *
 * @public
 */
export class Grid {

    /**
     * Total sum of all numbers in a `Grid`.
     */
    static readonly SUM = Math.imul(GridMatrix.SIDE_CELL_COUNT, House.SUM);

    /* istanbul ignore next */
    private constructor() {
        throw new Error('Non-contructible');
    }

}
