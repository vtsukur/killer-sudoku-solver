/**
 * Supportive class for Killer Sudoku `Number`s.
 *
 * @public
 */
export class Numbers {

    /**
     * Minimum number in a {@link Cell}.
     */
    static readonly MIN = 1;

    /**
     * Maximum number in a {@link Cell}.
     */
    static readonly MAX = 9;

    /* istanbul ignore next */
    private constructor() {
        throw new Error('Non-contructible');
    }
}
