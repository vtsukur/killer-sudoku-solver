export class CellContour {
    #cell;
    #rect;
    #cageContours;

    constructor(cell, rect) {
        this.#cell = cell;
        this.#rect = rect;
        this.#cageContours = Array();
    }

    get cell() {
        return this.#cell;
    }

    get rect() {
        return this.#rect;
    }

    addCageContour(contour) {
        this.#cageContours.push(contour);
    }
}
