import { CellProducer, CellsIterator } from './cellsIterator';

/**
 * Supportive class for Killer Sudoku puzzle `House` (generalization over `Row`, `Column` and `Nonet`)
 * which holds useful constants that describe mathematical properties of any `House`
 * as well as utility methods that simplify iteration over `House` {@link Cell}s.
 *
 * @public
 */
export class House {

    /**
     * Amount of `House`s of one type (`Row`s, `Column`s or `Nonet`s) within a `Grid`.
     */
    static readonly COUNT_OF_ONE_TYPE_PER_GRID = 9;

    /**
     * Amount of {@link Cell}s in a `House`.
     */
    static readonly CELL_COUNT = 9;

    /**
     * Sum of all numbers in a `House`.
     */
    static readonly SUM = 45;

    private constructor() {
        // Non-contructible.
    }

    /**
     * Constructs new iterator over {@link Cell}s for a `House` with the given {@link CellProducer}
     * guaranteeing that amount of iterations matches amount of `Cell`s in a `House`.
     *
     * @param cellProducer - Function which produces `Cell` by its index within the `House`.
     *
     * @returns new iterator over {@link Cell}s for a `House` with the given {@link CellProducer}.
     */
    static newCellsIterator(cellProducer: CellProducer) {
        return new CellsIterator(cellProducer, this.CELL_COUNT);
    }
}
