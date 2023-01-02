import _ from 'lodash';

export class CageContour {
    #cellContours;
    #topLeftCellContour;

    constructor() {
        this.#cellContours = Array();
        this.#topLeftCellContour = undefined;
    }

    addCellContour(cellContour) {
        this.#cellContours.push(cellContour);
        this.#updateTopLeftCellContour(cellContour);
    }

    #updateTopLeftCellContour(cellContour) {
        if (_.isUndefined(this.#topLeftCellContour) || cellContour.cell.absIdx < this.#topLeftCellContour.cell.absIdx) {
            this.#topLeftCellContour = cellContour;
        }
    }

    get topLeftCellContour() {
        return this.#topLeftCellContour;
    }
}
