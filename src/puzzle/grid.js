import { House } from './house';

export class Grid {
    static #SIDE_LENGTH = 9;
    static get SIDE_LENGTH() {
        return Grid.#SIDE_LENGTH;
    }

    static #CELL_COUNT = Grid.#SIDE_LENGTH * Grid.#SIDE_LENGTH;
    static get CELL_COUNT() {
        return Grid.#CELL_COUNT;
    }

    static #TOTAL_SUM = Grid.#SIDE_LENGTH * House.SUM;
    static get TOTAL_SUM() {
        return Grid.#TOTAL_SUM;
    }

    static rowFromAbs(idx) {
        return Math.floor(idx / House.SIZE);
    }

    static colFromAbs(idx) {
        return idx % House.SIZE;
    }

    static newMatrix() {
        return new Array(House.SIZE).fill().map(() => new Array(House.SIZE));
    }

    static iterator() {
        let i = 0;
        return {
            [Symbol.iterator]() { return this; },
            next() {
                const abs = i++;
                if (abs < Grid.#CELL_COUNT) {
                    return {
                        value: {
                            row: Grid.rowFromAbs(abs),
                            col: Grid.colFromAbs(abs),
                            i: abs
                        },
                        done: false
                    };
                } else {
                    return { value: undefined, done: true };
                }
            }
        }
    }

    constructor() {
        throw new TypeError('Grid is not constructable');
    }
}
