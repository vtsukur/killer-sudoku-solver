export class CellContour {
    #cell;
    #rect;
    #marker;

    constructor(cell, rect) {
        this.#cell = cell;
        this.#rect = rect;
        this.#marker = new Marker();
    }

    get cell() {
        return this.#cell;
    }

    get rect() {
        return this.#rect;
    }

    markCageContour(rect) {
        const relativeX = rect.x - this.#rect.x + rect.width / 2;
        const relativeY = rect.y - this.#rect.y + rect.height / 2;

        const markerXSize = this.#rect.width / Marker.SIDES;
        const markerYSize = this.#rect.height / Marker.SIDES;

        this.#marker.setHasAt(Math.floor(relativeX / markerXSize), Math.floor(relativeY / markerYSize));
    }
}

class Marker {
    #matrix;

    constructor() {
        this.#matrix = [
            [ false, false, false ],
            [ false, false, false ],
            [ false, false, false ]
        ];
    }

    setHasAt(x, y) {
        this.#matrix[x][y] = true;
    }

    static #SIDES = 3;
    static get SIDES() {
        return Marker.#SIDES;
    };
}
