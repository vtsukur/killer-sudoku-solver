import { House } from './house';

export namespace Grid {
    export const SIDE_LENGTH = 9;
    export const CELL_COUNT = Grid.SIDE_LENGTH * Grid.SIDE_LENGTH;
    export const TOTAL_SUM = Grid.SIDE_LENGTH * House.SUM;

    export function rowFromAbs(idx: number) {
        return Math.floor(idx / House.SIZE);
    }

    export function colFromAbs(idx: number) {
        return idx % House.SIZE;
    }

    export function newMatrix() {
        return new Array(House.SIZE).fill(undefined).map(() => new Array(House.SIZE));
    }

    export function iterator() {
        let i = 0;
        return {
            [Symbol.iterator]() { return this; },
            next() {
                const abs = i++;
                if (abs < Grid.CELL_COUNT) {
                    return {
                        value: {
                            row: Grid.rowFromAbs(abs),
                            col: Grid.colFromAbs(abs),
                            i: abs
                        },
                        done: false
                    };
                } else {
                    return { value: undefined, done: true };
                }
            }
        }
    }
}
