export function rowFrom1D(val: number, sideLength: number) {
    return val % sideLength;
}

export function colFrom1D(val: number, sideLength: number) {
    return Math.floor(val / sideLength);
}

export function to1D(row: number, col: number, sideLength: number) {
    return row * sideLength + col;
}
