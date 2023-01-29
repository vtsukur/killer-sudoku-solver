import { Cell } from './cell';

/**
 * Function which provides `Cell` by its index within iteration context.
 */
export type CellProvider = (index: number) => Cell;

/**
 * Iterator over {@link Cell}s within a specific context like a `Grid` or a `House`.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators
 *
 * @public
 */
export class CellsIterator implements Iterator<Cell> {
    private _index = 0;
    private readonly _cellProvider: CellProvider;
    private readonly _count: number;

    /**
     * Constructs new `CellsIterator` with the given {@link CellProvider} and iteration count.
     *
     * @param cellProvider - Function which provides `Cell` by its index within iteration context.
     * @param count - Amount of `Cell`s within iteration context which determines the number of iterations.
     */
    constructor(cellProvider: CellProvider, count: number) {
        this._cellProvider = cellProvider;
        this._count = count;
    }

    /**
     * Convention-based method of iterator protocol that turns this object into iterable
     * and allows its use in a `for...of` loop and various other syntaxes.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators
     *
     * @returns this iterator.
     */
    [Symbol.iterator](): Iterator<Cell> {
        return this;
    }

    /**
     * Convention-based method of iterator protocol which produces next iterator result in the form of the {@link Cell}.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators
     *
     * @returns next iterator result.
     */
    next(): IteratorResult<Cell> {
        if (this._index < this._count) {
            return this.nextIterableResult(this._index++);
        } else {
            return CellsIterator.final();
        }
    }

    private nextIterableResult(index: number) {
        return {
            value: this._cellProvider(index),
            done: false
        };
    }

    private static final(): IteratorResult<Cell> {
        return {
            value: undefined,
            done: true
        };
    }
}
