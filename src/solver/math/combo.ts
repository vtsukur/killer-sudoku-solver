import { joinArray } from '../../util/readableMessages';
import { SudokuNumsCheckingSet, ReadonlySudokuNumsCheckingSet } from './sudokuNumsCheckingSet';

/**
 * Human-readable key describing combination of numbers.
 */
export type ComboKey = string;

/**
 * Combination of numbers used mainly to represent addends of `Cage` sum.
 *
 * Combination allows duplication of numbers.
 *
 * @public
 */
export class Combo implements Iterable<number> {

    /**
     * Human-readable key describing combination of numbers.
     */
    readonly key: ComboKey;

    /**
     * Checking set of unique Sudoku numbers between 1 and 9 present in this {@link Combo}
     * with efficient storage & fast checking/manipulation operations.
     */
    readonly numsCheckingSet: ReadonlySudokuNumsCheckingSet;

    private readonly _nums: ReadonlyArray<number>;
    private readonly _numSet: ReadonlySet<number>;

    /**
     * Constructs new combination of the given numbers.
     *
     * @param val - Numbers to construct a combination from.
     */
    constructor(val: ReadonlyArray<number>) {
        this._nums = [...val];
        this._numSet = new Set(val);
        this.numsCheckingSet = new SudokuNumsCheckingSet(val);
        this.key = joinArray(val);
    }

    /**
     * Constructs new combination of the given numbers specified via rest parameters.
     *
     * @param val - Numbers to construct a combination from.
     *
     * @returns new combination of the given numbers.
     */
    static of(...val: ReadonlyArray<number>) {
        return new Combo(val);
    }

    /**
     * Returns first number in the combination.
     *
     * @throws {RangeError} if the combination is empty.
     */
    get number0() {
        return this.nthNumber(0);
    }

    /**
     * Returns second number in the combination.
     *
     * @throws {RangeError} if the combination doesn't have second element.
     */
    get number1() {
        return this.nthNumber(1);
    }

    /**
     * Returns number with the n-th `index` in the combination.
     *
     * @param index - Index of the number in the combination.
     *
     * @returns number with the n-th `index` in the combination.
     *
     * @throws {RangeError} if the given index is outside of combination numbers range.
     */
    nthNumber(index: number) {
        if (index < 0 || index > this._nums.length - 1) {
            throw new RangeError(`Number of index ${index} cannot be accessed. Combo has ${this._nums.length} elements`);
        } else {
            return this._nums[index];
        }
    }

    /**
     * Convention-based method of iterator protocol that turns this object into iterable
     * and allows its use in a `for...of` loop and various other syntaxes.
     *
     * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators
     *
     * @returns iterator over numbers in this combination.
     */
    [Symbol.iterator](): Iterator<number> {
        return this._nums.values();
    }

    /**
     * Checks if the given number is a part of this combination.
     *
     * @param val - Number to check for being a part of this combination.
     *
     * @returns `true` if the given number is a part of this combination, otherwise `false`.
     */
    has(val: number) {
        return this._numSet.has(val);
    }

    /**
     * Checks if at least one number in the given `Set` is a part of this combination.
     *
     * @param val - `Set` of numbers to check against this combination.
     *
     * @returns `true` if at least one number in the given `Set` is a part of this combination;
     * otherwise `false`.
     */
    hasSome(val: Set<number>) {
        return Array.from(val).some(num => this._numSet.has(num));
    }

    /**
     * Reduces the size of the combination by deleting the given number.
     *
     * @param num - Number to reduce this combination by.
     *
     * @returns new combination without the given number if it is a part of this combination or
     * this combination if the given number is not a part of this combination.
     */
    reduce(num: number): Combo {
        const numIndex = this._nums.indexOf(num);
        if (numIndex !== -1) {
            const cpy = [...this._nums];
            cpy.splice(numIndex, 1);
            return new Combo(cpy);
        } else {
            return this;
        }
    }

}

/**
 * Readonly array of `Combo`s.
 */
export type ReadonlyCombos = ReadonlyArray<Combo>;
