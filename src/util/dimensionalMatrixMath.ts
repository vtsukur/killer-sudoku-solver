import { HouseIndex } from '../puzzle/house';

export function rowFrom1D(val: number, sideLength: number) {
    return Math.floor(val / sideLength);
}

export function colFrom1D(val: number, sideLength: number) {
    return val % sideLength;
}

export function to1D(row: HouseIndex, col: HouseIndex, sideLength: number) {
    return row * sideLength + col;
}
