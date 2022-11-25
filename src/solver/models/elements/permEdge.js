// experimental
export class PermEdge {
    #cellM;
    #num;
    #key;
    #permEdgesMap;

    constructor(cellM, num) {
        this.#cellM = cellM;
        this.#num = num;
        this.#key = `${num} in ${cellM.cell.key}`;
        this.#permEdgesMap = new Map();
    }

    get cellM() {
        return this.#cellM;
    }

    get num() {
        return this.#num;
    }

    get key() {
        return this.#key;
    }

    addPermEdge(permEdge) {

    }
}
