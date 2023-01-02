import { Cell } from '../../problem/cell';
import { House } from '../../problem/house';
import { Rect } from './rect';

export class GridContour {
    #rect;
    #cellWidth;
    #cellHeight;

    constructor(rect) {
        this.#rect = rect;
        this.#cellWidth = rect.width / House.SIZE;
        this.#cellHeight = rect.height / House.SIZE;
    }

    get rect() {
        return this.#rect;
    }

    get cellWidth() {
        return this.#cellWidth;
    }

    get cellHeight() {
        return this.#cellHeight;
    }

    cellRect(row, col) {
        return new Rect(
            this.rect.x + row * this.#cellWidth,
            this.rect.y + col * this.#cellHeight,
            this.#cellWidth,
            this.#cellHeight
        );
    }

    cellFromRect(rect) {
        if (!this.#hasRect(rect)) return undefined;

        const relativeX = rect.x - this.#rect.x + this.#rect.width / 2;
        const relativeY = rect.y - this.#rect.y + this.#rect.height / 2;

        return Cell.at(Math.floor(relativeX / this.#cellWidth), Math.floor(relativeY / this.#cellHeight));
    }

    #hasRect(rect) {
        return this.#rect.x >= rect.x && this.#rect.x + this.#rect.width <= rect.x + rect.width &&
            this.#rect.y >= rect.y && this.#rect.y + this.#rect.height <= rect.y + rect.height;
    }

    toString() {
        return `(${this.rect.x}, ${this.rect.y}) - (${this.rect.x + this.rect.width}, ${this.rect.y + this.rect.height})`;
    }
}
