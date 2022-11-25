export class PermEdge {
    #cellM;
    #num;
    #permEdgesMap;

    constructor(cellM, num) {
        this.#cellM = cellM;
        this.#num = num;
        this.#permEdgesMap = new Map();
    }

    get cellM() {
        return this.#cellM;
    }

    get num() {
        return this.#num;
    }

    addPermEdge(permEdge) {

    }
}
