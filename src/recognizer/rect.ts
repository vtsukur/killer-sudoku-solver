export class Rect {

    readonly x;
    readonly y;
    readonly width;
    readonly height;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    static from(rect: Rect) {
        return new Rect(rect.x, rect.y, rect.width, rect.height);
    }

    toString() {
        return `{ x: ${this.x}, y: ${this.y}, width: ${this.width}, height: ${this.height} }`;
    }

}
