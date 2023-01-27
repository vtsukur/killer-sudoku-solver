import { rowFrom1D, colFrom1D } from '../util/dimensionalMatrixMath';
import { Cell } from './cell';
import { CellsIterator } from './cellsIterator';
import { House } from './house';

/**
 * Meta class for Killer Sudoku puzzle's grid
 * which holds useful constants that describe grid's mathematical properties
 * as well as utility methods that simplify iteration over grid's cells
 * and creation of matrices with grid's size.
 *
 * @public
 */
class GridMeta {
    /**
     * Length of Grid's side in cells.
     */
    readonly SIDE_LENGTH = 9;

    /**
     * Total amount of {@link Cell}s on the Grid.
     */
    readonly CELL_COUNT = this.SIDE_LENGTH * this.SIDE_LENGTH;

    /**
     * Total sum of all numbers on the Grid.
     */
    readonly SUM = this.SIDE_LENGTH * House.SUM;

    cellsIterator(): CellsIterator {
        return new CellsIterator((index: number) => {
            return Cell.at(
                colFrom1D(index, Grid.SIDE_LENGTH),
                rowFrom1D(index, Grid.SIDE_LENGTH),
            );
        }, Grid.CELL_COUNT);
    }

    newMatrix() {
        return new Array(this.SIDE_LENGTH).fill(undefined).map(() => new Array(this.SIDE_LENGTH));
    }
}

export const Grid = Object.freeze(new GridMeta());
