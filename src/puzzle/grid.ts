import { rowFrom1D, colFrom1D } from '../util/dimensionalMatrixMath';
import { Cell } from './cell';
import { CellsIterator } from './cellsIterator';
import { House } from './house';

/**
 * Supportive class for Killer Sudoku puzzle grid
 * which holds useful constants that describe mathematical properties of any puzzle grid
 * as well as utility methods that simplify iteration over grid's cells
 * and creation of matrices with grid's size.
 *
 * @public
 */
class GridObject {
    /**
     * Amount of {@link Cell}s on Grid's side.
     */
    readonly SIDE_CELL_COUNT = 9;

    /**
     * Total amount of {@link Cell}s on the Grid.
     */
    readonly CELL_COUNT = this.SIDE_CELL_COUNT * this.SIDE_CELL_COUNT;

    /**
     * Total sum of all numbers on the Grid.
     */
    readonly SUM = this.SIDE_CELL_COUNT * House.SUM;

    cellsIterator(): CellsIterator {
        return new CellsIterator((index: number) => {
            return Cell.at(
                colFrom1D(index, Grid.SIDE_CELL_COUNT),
                rowFrom1D(index, Grid.SIDE_CELL_COUNT),
            );
        }, Grid.CELL_COUNT);
    }

    newMatrix() {
        return new Array(this.SIDE_CELL_COUNT).fill(undefined).map(() => new Array(this.SIDE_CELL_COUNT));
    }
}

export const Grid = Object.freeze(new GridObject());
