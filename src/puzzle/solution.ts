import { EOL } from 'os';

/**
 * Numbers matrix (array of arrays) indexed by row and then by column.
 */
type NumbersMatrix = ReadonlyArray<ReadonlyArray<number>>;

/**
 * Solution for Killer Sudoku `Puzzle` in the form of numbers matrix (array of arrays) indexed by row and then by column
 * with support of human-readable string representation which may be accessed via {@link Solution#toString}.
 *
 * @public
 */
export class Solution {

    /**
     * Numbers matrix (array of arrays) indexed by row and then by column.
     *
     * For example, accessing last number (column index 8) in the second row (row index 1) looks as follows:
     * ```ts
     * const solution: Solution = ...;
     * const lastNumberInSecondRow = solution.numbers[1][8];
     * ```
     */
    readonly numbers: NumbersMatrix;

    private readonly _asString: string;

    private static COLUMN_SEPARATOR = ' ';
    private static ROW_SEPARATOR = EOL;

    /**
     * Constructs new `Solution` with the given numbers matrix.
     *
     * @param numbers - Numbers matrix (array of arrays) which should be indexed by row and then by column.
     */
    constructor(numbers: NumbersMatrix) {
        this.numbers = numbers;
        this._asString = numbers.map(numRow => {
            return numRow.join(Solution.COLUMN_SEPARATOR);
        }).join(Solution.ROW_SEPARATOR);
    }

    /**
     * Returns human-readable string representation of the `Solution`
     * in the form of matrix where each number in the row is separated by a space
     * and rows are separated by OS-specific EOL (end of line) character.
     *
     * Sample representation:
     * ```
     * 5 1 3 9 2 8 4 7 6
     * 2 4 8 3 7 6 1 9 5
     * 6 7 9 4 5 1 8 2 3
     * 9 6 7 2 8 4 5 3 1
     * 3 8 1 5 9 7 6 4 2
     * 4 2 5 6 1 3 7 8 9
     * 1 9 6 7 4 2 3 5 8
     * 7 3 2 8 6 5 9 1 4
     * 8 5 4 1 3 9 2 6 7
     * ```
     *
     * @returns human-readable string representation of the `Solution`.
     */
    toString() {
        return this._asString;
    }
}
