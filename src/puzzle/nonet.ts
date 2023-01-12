export namespace Nonet {
    export const SIDE_LENGTH: number = 3;

    export function indexOf(row: number, col: number) {
        return Math.floor(row / Nonet.SIDE_LENGTH) * Nonet.SIDE_LENGTH + Math.floor(col / Nonet.SIDE_LENGTH);
    }
}
