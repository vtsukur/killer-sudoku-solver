export function xFrom1DIndex(val: number, sideLength: number) {
    return val % sideLength;
}

export function yFrom1DIndex(val: number, sideLength: number) {
    return Math.floor(val / sideLength);
}

export function to1DIndex(x: number, y: number, sideLength: number) {
    return y * sideLength + x;
}
