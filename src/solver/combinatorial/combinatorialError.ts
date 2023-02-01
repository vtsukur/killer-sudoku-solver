/**
 * Error signifying error occuring during combinatorial computations.
 *
 * @public
 */
export class CombinatorialError extends Error {

    /**
     * Constructs new error with the given message.
     *
     * @param message - Error message.
     */
    constructor(message: string) {
        super(message);
    }
}
