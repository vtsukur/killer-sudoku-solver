import _ from 'lodash';
import { Rect } from './rect';

export class CellContour {
    #cell;
    #rect;
    #cageBorders;
    #cageFound;
    #dottedCageContourRects;

    constructor(cell, rect) {
        this.#cell = cell;
        this.#rect = rect;
        this.#cageBorders = new CageBorders();
        this.#cageFound = false;
        this.#dottedCageContourRects = Array();
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

    addDottedCageContourRect(dottedCageContourRect) {
        this.#dottedCageContourRects.push(dottedCageContourRect);
    }

    computeSumAreaRect() {
        const DEVIATION = 5;
        const ALIGNMENT = 1;

        let leftmostDotX = (this.#rect.x + this.#rect.width);
        let leftmostDotY = (this.#rect.y + this.#rect.height);
        let topmostDotX = leftmostDotX;
        let topmostDotY = leftmostDotY;

        for (const dottedCageContourRect of this.#dottedCageContourRects) {
            leftmostDotX = Math.min(leftmostDotX, dottedCageContourRect.x);
            topmostDotY = Math.min(topmostDotY, dottedCageContourRect.y);
        }

        for (const dottedCageContourRect of this.#dottedCageContourRects) {
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
