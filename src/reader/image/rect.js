export class Rect {
    #x;
    #y;
    #width;
    #height;

    constructor(x, y, width, height) {
        this.#x = x;
        this.#y = y;
        this.#width = width;
        this.#height = height;
    }

    static from(rect) {
        return new Rect(rect.x, rect.y, rect.width, rect.height);
    }

    get x() {
        return this.#x;
    }

    get y() {
        return this.#y;
    }

    get width() {
        return this.#width;
    }

    get height() {
        return this.#height;
    }
}