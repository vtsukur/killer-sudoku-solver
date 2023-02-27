import { Cell } from '../puzzle/cell';
import { House, HouseIndex } from '../puzzle/house';
import { Rect } from './rect';

export class GridContour {

    readonly rect;
    readonly cellWidth;
    readonly cellHeight;

    constructor(rect: Rect) {
        this.rect = rect;
        this.cellWidth = rect.width / House.CELL_COUNT;
        this.cellHeight = rect.height / House.CELL_COUNT;
    }

    cellRect(row: HouseIndex, col: HouseIndex) {
        return new Rect(
            this.rect.x + col * this.cellWidth,
            this.rect.y + row * this.cellHeight,
            this.cellWidth,
            this.cellHeight
        );
    }

    cellFromRect(rect: Rect) {
        if (!this.hasRect(rect)) return undefined;

        const relativeX = rect.x - this.rect.x + rect.width / 2;
        const relativeY = rect.y - this.rect.y + rect.height / 2;

        return Cell.at(~~(relativeY / this.cellHeight), ~~(relativeX / this.cellWidth));
    }

    private hasRect(rect: Rect) {
        return this.rect.x <= rect.x && this.rect.x + this.rect.width >= rect.x + rect.width &&
            this.rect.y <= rect.y && this.rect.y + this.rect.height >= rect.y + rect.height;
    }

    toString() {
        return `(${this.rect.x}, ${this.rect.y}) - (${this.rect.x + this.rect.width}, ${this.rect.y + this.rect.height})`;
    }

}
