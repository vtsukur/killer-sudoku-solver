import * as _ from 'lodash';
import { Cell } from '../puzzle/cell';
import { Grid } from '../puzzle/grid';
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
        if (_.isUndefined(this.topLeftCellContour) ||
                CageContour.cellIndexWithinGrid(cellContour.cell) < CageContour.cellIndexWithinGrid((this.topLeftCellContour as CellContour).cell)) {
            this.topLeftCellContour = cellContour;
        }
    }

    private static cellIndexWithinGrid(cell: Cell) {
        return cell.row * Grid.SIDE_CELL_COUNT + cell.col;
    }

    get cells() {
        return this._cellContours.map(c => c.cell);
    }

}
