import { House } from './house';

export class Grid {
    static #SIDE_LENGTH = 9;
    static get SIDE_LENGTH() {
        return Grid.#SIDE_LENGTH;
    }

    static #CELL_COUNT = Grid.#SIDE_LENGTH * House.SIZE;
    static get CELL_COUNT() {
        return Grid.#CELL_COUNT;
    }

    static #TOTAL_SUM = Grid.#SIDE_LENGTH * House.SUM;
    static get TOTAL_SUM() {
        return Grid.#TOTAL_SUM;
    }

    constructor() {
        throw new TypeError('Grid is not constructable');
    }
}
