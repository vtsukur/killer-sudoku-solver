export class House {
    static #SIZE = 9;
    static get SIZE() {
        return House.#SIZE;
    }

    static #SUM = 45;
    static get SUM() {
        return House.#SUM;
    }
    
    static #NONET_SIDE_LENGTH = 3;
    static get NONET_SIDE_LENGTH() {
        return House.#NONET_SIDE_LENGTH;
    }

    constructor() {
        throw new TypeError('House is not constructable');
    }
}
