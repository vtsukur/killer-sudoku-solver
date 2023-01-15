export function xFrom1D(val: number, sideLength: number) {
    return val % sideLength;
}

export function yFrom1D(val: number, sideLength: number) {
    return Math.floor(val / sideLength);
}

export function to1D(x: number, y: number, sideLength: number) {
    return y * sideLength + x;
}
