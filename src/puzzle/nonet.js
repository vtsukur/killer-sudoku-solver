export class Nonet {
    static #SIDE_LENGTH = 3;
    static get SIDE_LENGTH() {
        return Nonet.#SIDE_LENGTH;
    }

    static indexOf(row, col) {
        return Math.floor(row / Nonet.#SIDE_LENGTH) * Nonet.#SIDE_LENGTH + Math.floor(col / Nonet.#SIDE_LENGTH);
    }

    constructor() {
        throw new TypeError('Nonet is not constructable');
    }
}
