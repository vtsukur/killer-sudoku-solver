export class Nonet {
    static #SIDE_LENGTH = 3;
    static get SIDE_LENGTH() {
        return Nonet.#SIDE_LENGTH;
    }

    constructor() {
        throw new TypeError('Nonet is not constructable');
    }
}
