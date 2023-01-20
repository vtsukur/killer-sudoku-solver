import * as _ from 'lodash';
import { CellContour } from './cellContour';

export class CageContour {
    private _cellContours: Array<CellContour>;
    topLeftCellContour?: CellContour;
    sumImagePath?: string;

    constructor() {
        this._cellContours = [];
        this.topLeftCellContour = undefined;
        this.sumImagePath = undefined;
    }

    addCellContour(cellContour: CellContour) {
        this._cellContours.push(cellContour);
        this.updateTopLeftCellContour(cellContour);
    }

    private updateTopLeftCellContour(cellContour: CellContour) {
        if (_.isUndefined(this.topLeftCellContour) || cellContour.cell.indexWithinGrid < (this.topLeftCellContour as CellContour).cell.indexWithinGrid) {
            this.topLeftCellContour = cellContour;
        }
    }

    get cells() {
        return this._cellContours.map(c => c.cell);
    }
}
