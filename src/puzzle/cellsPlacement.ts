// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Cell, ReadonlyCells } from './cell';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Column } from './column';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Grid } from './grid';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { House } from './house';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Nonet } from './nonet';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Row } from './row';

/**
 * Placement of {@link Cell}s on the {@link Grid} represented by boolean flags,
 * which is helpful to determine if {@link Cell}s reside within a single {@link House}
 * ({@link Row}, {@link Column}, and {@link Nonet}}).
 */
export class CellsPlacement {

    /**
     * Whether placement describes a single {@link Cell}.
     */
    readonly isSingleCell: boolean;

    /**
     * Whether {@link Cell}s reside within a single {@link Row}.
     */
    readonly isWithinRow: boolean;

    /**
     * Whether {@link Cell}s reside within a single {@link Column}.
     */
    readonly isWithinColumn: boolean;

    /**
     * Whether {@link Cell}s reside within a single {@link Nonet}.
     */
    readonly isWithinNonet: boolean;

    /**
     * Whether {@link Cell}s reside within a single {@link House}
     * ({@link Row}, {@link Column}, or {@link Nonet}}).
     */
    readonly isWithinHouse: boolean;

    /**
     * Constructs a new {@link CellsPlacement} for the given {@link Cell}s.
     *
     * @param cells - {@link Cell}s for the construction of {@link CellsPlacement}.
     */
    constructor(cells: ReadonlyCells) {
        this.isSingleCell = cells.length === 1;
        if (this.isSingleCell) {
            //
            // [PERFORMANCE] By definition, a single `Cell` resides
            // within a single `Row`, `Column`, and `Nonet`,
            // initializing all respective flags with a `true` value.
            //
            this.isWithinRow = this.isWithinColumn = this.isWithinNonet = this.isWithinHouse = true;
        } else {
            //
            // [PERFORMANCE] The following implementation of determining flags
            // does *not* leverage built-in ECMAScript collections and methods
            // since `do ... while` based iteration with boolean operators
            // and no extra method calls are several times faster,
            // even for a small number of `Cell`s.
            //

            const firstCell = cells[0];

            // Saving reference values of `House`s' indices for the use in the comparisons.
            const refRow = firstCell.row;
            const refCol = firstCell.col;
            const refNonet = firstCell.nonet;

            // Assuming that all flags are `true` by default.
            let isWithinRow = true;
            let isWithinColumn = true;
            let isWithinNonet = true;

            //
            // Iterating over each `Cell` starting with the second one.
            // Logic already processed first `Cell` by capturing reference indices.
            //
            let i = 1;
            do {
                const cell = cells[i];

                //
                // If the `House` index of the current `Cell` is *not* the same as the reference `House` index,
                // it is clear that at least two `Cell`s are in different `House`s,
                // so the value of the respective flag should be `false`.
                // (And subsequent iterations will short-circuit for performance.)
                // Otherwise, `isWithin${houseType}` is kept with the default value of `true`.
                //

                if (isWithinRow && refRow !== cell.row) {
                    isWithinRow = false;
                }
                if (isWithinColumn && refCol !== cell.col) {
                    isWithinColumn = false;
                }
                if (isWithinNonet && refNonet !== cell.nonet) {
                    isWithinNonet = false;
                }
            } while (++i < cells.length);

            // Setting fields.
            this.isWithinRow = isWithinRow;
            this.isWithinColumn = isWithinColumn;
            this.isWithinNonet = isWithinNonet;
            this.isWithinHouse = this.isWithinRow || this.isWithinColumn || this.isWithinNonet;
        }
    }

}
