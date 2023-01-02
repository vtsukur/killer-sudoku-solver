export class CageContour {
    #cells;

    constructor() {
        this.#cells = Array();
    }

    addCell(cell) {
        this.#cells.push(cell);
    }

    sortCells() {
        this.#cells.sort((a, b) => a.absIdx - b.absIdx);
    }
}
