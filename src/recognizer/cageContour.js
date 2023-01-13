import _ from 'lodash';

export class CageContour {
    #cellContours;
    #topLeftCellContour;
    #sumImagePath;

    constructor() {
        this.#cellContours = [];
        this.#topLeftCellContour = undefined;
        this.#sumImagePath = undefined;
    }

    addCellContour(cellContour) {
        this.#cellContours.push(cellContour);
        this.#updateTopLeftCellContour(cellContour);
    }

    #updateTopLeftCellContour(cellContour) {
        if (_.isUndefined(this.#topLeftCellContour) || cellContour.cell.absIndex < this.#topLeftCellContour.cell.absIndex) {
            this.#topLeftCellContour = cellContour;
        }
    }

    get topLeftCellContour() {
        return this.#topLeftCellContour;
    }

    get sumImagePath() {
        return this.#sumImagePath;
    }

    set sumImagePath(value) {
        this.#sumImagePath = value;
    }

    get cells() {
        return this.#cellContours.map(c => c.cell);
    }
}
