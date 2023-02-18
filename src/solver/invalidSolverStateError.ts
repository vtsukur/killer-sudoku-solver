/**
 * Error signifying that Killer Sudoky `Puzzle` `Solver` is stuck in a state that treats `Puzzle` as unsolvable.
 *
 * @public
 */
export class InvalidSolverStateError extends Error {

    /**
     * Constructs new error with the given message.
     *
     * @param message - Error message.
     */
    constructor(message: string) {
        super(message);
    }

}
