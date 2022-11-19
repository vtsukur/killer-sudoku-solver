import { HOUSE_SIZE, HOUSE_SUM } from './constants';

export class Grid {
    static #SIDE_LENGTH = 9;

    static #TOTAL_SUM = Grid.#SIDE_LENGTH * HOUSE_SUM;
    static get TOTAL_SUM() {
        return Grid.#TOTAL_SUM;
    }

    static #CELL_COUNT = Grid.#SIDE_LENGTH * HOUSE_SIZE;
    static get CELL_COUNT() {
        return Grid.#CELL_COUNT;
    }

    constructor() {
        throw new TypeError('Grid is not constructable');
    }
}
