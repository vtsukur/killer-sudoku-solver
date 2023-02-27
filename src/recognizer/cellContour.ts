import * as _ from 'lodash';
import { Cell } from '../puzzle/cell';
import { Rect } from './rect';

export class CellContour {

    readonly cell;
    readonly rect;
    readonly cageBorders;
    cageFound;
    private readonly _dottedCageContourRects: Array<Rect>;

    constructor(cell: Cell, rect: Rect) {
        this.cell = cell;
        this.rect = rect;
        this.cageBorders = new CageBorders();
        this.cageFound = false;
        this._dottedCageContourRects = [];
    }

    addDottedCageContourRect(dottedCageContourRect: Rect) {
        this._dottedCageContourRects.push(dottedCageContourRect);
    }

    computeSumAreaRect() {
        const DEVIATION = 5;
        const ALIGNMENT = 2;

        let leftmostDotX = (this.rect.x + this.rect.width);
        let leftmostDotY = (this.rect.y + this.rect.height);
        let topmostDotX = leftmostDotX;
        let topmostDotY = leftmostDotY;

        for (const dottedCageContourRect of this._dottedCageContourRects) {
            leftmostDotX = Math.min(leftmostDotX, dottedCageContourRect.x);
            topmostDotY = Math.min(topmostDotY, dottedCageContourRect.y);
        }

        for (const dottedCageContourRect of this._dottedCageContourRects) {
            if (_.inRange(dottedCageContourRect.x, leftmostDotX - DEVIATION, leftmostDotX + DEVIATION)) {
                leftmostDotY = Math.min(leftmostDotY, dottedCageContourRect.y);
            }
            if (_.inRange(dottedCageContourRect.y, topmostDotY - DEVIATION, topmostDotY + DEVIATION)) {
                topmostDotX = Math.min(topmostDotX, dottedCageContourRect.x);
            }
        }

        leftmostDotX += ALIGNMENT;
        leftmostDotY -= ALIGNMENT;
        topmostDotX -= ALIGNMENT;
        topmostDotY += ALIGNMENT;

        return new Rect(leftmostDotX, topmostDotY, topmostDotX - leftmostDotX, leftmostDotY - topmostDotY);
    }

    markCageContour(rect: Rect) {
        const relativeX = rect.x - this.rect.x + rect.width / 2;
        const relativeY = rect.y - this.rect.y + rect.height / 2;

        const cageBorderXSize = this.rect.width / CageBorders.SIDES;
        const cageBorderYSize = this.rect.height / CageBorders.SIDES;

        this.cageBorders.setHasAt(~~(relativeY / cageBorderYSize), ~~(relativeX / cageBorderXSize));
    }

}

class CageBorders {

    private readonly _matrix;

    constructor() {
        this._matrix = [
            [ false, false, false ],
            [ false, false, false ],
            [ false, false, false ]
        ];
    }

    setHasAt(x: number, y: number) {
        this._matrix[x][y] = true;
    }

    get hasAtTop() {
        return this._matrix[0][1];
    }

    get hasAtBottom() {
        return this._matrix[2][1];
    }

    get hasAtLeft() {
        return this._matrix[1][0];
    }

    get hasAtRight() {
        return this._matrix[1][2];
    }

    static readonly SIDES = 3;

}
