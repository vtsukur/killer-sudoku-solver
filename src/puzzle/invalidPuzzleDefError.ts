/**
 * Error signifying invalid definition of Killer Sudoku `Puzzle` or its part.
 *
 * @public
 */
export class InvalidPuzzleDefError extends Error {

    /**
     * Constructs new error with the given message.
     *
     * @param message - Error message.
     */
    constructor(message: string) {
        super(message);
    }

}
