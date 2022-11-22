export class House {
    static #SIZE = 9;
    static get SIZE() {
        return House.#SIZE;
    }

    static #SUM = 45;
    static get SUM() {
        return House.#SUM;
    }

    constructor() {
        throw new TypeError('House is not constructable');
    }
}
