import { Cell, CellsMatrix } from './cell';

/**
 * Supportive class for Killer Sudoku `Row`
 * which holds utility method that simplifies iteration over `Row` {@link Cell}s.
 *
 * @public
 *
 * @see https://en.wikipedia.org/wiki/Killer_sudoku#Terminology
 */
export class Row {

    /* istanbul ignore next */
    private constructor() {
        throw new Error('Non-contructible');
    }

    /**
     * {@link Cell}s for each {@link Row}
     * represented as a readonly array of {@link ReadonlyCells} indexed by {@link Row}.
     */
    static readonly CELLS: CellsMatrix = Cell.GRID;

}
