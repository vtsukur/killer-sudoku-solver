export class CageContour {
    #cells;

    constructor() {
        this.#cells = Array();
    }

    addCell(cell) {
        this.#cells.push(cell);
    }
}
