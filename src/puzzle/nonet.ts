export class Nonet {
    static readonly SIDE_LENGTH: number = 3;

    static indexOf(row: number, col: number) {
        return Math.floor(row / Nonet.SIDE_LENGTH) * Nonet.SIDE_LENGTH + Math.floor(col / Nonet.SIDE_LENGTH);
    }

    private constructor() {
        throw new TypeError('Nonet is not constructable');
    }
}
