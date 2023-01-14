export class Nonet {
    static readonly SIDE_LENGTH = 3;

    private constructor() {
        //
    }

    static indexOf(row: number, col: number) {
        return Math.floor(row / Nonet.SIDE_LENGTH) * Nonet.SIDE_LENGTH + Math.floor(col / Nonet.SIDE_LENGTH);
    }
}
