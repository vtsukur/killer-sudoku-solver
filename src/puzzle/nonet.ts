export class Nonet {
    static SIDE_LENGTH = 3;

    static indexOf(row: number, col: number) {
        return Math.floor(row / Nonet.SIDE_LENGTH) * Nonet.SIDE_LENGTH + Math.floor(col / Nonet.SIDE_LENGTH);
    }
}
