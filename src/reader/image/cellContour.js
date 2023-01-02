export class CellContour {
    #cell;
    #rect;
    #cageBorders;
    #cageFound;

    constructor(cell, rect) {
        this.#cell = cell;
        this.#rect = rect;
        this.#cageBorders = new CageBorders();
        this.#cageFound = false;
    }

    get cell() {
        return this.#cell;
    }

    get rect() {
        return this.#rect;
    }

    get cageBorders() {
        return this.#cageBorders;
    }

    get cageFound() {
        return this.#cageFound;
    }

    setCageFound() {
        this.#cageFound = true;
    }

    markCageContour(rect) {
        const relativeX = rect.x - this.#rect.x + rect.width / 2;
        const relativeY = rect.y - this.#rect.y + rect.height / 2;

        const cageBorderXSize = this.#rect.width / CageBorders.SIDES;
        const cageBorderYSize = this.#rect.height / CageBorders.SIDES;

        this.#cageBorders.setHasAt(Math.floor(relativeY / cageBorderYSize), Math.floor(relativeX / cageBorderXSize));
    }
}

class CageBorders {
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

    get hasAtTop() {
        return this.#matrix[0][1];
    }

    get hasAtBottom() {
        return this.#matrix[2][1];
    }

    get hasAtLeft() {
        return this.#matrix[1][0];
    }

    get hasAtRight() {
        return this.#matrix[1][2];
    }

    static #SIDES = 3;
    static get SIDES() {
        return CageBorders.#SIDES;
    };
}
